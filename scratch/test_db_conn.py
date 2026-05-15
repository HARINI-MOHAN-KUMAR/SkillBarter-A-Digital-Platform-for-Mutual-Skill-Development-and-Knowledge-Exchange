import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv('backend/.env')
uri = os.getenv('MONGO_URI')
print(f"Testing URI: {uri}")

try:
    ca = certifi.where()
    client = MongoClient(uri, tlsCAFile=ca, serverSelectionTimeoutMS=5000)
    # The ping command is cheap and does not require auth
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(f"Connection failed: {e}")
