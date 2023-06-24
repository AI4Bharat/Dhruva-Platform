from mongodb_migrations.base import BaseMigration


class Migration(BaseMigration):
    """
    Currently some of the feedback timestamps stored in the db are in seconds,
    and the remaining are in milliseconds. 

    This migration converts all the timestamps in milliseconds to seconds.
    """

    def upgrade(self):
        result = self.db.feedback.update_many(
            {"feedbackTimeStamp": {"$gt": 9999999999}},
            {"$mul": {"feedbackTimeStamp": 0.001}},
        )
        print(
            f"Acknowledged: {result.acknowledged}, Updated Count: {result.modified_count}"
        )

    def downgrade(self):
        pass
