from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from config import sessions_col, users_col, messages_col
from bson import ObjectId
from datetime import datetime

sessions_bp = Blueprint("sessions", __name__)

def serialize_session(s):
    return {
        "id": str(s["_id"]),
        "participants": s.get("participants", []),
        "skill": s.get("skill", ""),
        "status": s.get("status", "pending"),
        "created_at": s.get("created_at", ""),
        "requester_name": s.get("requester_name", ""),
        "target_name": s.get("target_name", "")
    }

@sessions_bp.route("/", methods=["POST"])
@jwt_required()
def create_session():
    uid = get_jwt_identity()
    data = request.get_json()
    target_id = data.get("target_id")
    skill = data.get("skill", "General Exchange")

    requester = users_col.find_one({"_id": ObjectId(uid)})
    target = users_col.find_one({"_id": ObjectId(target_id)})

    if not target:
        return jsonify({"error": "Target user not found"}), 404

    existing = sessions_col.find_one({
        "participants": {"$all": [uid, target_id]},
        "status": {"$in": ["pending", "accepted"]}
    })
    if existing:
        return jsonify({"error": "Session already exists", "session": serialize_session(existing)}), 409

    session = {
        "participants": [uid, target_id],
        "skill": skill,
        "status": "pending",
        "requester_id": uid,
        "requester_name": requester["name"],
        "target_name": target["name"],
        "created_at": datetime.utcnow().isoformat()
    }
    result = sessions_col.insert_one(session)
    session["_id"] = result.inserted_id
    return jsonify(serialize_session(session)), 201

@sessions_bp.route("/", methods=["GET"])
@jwt_required()
def get_sessions():
    uid = get_jwt_identity()
    raw = sessions_col.find({"participants": uid})
    return jsonify({"sessions": [serialize_session(s) for s in raw]}), 200

@sessions_bp.route("/<session_id>", methods=["PATCH"])
@jwt_required()
def update_session(session_id):
    uid = get_jwt_identity()
    data = request.get_json()
    status = data.get("status")

    if status not in ["accepted", "rejected", "completed"]:
        return jsonify({"error": "Invalid status"}), 400

    session = sessions_col.find_one({"_id": ObjectId(session_id)})
    if not session:
        return jsonify({"error": "Session not found"}), 404
    if uid not in session["participants"]:
        return jsonify({"error": "Unauthorized"}), 403

    sessions_col.update_one({"_id": ObjectId(session_id)}, {"$set": {"status": status}})

    # Award XP on completion
    if status == "completed":
        from routes.gamification import award_xp, check_and_award_badges
        for pid in session["participants"]:
            award_xp(pid, 50, "session_completed")
            check_and_award_badges(pid)

    session = sessions_col.find_one({"_id": ObjectId(session_id)})
    return jsonify(serialize_session(session)), 200

@sessions_bp.route("/<session_id>/messages", methods=["GET"])
@jwt_required()
def get_messages(session_id):
    uid = get_jwt_identity()
    session = sessions_col.find_one({"_id": ObjectId(session_id)})
    if not session or uid not in session["participants"]:
        return jsonify({"error": "Unauthorized"}), 403
    msgs = list(messages_col.find({"room": session_id}))
    for m in msgs:
        m["_id"] = str(m["_id"])
    return jsonify({"messages": msgs}), 200
