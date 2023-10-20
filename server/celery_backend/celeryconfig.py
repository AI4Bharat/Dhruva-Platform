import os

from dotenv import load_dotenv

load_dotenv()


# Broker settings
broker_url = os.environ[
    "CELERY_BROKER_URL"
]