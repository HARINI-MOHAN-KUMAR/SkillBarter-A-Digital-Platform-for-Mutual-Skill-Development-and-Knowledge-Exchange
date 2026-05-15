from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from config import GEMINI_API_KEY, GROQ_API_KEY
import os

ai_bp = Blueprint("ai", __name__)


def call_ai(messages: list, fallback: str) -> str:    
    import requests

    if GEMINI_API_KEY and not GEMINI_API_KEY.startswith("your-"):
        try:
            prompt = "\n".join([f"{m.get('role', 'user')}: {m.get('content', '')}" for m in messages])
            data = {"contents": [{"parts": [{"text": prompt}]}]}
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}"
            
            response = requests.post(url, json=data)
            response_json = response.json()
            if "candidates" in response_json:
                return response_json["candidates"][0]["content"]["parts"][0]["text"].strip()
            else:
                print(f"Gemini API error: {response_json}")
        except Exception as e:
            print(f"Gemini AI error: {e}")
            pass
            
    if GROQ_API_KEY and not GROQ_API_KEY.startswith("your-"):
        try:
            headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            }
            data = {
                "model": "llama-3.1-8b-instant",
                "messages": messages,
                "max_tokens": 300,
                "temperature": 0.7
            }
            response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=data)
            response_json = response.json()
            if "choices" in response_json:
                return response_json["choices"][0]["message"]["content"].strip()
            else:
                print(f"Groq API error: {response_json}")
        except Exception as e:
            print(f"Groq AI error: {e}")
            pass

    return fallback


@ai_bp.route("/suggest-skills", methods=["POST"])
@jwt_required()
def suggest_skills():
    data = request.get_json(silent=True) or {}
    current_skills = data.get("current_skills", [])
    skills_str = ", ".join(current_skills) if current_skills else "general knowledge"
    result = call_ai(
        [{"role": "user", "content": f"Given these skills a user knows: {skills_str}. Suggest 5 related skills they could also teach on a skill-barter platform. Return ONLY a JSON array of skill name strings, e.g. [\"Skill1\", \"Skill2\"]"}],
        '["Communication", "Time Management", "Problem Solving", "Critical Thinking", "Creativity"]',
    )
    try:
        import json
        suggestions = json.loads(result)
    except Exception:
        suggestions = [s.strip().strip('"') for s in result.strip("[]").split(",")]
    return jsonify({"suggestions": suggestions[:5]}), 200


@ai_bp.route("/generate-bio", methods=["POST"])
@jwt_required()
def generate_bio():
    data = request.get_json(silent=True) or {}
    name = data.get("name", "the user")
    teach = ", ".join(data.get("skills_teach", [])) or "various skills"
    learn = ", ".join(data.get("skills_learn", [])) or "new things"
    result = call_ai(
        [{"role": "user", "content": f"Write a friendly 2-sentence profile bio for a skill exchange platform user named {name} who teaches {teach} and wants to learn {learn}. Be warm, concise, and authentic. Return only the bio text, no quotes."}],
        f"Hi, I'm {name}! I love sharing my knowledge of {teach} and I'm eager to learn {learn} from amazing people in this community.",
    )
    return jsonify({"bio": result}), 200


@ai_bp.route("/match-reason", methods=["POST"])
@jwt_required()
def match_reason():
    data = request.get_json(silent=True) or {}
    user_a = data.get("user_a", {})
    user_b = data.get("user_b", {})
    a_name = user_a.get("name", "You")
    b_name = user_b.get("name", "them")
    a_teach = ", ".join(user_a.get("skills_teach", []))
    a_learn = ", ".join(user_a.get("skills_learn", []))
    b_teach = ", ".join(user_b.get("skills_teach", []))
    b_learn = ", ".join(user_b.get("skills_learn", []))
    result = call_ai(
        [{"role": "user", "content": f"{a_name} teaches {a_teach} and wants to learn {a_learn}. {b_name} teaches {b_teach} and wants to learn {b_learn}. In one sentence, explain why they are a great match for skill exchange. Be specific and concise."}],
        f"You and {b_name} have highly complementary skills that make for a perfect knowledge exchange.",
    )
    return jsonify({"reason": result}), 200


@ai_bp.route("/icebreaker", methods=["POST"])
@jwt_required()
def icebreaker():
    data = request.get_json(silent=True) or {}
    my_skills = ", ".join(data.get("my_skills", []))
    their_skills = ", ".join(data.get("their_skills", []))
    their_name = data.get("their_name", "them")
    result = call_ai(
        [{"role": "user", "content": f"Write a friendly opening message to send to {their_name} on a skill-barter platform. I know {my_skills}. They know {their_skills}. Keep it under 2 sentences, warm and specific. Return only the message text."}],
        f"Hey {their_name}! I noticed we have some great skills to exchange — I'd love to connect and learn from each other! 🎯",
    )
    return jsonify({"message": result}), 200


@ai_bp.route("/skill-roadmap", methods=["POST"])
@jwt_required()
def skill_roadmap():
    data = request.get_json(silent=True) or {}
    skill = data.get("skill", "the skill")
    level = data.get("current_level", "beginner")
    result = call_ai(
        [{"role": "user", "content": f"Create a 4-week learning roadmap for someone at {level} level wanting to learn {skill}. Format as a JSON array of 4 strings, one per week. Example: [\"Week 1: ...\", \"Week 2: ...\", \"Week 3: ...\", \"Week 4: ...\"]"}],
        f'["Week 1: Learn the fundamentals of {skill}", "Week 2: Practice core exercises daily", "Week 3: Work on a small project", "Week 4: Get feedback and refine your skills"]',
    )
    try:
        import json
        roadmap = json.loads(result)
    except Exception:
        roadmap = [result]
    return jsonify({"roadmap": roadmap}), 200


@ai_bp.route("/chat-assist", methods=["POST"])
@jwt_required()
def chat_assist():
    data = request.get_json(silent=True) or {}
    history = data.get("conversation_history", [])
    context = data.get("context", "skill exchange")
    last_messages = history[-4:] if len(history) > 4 else history
    history_text = "\n".join([f"{m.get('sender_name','User')}: {m.get('content','')}" for m in last_messages])
    result = call_ai(
        [{"role": "user", "content": f"This is a conversation on a {context} platform:\n{history_text}\n\nSuggest a helpful, friendly reply to continue the conversation. Keep it under 2 sentences. Return only the reply text."}],
        "That sounds great! When would you be available to schedule our first session?",
    )
    return jsonify({"reply_suggestion": result}), 200
