from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from config import users_col, GOOGLE_CLIENT_ID
from bson import ObjectId
import bcrypt
import os
from datetime import datetime, timezone

auth_bp = Blueprint("auth", __name__)


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


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if users_col.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    now = datetime.now(timezone.utc).isoformat()
    user = {
        "name": name,
        "email": email,
        "password": hashed,
        "bio": "",
        "avatar_url": "",
        "skills_teach": [],
        "skills_learn": [],
        "xp": 0,
        "level": 1,
        "badges": [],
        "connections": [],
        "onboarding_complete": False,
        "google_id": None,
        "login_streak": 1,
        "last_active": now,
        "created_at": now,
    }
    result = users_col.insert_one(user)
    user["_id"] = result.inserted_id
    token = create_access_token(identity=str(result.inserted_id))
    return jsonify({"token": token, "user": serialize_user(user), "is_new": True}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = users_col.find_one({"email": email})
    if not user or not user.get("password"):
        return jsonify({"error": "Invalid email or password"}), 401
    if not bcrypt.checkpw(password.encode(), user["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    # Daily login streak XP
    from routes.gamification import award_xp, update_login_streak
    update_login_streak(str(user["_id"]))

    now = datetime.now(timezone.utc).isoformat()
    users_col.update_one({"_id": user["_id"]}, {"$set": {"last_active": now}})

    token = create_access_token(identity=str(user["_id"]))
    updated_user = users_col.find_one({"_id": user["_id"]})
    return jsonify({"token": token, "user": serialize_user(updated_user)}), 200


@auth_bp.route("/google", methods=["POST"])
def google_login():
    data = request.get_json(silent=True) or {}
    credential = data.get("credential", "")
    if not credential:
        return jsonify({"error": "Google credential is required"}), 400

    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        idinfo = id_token.verify_oauth2_token(
            credential, google_requests.Request(), GOOGLE_CLIENT_ID
        )
    except Exception as e:
        # If client ID not configured, allow in dev mode
        if not GOOGLE_CLIENT_ID or GOOGLE_CLIENT_ID == "your-google-oauth-client-id.apps.googleusercontent.com":
            return jsonify({"error": "Google Client ID not configured in backend .env"}), 503
        return jsonify({"error": f"Invalid Google token: {str(e)}"}), 401

    google_id = idinfo["sub"]
    email = idinfo.get("email", "").lower()
    name = idinfo.get("name", "")
    avatar_url = idinfo.get("picture", "")

    user = users_col.find_one({"$or": [{"google_id": google_id}, {"email": email}]})
    is_new = False

    if not user:
        is_new = True
        now = datetime.now(timezone.utc).isoformat()
        user_doc = {
            "name": name,
            "email": email,
            "password": None,
            "bio": "",
            "avatar_url": avatar_url,
            "skills_teach": [],
            "skills_learn": [],
            "xp": 0,
            "level": 1,
            "badges": [],
            "connections": [],
            "onboarding_complete": False,
            "google_id": google_id,
            "login_streak": 1,
            "last_active": now,
            "created_at": now,
        }
        result = users_col.insert_one(user_doc)
        user = users_col.find_one({"_id": result.inserted_id})
    else:
        users_col.update_one(
            {"_id": user["_id"]},
            {"$set": {"google_id": google_id, "avatar_url": avatar_url, "last_active": datetime.now(timezone.utc).isoformat()}},
        )
        from routes.gamification import update_login_streak
        update_login_streak(str(user["_id"]))
        user = users_col.find_one({"_id": user["_id"]})

    token = create_access_token(identity=str(user["_id"]))
    return jsonify({"token": token, "user": serialize_user(user), "is_new": is_new}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    uid = get_jwt_identity()
    user = users_col.find_one({"_id": ObjectId(uid)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(serialize_user(user)), 200
