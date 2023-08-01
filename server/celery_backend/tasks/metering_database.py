import datetime
import os

from dotenv import load_dotenv
from sqlalchemy import Column, DateTime, Float, Text, create_engine
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


class ApiKey(Base):
    __table_args__ = {"timescaledb_hypertable": {"time_column_name": "timestamp"}}
    __tablename__ = "apikey"

    api_key_id = Column("api_key_id", Text)
    api_key_name = Column("api_key_name", Text)
    user_id = Column("user_id", Text)
    user_email = Column("user_email", Text)
    inference_service_id = Column("inference_service_id", Text)
    task_type = Column("task_type", Text)
    usage = Column("usage", Float)
    timestamp = Column(
        "timestamp",
        DateTime(timezone=True),
        default=datetime.datetime.now,
        primary_key=True,
    )


Base.metadata.create_all(engine)
