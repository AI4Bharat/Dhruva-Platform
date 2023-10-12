import os

from dotenv import load_dotenv

load_dotenv()


# RabbitMQ management api
broker_api = os.environ[
    "CELERY_FLOWER_BROKER_API"
]  # "http://admin:admin@localhost:15672/api/"

basic_auth = ["admin:admin"]
address = os.environ["CELERY_FLOWER_ADDRESS"]  # "0.0.0.0"
port = os.environ["CELERY_FLOWER_PORT"]  # 5555

# Enable debug logging
logging = os.environ["FLOWER_LOGGING_LEVEL"]  # 'DEBUG'
