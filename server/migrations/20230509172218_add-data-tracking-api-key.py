from mongodb_migrations.base import BaseMigration


class Migration(BaseMigration):
    def upgrade(self):
        result = self.db.api_key.update_many({}, {"$set": {"data_tracking": False}})
        print(
            f"Acknowledged: {result.acknowledged}, Updated Count: {result.deleted_count}"
        )

    def downgrade(self):
        pass
