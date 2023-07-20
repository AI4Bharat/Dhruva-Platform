import datetime

from sqlalchemy import Column, DateTime, Float, Text, create_engine, select
from sqlalchemy.orm import Session, declarative_base

engine = create_engine(
    "timescaledb://dhruva:polestar&timescale@20.193.155.30:5432/metering"
)

Base = declarative_base()


class ApiKey(Base):
    __table_args__ = {"timescaledb_hypertable": {"time_column_name": "timestamp"}}
    __tablename__ = "apikey"

    api_key_id = Column("api_key_id", Text)
    # user_id = Column("user_id", Text)
    inference_service_id = Column("inference_service_id", Text)
    usage = Column("usage", Float)
    timestamp = Column(
        "timestamp",
        DateTime(timezone=True),
        default=datetime.datetime.now,
        primary_key=True,
    )


Base.metadata.create_all(engine)

with Session(engine) as session:
    m = ApiKey(api_key_id="yes", inference_service_id="ues", usage=1.23)

    session.add(m)
    session.commit()
