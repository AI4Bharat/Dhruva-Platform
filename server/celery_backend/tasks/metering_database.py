import datetime
import os

from dotenv import load_dotenv
from sqlalchemy import Column, DateTime, Float, Text, create_engine
from sqlalchemy.orm import declarative_base

load_dotenv()

engine = create_engine(os.environ["TIMESCALEDB_CONNECTION_STRING"])

Base = declarative_base()


class ApiKey(Base):
    __table_args__ = {"timescaledb_hypertable": {"time_column_name": "timestamp"}}
    __tablename__ = "apikey"

    api_key_id = Column("api_key_name", Text)
    inference_service_id = Column("inference_service_id", Text)
    usage = Column("usage", Float)
    timestamp = Column(
        "timestamp",
        DateTime(timezone=True),
        default=datetime.datetime.now,
        primary_key=True,
    )


Base.metadata.create_all(engine)
