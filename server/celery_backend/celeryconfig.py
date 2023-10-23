import os

from dotenv import load_dotenv

load_dotenv()


# Broker settings
broker_url = os.environ[
    "CELERY_BROKER_URL"
]

imports = (
    "celery_backend.tasks.log_data",
    "celery_backend.tasks.heartbeat",
    "celery_backend.tasks.upload_feedback_dump",
    "celery_backend.tasks.send_usage_email",
    "celery_backend.tasks.push_metrics",
)