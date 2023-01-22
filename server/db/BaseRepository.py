from db.database import Database


class BaseRepository:
    def __init__(self, db: Database, collection_name: str) -> None:
        self.db = db
        self.collection = db[collection_name]

    # def find_by_id(self, id: str) -> object:
