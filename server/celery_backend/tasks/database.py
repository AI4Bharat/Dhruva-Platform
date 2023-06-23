import os

import pymongo
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv
from pymongo.database import Database

load_dotenv(override=True)

db_clients = {
    # For some reason with the latest changes the quotes in the fields in .env are getting sent to python
    # Removing the quotes from the string in .env without removing them from the URL
    "app": pymongo.MongoClient(os.environ["APP_DB_CONNECTION_STRING"]),
}

if os.environ.get("LOG_REQUEST_RESPONSE_DATA_FLAG", None):
    db_clients["log"] = pymongo.MongoClient(os.environ["LOG_DB_CONNECTION_STRING"])


def AppDatabase() -> Database:
    mongo_db = db_clients["app"][os.environ["APP_DB_NAME"]]
    return mongo_db


def LogDatastore() -> BlobServiceClient:
    # mongo_db = db_clients["log"]["dhruva"]

    token_credential = DefaultAzureCredential()
    blob_service_client = BlobServiceClient(
        account_url=f'https://{os.environ.get("BLOB_STORE")}.blob.core.windows.net',
        credential=token_credential,
    )
    return blob_service_client
