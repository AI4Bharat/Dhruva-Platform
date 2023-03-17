import json
from pymongo.database import Database


COLLECTIONS_LIST = [
    {
        "name": "service",
        "path": "/src/./db/fixtures/services_registry.json"
    },
    {
        "name": "model",
        "path": "/src/./db/fixtures/models_registry.json"
    },
    {
        "name": "user",
    },
    {
        "name":"api_key",
        "path":"/src/./db/fixtures/api_key_registry.json"
    },
    {
        "name":"feedback"
    },
    {
        "name":"session"
    }
]

def seed_collection(db:Database):
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
            collection_instance.insert_many(collection['data'])
            print(f"Fixtures of {collection['name']} data inserted successfully!")