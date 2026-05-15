import os
import sys
from pathlib import Path

# Ensure backend directory is first on the path
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv
load_dotenv(BACKEND_DIR / ".env")

from app import create_app, socketio

if __name__ == "__main__":
    app = create_app()
    socketio.run(
        app,
        allow_unsafe_werkzeug=True,
        debug=os.getenv("FLASK_DEBUG", "false").lower() in ("1", "true", "yes"),
        host=os.getenv("FLASK_HOST", "0.0.0.0"),
        port=int(os.getenv("FLASK_PORT", "5001")),
    )
