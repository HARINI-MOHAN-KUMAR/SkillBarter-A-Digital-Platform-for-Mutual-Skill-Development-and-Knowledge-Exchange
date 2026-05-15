from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from config import users_col, messages_col
from bson import ObjectId
from datetime import datetime, timezone, timedelta

gamification_bp = Blueprint("gamification", __name__)

LEVELS = [
    {"level": 1, "min_xp": 0, "name": "Beginner"},
    {"level": 2, "min_xp": 201, "name": "Explorer"},
    {"level": 3, "min_xp": 501, "name": "Connector"},
    {"level": 4, "min_xp": 1001, "name": "Mentor"},
    {"level": 5, "min_xp": 2001, "name": "Master Barterer"},
]

ALL_BADGES = [
    {"id": "first_swap", "name": "First Swap", "icon": "🥇", "desc": "Complete your first skill exchange"},
    {"id": "top_mentor", "name": "Top Mentor", "icon": "🌟", "desc": "Teach 5+ people"},
    {"id": "chatterbox", "name": "Chatterbox", "icon": "💬", "desc": "Send 100+ messages"},
    {"id": "on_fire", "name": "On Fire", "icon": "🔥", "desc": "7-day login streak"},
    {"id": "perfect_match", "name": "Perfect Match", "icon": "🎯", "desc": "Get a 100% compatibility match"},
    {"id": "quick_starter", "name": "Quick Starter", "icon": "⚡", "desc": "Complete onboarding within 10 minutes"},
]


def get_level_for_xp(xp: int) -> dict:
    current = LEVELS[0]
    for lvl in LEVELS:
        if xp >= lvl["min_xp"]:
            current = lvl
    return current


def get_next_level_xp(xp: int) -> int:
    for lvl in LEVELS:
        if xp < lvl["min_xp"]:
            return lvl["min_xp"]
    return LEVELS[-1]["min_xp"]


def award_xp(uid: str, amount: int, event: str):
    """Award XP and update level automatically."""
    user = users_col.find_one({"_id": ObjectId(uid)})
    if not user:
        return
    new_xp = user.get("xp", 0) + amount
    new_level = get_level_for_xp(new_xp)["level"]
    users_col.update_one(
        {"_id": ObjectId(uid)},
        {"$set": {"xp": new_xp, "level": new_level}},
    )


def update_login_streak(uid: str):
    user = users_col.find_one({"_id": ObjectId(uid)})
    if not user:
        return
    last_active_str = user.get("last_active", "")
    streak = user.get("login_streak", 0)
    try:
        last_active = datetime.fromisoformat(last_active_str.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        diff = (now.date() - last_active.date()).days
        if diff == 1:
            streak += 1
        elif diff > 1:
            streak = 1
    except Exception:
        streak = 1

    users_col.update_one({"_id": ObjectId(uid)}, {"$set": {"login_streak": streak}})
    award_xp(uid, 20, "daily_login")

    if streak >= 7:
        _grant_badge(uid, "on_fire")


def _grant_badge(uid: str, badge_id: str):
    users_col.update_one({"_id": ObjectId(uid)}, {"$addToSet": {"badges": badge_id}})


def check_and_award_badges(uid: str):
    user = users_col.find_one({"_id": ObjectId(uid)})
    if not user:
        return

    msg_count = messages_col.count_documents({"sender_id": uid})
    if msg_count >= 100:
        _grant_badge(uid, "chatterbox")

    connections = user.get("connections", [])
    if len(connections) >= 5:
        _grant_badge(uid, "top_mentor")

    if user.get("onboarding_complete"):
        created_str = user.get("created_at", "")
        try:
            created = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
            if (datetime.now(timezone.utc) - created) <= timedelta(minutes=10):
                _grant_badge(uid, "quick_starter")
        except Exception:
            pass


@gamification_bp.route("/leaderboard", methods=["GET"])
@jwt_required()
def leaderboard():
    top_users = list(users_col.find({}, {"password": 0}).sort("xp", -1).limit(10))
    result = []
    for i, u in enumerate(top_users):
        result.append({
            "rank": i + 1,
            "id": str(u["_id"]),
            "name": u.get("name", ""),
            "avatar_url": u.get("avatar_url", ""),
            "xp": u.get("xp", 0),
            "level": u.get("level", 1),
            "level_name": get_level_for_xp(u.get("xp", 0))["name"],
            "badges": u.get("badges", []),
        })
    return jsonify({"leaderboard": result}), 200


@gamification_bp.route("/my-stats", methods=["GET"])
@jwt_required()
def my_stats():
    uid = get_jwt_identity()
    user = users_col.find_one({"_id": ObjectId(uid)})
    if not user:
        return jsonify({"error": "Not found"}), 404
    xp = user.get("xp", 0)
    level_info = get_level_for_xp(xp)
    next_xp = get_next_level_xp(xp)
    rank_result = list(users_col.find({}, {"xp": 1}).sort("xp", -1))
    my_rank = next((i + 1 for i, u in enumerate(rank_result) if str(u["_id"]) == uid), None)
    return jsonify({
        "xp": xp,
        "level": level_info["level"],
        "level_name": level_info["name"],
        "next_level_xp": next_xp,
        "badges": user.get("badges", []),
        "all_badges": ALL_BADGES,
        "rank": my_rank,
        "login_streak": user.get("login_streak", 0),
    }), 200


@gamification_bp.route("/badges", methods=["GET"])
def all_badges():
    return jsonify({"badges": ALL_BADGES}), 200
