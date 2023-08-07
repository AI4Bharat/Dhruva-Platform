import csv
import io
import os
import smtplib
import ssl
from datetime import datetime, timedelta
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import sqlalchemy
from dotenv import load_dotenv
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import INTERVAL
from sqlalchemy.orm import Session
from sqlalchemy.sql.functions import concat

from ..celery_app import app
from .metering_database import ApiKey, engine

load_dotenv()


def get_usage_val_and_unit(task_type: str, val: float):
    if task_type in ("translation", "transliteration", "tts"):
        return (val / 1000, "Input Kilo-Characters")
    elif task_type == "asr":
        return (val / 3600, "Input Audio Time (In Hours)")
    else:
        return (val, "")


def get_csv():
    headers = (
        "API KEY NAME",
        "USER EMAIL",
        "INFERENCE SERVICE ID",
        "TASK_TYPE",
        "REQUEST COUNT",
        "USAGE",
        "UNIT FOR USAGE",
    )

    file = io.StringIO()
    c = csv.writer(file)
    c.writerow(headers)

    stmt = (
        select(
            ApiKey.api_key_name,
            ApiKey.user_email,
            ApiKey.inference_service_id,
            ApiKey.task_type,
            sqlalchemy.func.count(ApiKey.usage),
            sqlalchemy.func.sum(ApiKey.usage),
        )
        .group_by(
            ApiKey.api_key_id,
            ApiKey.api_key_name,
            ApiKey.user_id,
            ApiKey.user_email,
            ApiKey.inference_service_id,
            ApiKey.task_type,
        )
        .where(
            sqlalchemy.func.now() - sqlalchemy.func.cast(concat(7, " DAYS"), INTERVAL)
            <= ApiKey.timestamp
        )
    )
    with Session(engine) as session:
        rows = session.execute(stmt).all()
        for row in rows:
            val, unit = get_usage_val_and_unit(row[3], row[5])
            r = (*row[:5], val, unit)
            c.writerow(r)

    file.seek(0)
    return file


def create_email(sender: str, recipients: str):
    message = MIMEMultipart()
    message["From"] = sender
    message["To"] = recipients
    message["Subject"] = "Weekly Dhruva Usage Report - {}".format(
        os.environ["ENVIRONMENT"].capitalize()
    )
    part = MIMEBase("application", "octet-stream")
    part.set_payload(get_csv().read())
    part.add_header(
        "Content-Disposition",
        "attachment; filename=Report.csv",
    )
    message.attach(part)

    to_date = datetime.now() + timedelta(hours=5, minutes=30)
    from_date = to_date - timedelta(days=7)

    body = MIMEText(
        "Report from {} to {}.".format(
            from_date.strftime("%d, %b %Y"), to_date.strftime("%d, %b %Y")
        ),
        "plain",
    )
    message.attach(body)
    return message.as_string()


@app.task(name="send.usage.email")
def send_usage_email() -> None:
    """Send usage email to listed emails"""
    email_list = os.environ["USAGE_EMAIL_RECIPIENTS"]
    sender = os.environ["USAGE_EMAIL_SENDER"]
    smtp_username = os.environ["SMTP_USERNAME"]
    smtp_password = os.environ["SMTP_PASSWORD"]

    print("Sending usage report on email")

    email = create_email(sender, email_list)

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(os.environ["SMTP_SERVER"], 465, context=context) as server:
        server.login(smtp_username, smtp_password)
        server.sendmail(sender, email_list.split(","), email)

    print("Sent usage report on email")
