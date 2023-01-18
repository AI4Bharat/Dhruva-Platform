import os
import json


class Database:
    def __init__(self) -> None:
        # currently loads registries from the file
        # in the future when the db is implemented:
        #   - connect to db and get database object
        #   - optionally create collections

        self.db = dict()

        base_path = os.path.dirname(__file__)
        with open(base_path + "/fixtures/models_registry.json") as fhand:
            models_registry = json.loads(fhand.read())
            self.db["model"] = models_registry

        with open(base_path + "/fixtures/services_registry.json") as fhand:
            services_registry = json.loads(fhand.read())
            self.db["service"] = services_registry

        with open(base_path + "/fixtures/api_key_registry.json") as fhand:
            services_registry = json.loads(fhand.read())
            self.db["api_key"] = services_registry

    # this function is temporarily created until db is implemented
    def __getitem__(self, key: str):
        return self.db[key]

    # def load_collections(self):
    #     from .BaseRepository import BaseRepository

    #     collections = BaseRepository.__subclasses__()
    #     print(collections)
