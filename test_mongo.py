import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(r"c:\Users\mhari\OneDrive\Desktop\mini_project_college\backend\.env")
uri = os.getenv("MONGO_URI")
print(f"Connecting to: {uri}")

try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    print("Pinging...")
    client.admin.command('ping')
    print("Ping successful!")
except Exception as e:
    print(f"Error: {e}")
