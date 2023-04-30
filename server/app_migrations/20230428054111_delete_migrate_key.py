from mongodb_migrations.base import BaseMigration


class Migration(BaseMigration):
    def upgrade(self):
        result = self.db.api_key.delete_one({"name": "migration-test"})
        print(
            f"Acknowledged: {result.acknowledged}, Deleted Count: {result.deleted_count}"
        )
