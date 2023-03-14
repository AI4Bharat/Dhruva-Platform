from pymongo.database import Database

db_clients = dict()


def AppDatabase() -> Database:
    mongo_db = db_clients["app"]["dhruva"]
    return mongo_db


def LogDatabase() -> Database:
    mongo_db = db_clients["log"]["dhruva"]
    return mongo_db
