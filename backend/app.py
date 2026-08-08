import os
import traceback

from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

load_dotenv()

socketio = SocketIO()


def create_app():
    app = Flask(__name__)

    # JWT configuration
    app.config["JWT_SECRET_KEY"] = os.getenv(
        "JWT_SECRET_KEY",
        "fallback-secret"
    )
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False

    # CORS configuration
    cors_origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173"
    )

    CORS(
        app,
        origins=cors_origins,
        supports_credentials=True
    )

    # JWT initialization
    JWTManager(app)

    # SocketIO initialization
    socketio.init_app(
        app,
        cors_allowed_origins="*",
        async_mode="threading",
        transports=["polling"],
        logger=False,
        engineio_logger=False,
    )

    # Import routes
    from routes.auth import auth_bp
    from routes.users import users_bp
    from routes.skills import skills_bp
    from routes.matches import matches_bp
    from routes.chat import chat_bp
    from routes.gamification import gamification_bp
    from routes.ai_features import ai_bp

    # Register blueprints
    app.register_blueprint(
        auth_bp,
        url_prefix="/api/auth"
    )

    app.register_blueprint(
        users_bp,
        url_prefix="/api/users"
    )

    app.register_blueprint(
        skills_bp,
        url_prefix="/api/skills"
    )

    app.register_blueprint(
        matches_bp,
        url_prefix="/api/matches"
    )

    app.register_blueprint(
        chat_bp,
        url_prefix="/api/chat"
    )

    app.register_blueprint(
        gamification_bp,
        url_prefix="/api/gamification"
    )

    app.register_blueprint(
        ai_bp,
        url_prefix="/api/ai"
    )

    # Import socket event handlers
    import sockets  # noqa: F401

    # Global error handler
    @app.errorhandler(Exception)
    def handle_exception(e):
        traceback.print_exc()

        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

    # Root API route
    @app.route("/")
    def index():
        return jsonify({
            "status": "SkillBarter API running",
            "version": "2.0"
        })

    return app


# Create the Flask application for Vercel
# This MUST be outside the __main__ block.
app = create_app()


# Local development
if __name__ == "__main__":
    socketio.run(
        app,
        allow_unsafe_werkzeug=True,
        debug=os.getenv(
            "FLASK_DEBUG",
            "false"
        ).lower() in ("1", "true", "yes"),
        host=os.getenv(
            "FLASK_HOST",
            "0.0.0.0"
        ),
        port=int(
            os.getenv(
                "FLASK_PORT",
                "5000"
            )
        ),
    )
