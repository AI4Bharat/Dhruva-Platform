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
