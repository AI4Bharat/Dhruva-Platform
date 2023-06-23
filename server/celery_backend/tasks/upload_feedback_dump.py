import csv
import io
from datetime import datetime

from celery_backend.tasks.database import AppDatabase, LogDatastore
from module.services.model.feedback import Feedback

from ..celery_app import app
from . import constants

feedback_store = LogDatastore()


@app.task(name="upload.feedback.dump")
def upload_feedback_dump() -> None:
    """Uploads feedback dumps to cloud storage"""
    file = io.StringIO()
    csv_writer = csv.writer(file)
    app_db = AppDatabase()

    collection = app_db.get_collection("feedback")

    d = datetime.now()
    start_date = d.replace(
        month=d.month - 1, day=1, hour=0, minute=0, second=0, microsecond=0
    ).timestamp()
    end_date = d.replace(
        month=d.month, day=1, hour=0, minute=0, second=0, microsecond=0
    ).timestamp()
    query = {
        "feedbackTimeStamp": {"$gte": int(start_date), "$lt": int(end_date)},
    }

    for doc in collection.find(query):
        feedback = Feedback(**doc)
        csv_writer.writerow(feedback.to_export_row())

    file.seek(0)

    local_file_name = str(d.date()) + ".csv"
    blob_client = feedback_store.get_blob_client(
        container=constants.FEEDBACK_CONTAINER, blob=local_file_name
    )

    print("\nUploading to Azure Storage as blob:\n\t" + local_file_name)

    blob_client.upload_blob(file.read())
