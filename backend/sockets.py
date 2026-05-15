from app import socketio
from config import messages_col, connections_col, users_col
from datetime import datetime, timezone
from bson import ObjectId


def _get_room_id(user_a: str, user_b: str) -> str:
    return "_".join(sorted([user_a, user_b]))


@socketio.on("join_room")
def handle_join(data):
    from flask_socketio import join_room, emit
    room = data.get("room")
    user_id = data.get("user_id")
    if room:
        join_room(room)
        emit("user_joined", {"user_id": user_id, "room": room}, room=room)


@socketio.on("send_message")
def handle_message(data):
    from flask_socketio import emit
    from routes.gamification import award_xp, check_and_award_badges

    room_id = data.get("room")
    sender_id = data.get("sender_id")
    sender_name = data.get("sender_name")
    content = data.get("content", "").strip()

    if not content or not room_id or not sender_id:
        return

    msg = {
        "room_id": room_id,
        "sender_id": sender_id,
        "sender_name": sender_name,
        "content": content,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "read": False,
    }
    result = messages_col.insert_one(msg)
    msg["_id"] = str(result.inserted_id)

    # XP: every 10 messages +10 XP
    msg_count = messages_col.count_documents({"sender_id": sender_id})
    if msg_count % 10 == 0:
        award_xp(sender_id, 10, "messages_milestone")

    # XP: first message in a new chat room +30 XP
    if msg_count == 1:
        award_xp(sender_id, 30, "first_message")

    # Badges check
    check_and_award_badges(sender_id)

    emit("receive_message", msg, room=room_id)


@socketio.on("typing")
def handle_typing(data):
    from flask_socketio import emit
    room = data.get("room")
    user_name = data.get("user_name")
    is_typing = data.get("is_typing", False)
    emit("typing_indicator", {"user_name": user_name, "is_typing": is_typing}, room=room, include_self=False)


@socketio.on("mark_read")
def handle_mark_read(data):
    room_id = data.get("room")
    user_id = data.get("user_id")
    if room_id and user_id:
        messages_col.update_many(
            {"room_id": room_id, "sender_id": {"$ne": user_id}, "read": False},
            {"$set": {"read": True}},
        )


@socketio.on("disconnect")
def handle_disconnect():
    pass
