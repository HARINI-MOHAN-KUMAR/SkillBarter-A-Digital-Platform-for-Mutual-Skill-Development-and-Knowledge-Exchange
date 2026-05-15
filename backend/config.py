import os
import certifi
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/skillbarter")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-secret")

try:
    import mongomock
except ImportError:
    mongomock = None


def _create_client(uri):
    return MongoClient(uri, serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where())


client = None

try:
    print(f"Connecting to MongoDB (Remote)...")
    # Increased timeout for slow DNS/networks
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=30000, tlsCAFile=certifi.where())
    client.admin.command("ping")
    print(f"Connected to MongoDB successfully.")
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    try:
        print("Trying local MongoDB fallback (localhost:27017)...")
        client = MongoClient("mongodb://localhost:27017/skillbarter", serverSelectionTimeoutMS=2000)
        client.admin.command("ping")
        print("Connected to local MongoDB fallback")
    except Exception as fallback_error:
        print(f"Local MongoDB fallback failed: {fallback_error}")
        if mongomock is not None:
            print("Using in-memory MongoDB mock (mongomock). Data will NOT persist.")
            client = mongomock.MongoClient()
        else:
            print("CRITICAL: No MongoDB connection available.")
            raise

if client is None:
    raise RuntimeError("Unable to connect to MongoDB.")



db = client["skillbarter"]

# Collections
users_col = db["users"]
messages_col = db["messages"]
connections_col = db["connections"]
sessions_col = db["sessions"]

# Indexes
try:
    users_col.create_index("email", unique=True)
    messages_col.create_index("room_id")
    connections_col.create_index([("user_a", 1), ("user_b", 1)])
except PyMongoError as e:
    print(f"Index warning: {e}")
