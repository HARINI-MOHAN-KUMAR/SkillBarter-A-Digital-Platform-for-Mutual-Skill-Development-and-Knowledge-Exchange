import os, sys
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(r"backend\.env")
uri = os.getenv("MONGO_URI")
if "&" in uri or "?" in uri:
    uri += "&tlsAllowInvalidCertificates=true"
else:
    uri += "?tlsAllowInvalidCertificates=true"

print(f"Testing {uri}")
try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("Success!")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
