import os
from redis_om import get_redis_connection
from dotenv import load_dotenv


load_dotenv(override=True)

def get_cache_connection():
    return get_redis_connection(
        host=os.environ.get("REDIS_HOST"),
        port=os.environ.get("REDIS_PORT"),
        db=os.environ.get("REDIS_DB"),
        password=os.environ.get("REDIS_PASSWORD")
    )
