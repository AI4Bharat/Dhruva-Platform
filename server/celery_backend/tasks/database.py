""" Database helper functions"""
import pymongo


def get_db_client(database_name: str) -> pymongo.MongoClient:
    """ Returns a MongoDB client """
    client = pymongo.MongoClient("mongodb://dhruva-mongo-host:27017", connect=True)
    if database_name == "dhruva":
        return client.dhruva
    return client.api_key
