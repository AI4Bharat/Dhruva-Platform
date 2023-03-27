import json
import datetime
from pymongo.database import Database


COLLECTIONS_LIST = [
    {
        "name": "service",
        "path": "./db/fixtures/services_registry.json"
    },
    {
        "name": "model",
        "path": "./db/fixtures/models_registry.json"
    },
    {
        "name": "user",
        "path": "./db/fixtures/users_registry.json"
    },
    {
        "name":"api_key",
        "path":"./db/fixtures/api_key_registry.json"
    },
    {
        "name":"feedback"
    },
    {
        "name":"session"
    }
]

def seed_collection(db:Database):
    default_user_id = None
    for collection in COLLECTIONS_LIST:
        if collection['name'] not in db.list_collection_names():
            db.create_collection(collection['name'])
            print("Collection created successfully!")
        else:
            print("Collection already exists. Skipping creation.")

        collection_instance = db[collection['name']]

        if 'path' in collection and collection['path'] is not None and collection_instance.estimated_document_count() == 0:
            with open(collection['path']) as f:
                collection['data'] = json.load(f)

            if collection["name"] == "user":
                default_user_id = collection_instance.insert_one(collection['data']).inserted_id
                continue

            elif collection["name"] == "api_key" and default_user_id:
                for i, key in enumerate(collection['data']):
                    collection['data'][i].update({
                        "masked_key": key["api_key"][:4] + (len(key["api_key"]) - 8) * "*" + key["api_key"][-4:],
                        "active": True,
                        "user_id": default_user_id,
                        "type": "INFERENCE",
                        "usage": 0,
                        "hits": 0,
                        "services": [],
                        "created_timestamp": datetime.datetime.now()
                    })

            collection_instance.insert_many(collection['data'])
            print(f"Fixtures of {collection['name']} data inserted successfully!")
