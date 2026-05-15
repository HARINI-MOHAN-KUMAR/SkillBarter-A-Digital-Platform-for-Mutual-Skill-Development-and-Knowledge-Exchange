from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from config import users_col
from bson import ObjectId
from routes.gamification import award_xp, check_and_award_badges

users_bp = Blueprint("users", __name__)


def serialize_user(user):
    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "bio": user.get("bio", ""),
        "avatar_url": user.get("avatar_url", ""),
        "skills_teach": user.get("skills_teach", []),
        "skills_learn": user.get("skills_learn", []),
        "xp": user.get("xp", 0),
        "level": user.get("level", 1),
        "badges": user.get("badges", []),
        "connections": user.get("connections", []),
        "onboarding_complete": user.get("onboarding_complete", False),
        "created_at": user.get("created_at", ""),
    }


def is_profile_complete(user):
    return (
        bool(user.get("name"))
        and bool(user.get("bio"))
        and bool(user.get("skills_teach"))
        and bool(user.get("skills_learn"))
    )


@users_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    uid = get_jwt_identity()
    user = users_col.find_one({"_id": ObjectId(uid)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(serialize_user(user)), 200


@users_bp.route("/me", methods=["PATCH"])
@jwt_required()
def update_me():
    uid = get_jwt_identity()
    data = request.get_json(silent=True) or {}

    allowed = ["name", "bio", "avatar_url", "skills_teach", "skills_learn", "onboarding_complete"]
    update = {k: v for k, v in data.items() if k in allowed}

    was_complete = False
    user_before = users_col.find_one({"_id": ObjectId(uid)})
    if user_before:
        was_complete = is_profile_complete(user_before)

    users_col.update_one({"_id": ObjectId(uid)}, {"$set": update})
    user = users_col.find_one({"_id": ObjectId(uid)})

    # Award XP for profile completion (first time only)
    if not was_complete and is_profile_complete(user):
        award_xp(uid, 50, "profile_complete")

    check_and_award_badges(uid)
    user = users_col.find_one({"_id": ObjectId(uid)})
    return jsonify(serialize_user(user)), 200


@users_bp.route("/<user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    try:
        user = users_col.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return jsonify({"error": "Invalid user ID"}), 400
    if not user:
        return jsonify({"error": "User not found"}), 404
    # Return public profile (no email/password)
    return jsonify({
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "bio": user.get("bio", ""),
        "avatar_url": user.get("avatar_url", ""),
        "skills_teach": user.get("skills_teach", []),
        "skills_learn": user.get("skills_learn", []),
        "xp": user.get("xp", 0),
        "level": user.get("level", 1),
        "badges": user.get("badges", []),
    }), 200
