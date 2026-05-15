import os
from pymongo import MongoClient
import certifi
from dotenv import load_dotenv
import time

load_dotenv()

uri = os.getenv("MONGO_URI")
print(f"Testing URI: {uri}")

start = time.time()
try:
    print("Connecting...")
    client = MongoClient(uri, serverSelectionTimeoutMS=10000, tlsCAFile=certifi.where())
    client.admin.command("ping")
    print(f"Success in {time.time() - start:.2f} seconds!")
except Exception as e:
    print(f"Failed in {time.time() - start:.2f} seconds: {e}")
