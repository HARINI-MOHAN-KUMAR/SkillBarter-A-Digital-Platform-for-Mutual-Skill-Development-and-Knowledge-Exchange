from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from config import users_col
from bson import ObjectId
import math

matching_bp = Blueprint("matching", __name__)


def tokenize(skills: list) -> set:
    """Lowercase and tokenize a list of skill strings into individual words."""
    tokens = set()
    for skill in skills:
        for word in skill.lower().replace("-", " ").split():
            if len(word) > 2:
                tokens.add(word)
    return tokens


def jaccard(set_a: set, set_b: set) -> float:
    """Jaccard similarity between two sets."""
    if not set_a or not set_b:
        return 0.0
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    return intersection / union if union else 0.0


def overlap_score(set_a: set, set_b: set) -> float:
    """Overlap coefficient — how much of set_a appears in set_b."""
    if not set_a or not set_b:
        return 0.0
    return len(set_a & set_b) / min(len(set_a), len(set_b))


def compute_match_score(my_learn: list, my_teach: list,
                         their_teach: list, their_learn: list) -> float:
    """
    Compute bidirectional match score:
    - How well their_teach covers my_learn (I can learn from them)
    - How well my_teach covers their_learn (they can learn from me)
    Returns a 0–1 score.
    """
    my_learn_t = tokenize(my_learn)
    my_teach_t = tokenize(my_teach)
    their_teach_t = tokenize(their_teach)
    their_learn_t = tokenize(their_learn)

    scores = []

    # They teach what I want to learn
    if my_learn_t and their_teach_t:
        j = jaccard(my_learn_t, their_teach_t)
        o = overlap_score(my_learn_t, their_teach_t)
        scores.append((j + o) / 2)

    # I teach what they want to learn
    if my_teach_t and their_learn_t:
        j = jaccard(my_teach_t, their_learn_t)
        o = overlap_score(my_teach_t, their_learn_t)
        scores.append((j + o) / 2)

    if not scores:
        return 0.0

    return sum(scores) / len(scores)




@matching_bp.route("/", methods=["GET"])
@jwt_required()
def get_matches():
    uid = get_jwt_identity()
    current_user = users_col.find_one({"_id": ObjectId(uid)})

    if not current_user:
        return jsonify({"error": "User not found"}), 404

    my_learn = current_user.get("skills_learn", [])
    my_teach = current_user.get("skills_teach", [])

    if not my_learn and not my_teach:
        return jsonify({
            "matches": [],
            "message": "Add skills to your profile to get matches"
        }), 200

    all_users = list(users_col.find({"_id": {"$ne": ObjectId(uid)}}))

    if not all_users:
        return jsonify({"matches": []}), 200

    matches = []
    for user in all_users:
        their_teach = user.get("skills_teach", [])
        their_learn = user.get("skills_learn", [])

        if not their_teach and not their_learn:
            continue

        raw_score = compute_match_score(my_learn, my_teach, their_teach, their_learn)

        if raw_score > 0.01:
            matches.append({
                "user": {
                    "id": str(user["_id"]),
                    "name": user.get("name", ""),
                    "bio": user.get("bio", ""),
                    "avatar_url": user.get("avatar_url", ""),
                    "xp": user.get("xp", 0),
                    "level": user.get("level", 1),
                    "badges": user.get("badges", []),
                    "skills_teach": their_teach,
                    "skills_learn": their_learn,
                },
                "score": round(raw_score * 100, 1)
            })

    matches.sort(key=lambda x: x["score"], reverse=True)
    return jsonify({"matches": matches[:20]}), 200
