from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from config import users_col
from bson import ObjectId

skills_bp = Blueprint("skills", __name__)


@skills_bp.route("/", methods=["GET"])
@jwt_required()
def get_skills():
    uid = get_jwt_identity()
    user = users_col.find_one({"_id": ObjectId(uid)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "skills_teach": user.get("skills_teach", []),
        "skills_learn": user.get("skills_learn", []),
        "skill_endorsements": user.get("skill_endorsements", {}),
    }), 200


@skills_bp.route("/endorse", methods=["POST"])
@jwt_required()
def endorse_skill():
    uid = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    target_user_id = data.get("user_id")
    skill = data.get("skill")

    if not target_user_id or not skill:
        return jsonify({"error": "user_id and skill are required"}), 400

    if uid == target_user_id:
        return jsonify({"error": "You cannot endorse your own skills"}), 400

    # Check if they are connected (optional, but good for "skill barter" context)
    user = users_col.find_one({"_id": ObjectId(uid)})
    if target_user_id not in user.get("connections", []):
         return jsonify({"error": "You can only endorse skills of users you are connected with"}), 403

    # Update endorsements
    # We store as: skill_endorsements: { "SkillName": [user_id1, user_id2] }
    field = f"skill_endorsements.{skill}"
    users_col.update_one(
        {"_id": ObjectId(target_user_id)},
        {"$addToSet": {field: uid}}
    )

    return jsonify({"message": "Skill endorsed successfully"}), 200


@skills_bp.route("/teach", methods=["POST"])
@jwt_required()
def add_teach_skill():
    uid = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    skill = data.get("skill", "").strip()
    if not skill:
        return jsonify({"error": "Skill is required"}), 400
    # Normalize: title case
    skill = skill.title()
    users_col.update_one({"_id": ObjectId(uid)}, {"$addToSet": {"skills_teach": skill}})
    user = users_col.find_one({"_id": ObjectId(uid)})
    return jsonify({"skills_teach": user.get("skills_teach", [])}), 200


@skills_bp.route("/teach/<path:skill>", methods=["DELETE"])
@jwt_required()
def remove_teach_skill(skill):
    uid = get_jwt_identity()
    users_col.update_one({"_id": ObjectId(uid)}, {"$pull": {"skills_teach": skill}})
    user = users_col.find_one({"_id": ObjectId(uid)})
    return jsonify({"skills_teach": user.get("skills_teach", [])}), 200


@skills_bp.route("/learn", methods=["POST"])
@jwt_required()
def add_learn_skill():
    uid = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    skill = data.get("skill", "").strip()
    if not skill:
        return jsonify({"error": "Skill is required"}), 400
    skill = skill.title()
    users_col.update_one({"_id": ObjectId(uid)}, {"$addToSet": {"skills_learn": skill}})
    user = users_col.find_one({"_id": ObjectId(uid)})
    return jsonify({"skills_learn": user.get("skills_learn", [])}), 200


@skills_bp.route("/learn/<path:skill>", methods=["DELETE"])
@jwt_required()
def remove_learn_skill(skill):
    uid = get_jwt_identity()
    users_col.update_one({"_id": ObjectId(uid)}, {"$pull": {"skills_learn": skill}})
    user = users_col.find_one({"_id": ObjectId(uid)})
    return jsonify({"skills_learn": user.get("skills_learn", [])}), 200
