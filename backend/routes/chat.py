from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from config import messages_col, users_col
from bson import ObjectId

chat_bp = Blueprint("chat", __name__)


def _room_id(a: str, b: str) -> str:
    return "_".join(sorted([a, b]))


@chat_bp.route("/rooms", methods=["GET"])
@jwt_required()
def get_rooms():
    uid = get_jwt_identity()
    user = users_col.find_one({"_id": ObjectId(uid)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    connections = user.get("connections", [])
    rooms = []
    for conn_id in connections:
        conn_user = users_col.find_one({"_id": ObjectId(conn_id)})
        if not conn_user:
            continue
        room_id = _room_id(uid, conn_id)
        last_msg = messages_col.find_one(
            {"room_id": room_id}, sort=[("timestamp", -1)]
        )
        unread_count = messages_col.count_documents(
            {"room_id": room_id, "sender_id": conn_id, "read": False}
        )
        rooms.append({
            "room_id": room_id,
            "partner": {
                "id": conn_id,
                "name": conn_user.get("name", ""),
                "avatar_url": conn_user.get("avatar_url", ""),
            },
            "last_message": {
                "content": last_msg.get("content", "") if last_msg else "",
                "timestamp": last_msg.get("timestamp", "") if last_msg else "",
                "sender_id": last_msg.get("sender_id", "") if last_msg else "",
            } if last_msg else None,
            "unread_count": unread_count,
        })

    # Sort by last message timestamp desc
    rooms.sort(key=lambda r: r["last_message"]["timestamp"] if r["last_message"] else "", reverse=True)
    return jsonify({"rooms": rooms}), 200


@chat_bp.route("/<room_id>/messages", methods=["GET"])
@jwt_required()
def get_messages(room_id):
    uid = get_jwt_identity()
    limit = int(request.args.get("limit", 50))
    skip = int(request.args.get("skip", 0))

    msgs = list(
        messages_col.find({"room_id": room_id})
        .sort("timestamp", 1)
        .skip(skip)
        .limit(limit)
    )
    for m in msgs:
        m["_id"] = str(m["_id"])

    # Mark as read
    messages_col.update_many(
        {"room_id": room_id, "sender_id": {"$ne": uid}, "read": False},
        {"$set": {"read": True}},
    )
    return jsonify({"messages": msgs}), 200
