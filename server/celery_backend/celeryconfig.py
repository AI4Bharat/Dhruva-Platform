import os

from dotenv import load_dotenv

load_dotenv(override=True)


# Broker settings
broker_url = os.environ[
    "CELERY_BROKER_URL"
]  # "pyamqp://admin:admin@rabbithost:5672/dhruva_host"

# List of modules to import when the Celery worker starts.
imports = (
    "celery_backend.tasks.log_data",
    "celery_backend.tasks.heartbeat",
    "celery_backend.tasks.upload_feedback_dump",
)
