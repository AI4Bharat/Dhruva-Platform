import os
import json


class Database:

    __db = dict()

    def __init__(self) -> None:
        # currently loads registries from the file
        # in the future when the db is implemented:
        #   - connect to db and get database object
        #   - optionally create collections

        if self.__db != {}:
            return

        base_path = os.path.dirname(__file__)
        with open(base_path + "/fixtures/models_registry.json", encoding='utf8') as fhand:
            models_registry = json.loads(fhand.read())
            self.__db["model"] = models_registry

        with open(base_path + "/fixtures/services_registry.json", encoding='utf8') as fhand:
            services_registry = json.loads(fhand.read())
            self.__db["service"] = services_registry

        with open(base_path + "/fixtures/api_key_registry.json", encoding='utf8') as fhand:
            api_key_registry = json.loads(fhand.read())
            self.__db["api_key"] = api_key_registry

#     # this function is temporarily created until db is implemented
    def __getitem__(self, key: str):
        return self.__db[key]

    # def load_collections(self):
    #     from .BaseRepository import BaseRepository

    #     collections = BaseRepository.__subclasses__()
    #     print(collections)


import motor.motor_asyncio

MONGODB_MIN_POOL_SIZE = 1
MONGODB_MAX_POOL_SIZE = 10


def setup_db():
    return motor.motor_asyncio.AsyncIOMotorClient(
        "mongodb://dhruva-mongo-host:27017",
        minPoolSize=MONGODB_MIN_POOL_SIZE,
        maxPoolSize=MONGODB_MAX_POOL_SIZE,
    )

dhruva_client = setup_db()


def get_db_client():
    return dhruva_client["dhruva"]


async def setup_db_data():
    # Temp init data
    db = get_db_client()
    document = {
        "username": "username1",
        "password": "password1",
        "metadata": {},
    }
    result = await db.dhruva.insert_one(document)
    print(result.inserted_id)
    # await db.dhruva.create_index([('metering.api_keys.0.api_key_hash', "text")], name='metering_index', default_language='english')
    # await db.dhruva.create_index([('username', "text")], name='username_index', default_language='english')
    x = await db.dhruva.find_one({'username': "username1"})
    print(x, dir(x))

    api_document = {
        "api_key_name": "apikey 1",
        "api_key": "ae66a0b6-69de-4aaf-8fd1-aa07f8ec961b",
        "user": x["_id"]
    }
    result = await db.api_key.insert_one(api_document)
    x = await db.api_key.find_one({'api_key': "ae66a0b6-69de-4aaf-8fd1-aa07f8ec961b"})
    print(x)

    metering_document = {
        "api_key_hash": "ae66a0b6-69de-4aaf-8fd1-aa07f8ec961b",
        "services": [
            {
                "service_id": "ai4bharat/indictrans-fairseq-all-gpu--t4",
                "usage": 5
            }
        ],
        "total": 5
    }
    # result = await db.metering.insert_one(metering_document)
    # x = await db.metering.find_one({'api_key_hash': "ae66a0b6-69de-4aaf-8fd1-aa07f8ec961b"})
    # print(x)
