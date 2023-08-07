import datetime
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base

load_dotenv()

connection_string = "timescaledb://{}:{}@{}:{}/{}".format(
    os.environ["TIMESCALE_USER"],
    os.environ["TIMESCALE_PASSWORD"],
    os.environ["TIMESCALE_HOST"],
    os.environ["TIMESCALE_PORT"],
    os.environ["TIMESCALE_DATABASE_NAME"],
)
engine = create_engine(connection_string)

Base = declarative_base()
