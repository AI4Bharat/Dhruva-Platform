from mongodb_migrations.base import BaseMigration


class Migration(BaseMigration):
    def upgrade(self):
        result = self.db.feedback.update_many(
            {"feedbackTimeStamp": {"$lte": 9999999999}},
            {"$mul": {"feedbackTimeStamp": 1000}},
        )
        print(
            f"Acknowledged: {result.acknowledged}, Updated Count: {result.modified_count}"
        )

    def downgrade(self):
        pass
