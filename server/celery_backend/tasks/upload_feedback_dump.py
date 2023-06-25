import csv
import io
from datetime import datetime

from celery_backend.tasks.database import AppDatabase, LogDatastore
from module.services.model.feedback import Feedback

from ..celery_app import app
from . import constants

feedback_store = LogDatastore()

app_db = AppDatabase()
feedback_collection = app_db.get_collection("feedback")

csv_headers = [
    "ObjectId",
    "Feedback Timestamp",
    "Feedback Language",
    "Pipeline Tasks",
    "Input Data",
    "Pipeline Response",
    "Suggested Pipeline Response",
    "Pipeline Feedback",
    "Task Feedback",
]


@app.task(name="upload.feedback.dump")
def upload_feedback_dump() -> None:
    """Uploads feedback dumps to cloud storage"""
    file = io.StringIO()
    csv_writer = csv.writer(file)

    csv_writer.writerow(csv_headers)

    d = datetime.now()

    start_month, start_year = (
        (d.month - 1, d.year) if d.month - 1 != 0 else (12, d.year - 1)
    )
    start_date = d.replace(
        year=start_year,
        month=start_month,
        day=1,
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    ).timestamp()

    end_date = d.replace(day=1, hour=0, minute=0, second=0, microsecond=0).timestamp()

    query = {
        "feedbackTimeStamp": {"$gte": int(start_date), "$lt": int(end_date)},
    }

    for doc in feedback_collection.find(query):
        feedback = Feedback(**doc)
        csv_writer.writerow(feedback.to_export_row())

    file.seek(0)

    local_file_name = str(d.date()) + ".csv"
    blob_client = feedback_store.get_blob_client(
        container=constants.FEEDBACK_CONTAINER, blob=local_file_name
    )

    print("\nUploading to Azure Storage as blob:\n\t" + local_file_name)

    blob_client.upload_blob(file.read())
