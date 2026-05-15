from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from config import users_col, connections_col
from bson import ObjectId
from datetime import datetime, timezone
from routes.gamification import award_xp, check_and_award_badges

matches_bp = Blueprint("matches", __name__)


def tokenize(skills: list) -> set:
    tokens = set()
    for skill in skills:
        for word in str(skill).lower().replace("-", " ").split():
            if len(word) > 2:
                tokens.add(word)
    return tokens


def compute_match_score(my_teach, my_learn, their_teach, their_learn):
    """
    +40 if they teach what I want to learn
    +40 if I teach what they want to learn
    +20 for each overlapping skill word
    """
    score = 0
    matched_skills = []

    my_teach_t = tokenize(my_teach)
    my_learn_t = tokenize(my_learn)
    their_teach_t = tokenize(their_teach)
    their_learn_t = tokenize(their_learn)

    # They teach what I want to learn
    for skill in their_teach:
        skill_tokens = tokenize([skill])
        if skill_tokens & my_learn_t:
            score += 40
            matched_skills.append({"skill": skill, "direction": "they_teach"})

    # I teach what they want to learn
    for skill in my_teach:
        skill_tokens = tokenize([skill])
        if skill_tokens & their_learn_t:
            score += 40
            matched_skills.append({"skill": skill, "direction": "i_teach"})

    # Overlapping skill categories
    overlap = my_teach_t & their_teach_t
    score += len(overlap) * 20

    return min(score, 100), matched_skills


def generate_reason(matched_skills, their_name):
    if not matched_skills:
        return f"You and {their_name} have complementary skill interests."
    reasons = []
    for m in matched_skills[:2]:
        if m["direction"] == "they_teach":
            reasons.append(f"{their_name} teaches {m['skill']} which you want to learn")
        else:
            reasons.append(f"You teach {m['skill']} which {their_name} wants to learn")
    return " · ".join(reasons) + "."


@matches_bp.route("/", methods=["GET"])
@jwt_required()
def get_matches():
    uid = get_jwt_identity()
    current_user = users_col.find_one({"_id": ObjectId(uid)})
    if not current_user:
        return jsonify({"error": "User not found"}), 404

    my_teach = current_user.get("skills_teach", [])
    my_learn = current_user.get("skills_learn", [])
    my_connections = current_user.get("connections", [])

    if not my_teach and not my_learn:
        return jsonify({"matches": [], "message": "Add skills to get matches"}), 200

    all_users = list(users_col.find({
        "_id": {"$ne": ObjectId(uid)},
        "$or": [{"skills_teach": {"$ne": []}}, {"skills_learn": {"$ne": []}}],
    }))

    matches = []
    for user in all_users:
        their_id = str(user["_id"])
        their_teach = user.get("skills_teach", [])
        their_learn = user.get("skills_learn", [])

        score, matched_skills = compute_match_score(my_teach, my_learn, their_teach, their_learn)
        if score <= 0:
            continue

        is_connected = their_id in my_connections
        matches.append({
            "user": {
                "id": their_id,
                "name": user.get("name", ""),
                "bio": user.get("bio", ""),
                "avatar_url": user.get("avatar_url", ""),
                "skills_teach": their_teach,
                "skills_learn": their_learn,
                "skill_endorsements": user.get("skill_endorsements", {}),
                "xp": user.get("xp", 0),
                "level": user.get("level", 1),
                "badges": user.get("badges", []),
            },
            "score": score,
            "matched_skills": matched_skills,
            "reason": generate_reason(matched_skills, user.get("name", "them")),
            "is_connected": is_connected,
        })

    matches.sort(key=lambda x: x["score"], reverse=True)

    # Check for perfect match badge
    if matches and matches[0]["score"] >= 100:
        check_and_award_badges(uid)

    return jsonify({"matches": matches[:20]}), 200


@matches_bp.route("/connect", methods=["POST"])
@jwt_required()
def connect():
    uid = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    target_id = data.get("target_id")

    if not target_id:
        return jsonify({"error": "target_id is required"}), 400

    target = users_col.find_one({"_id": ObjectId(target_id)})
    if not target:
        return jsonify({"error": "User not found"}), 404

    current_user = users_col.find_one({"_id": ObjectId(uid)})
    if target_id in current_user.get("connections", []):
        return jsonify({"message": "Already connected"}), 200

    users_col.update_one({"_id": ObjectId(uid)}, {"$addToSet": {"connections": target_id}})
    users_col.update_one({"_id": ObjectId(target_id)}, {"$addToSet": {"connections": uid}})

    # XP for first connection
    if len(current_user.get("connections", [])) == 0:
        award_xp(uid, 100, "first_connection")

    check_and_award_badges(uid)

    return jsonify({"message": "Connected successfully", "target_id": target_id}), 200
