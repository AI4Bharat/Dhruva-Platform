from mongodb_migrations.base import BaseMigration


class Migration(BaseMigration):
    def upgrade(self):
        for model in self.db.model.find():
            task_type = model["task"]["type"]
            result = self.db.service.update_one(
                {"modelId": model["modelId"]}, {"$set": {"task.type": task_type}}
            )

            print(model["modelId"])
            print(
                f"Acknowledged: {result.acknowledged}, Updated Count: {result.modified_count}"
            )

    def downgrade(self):
        pass
