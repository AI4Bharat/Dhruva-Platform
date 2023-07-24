import csv
import io
import os
import smtplib
import ssl
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from typing import List

import sqlalchemy
from dotenv import load_dotenv
from metering_database import ApiKey, engine
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..celery_app import app

load_dotenv()


def get_csv():
    file = io.StringIO()
    c = csv.writer(file)

    stmt = select(
        ApiKey.api_key_id,
        ApiKey.api_key_name,
        ApiKey.user_id,
        ApiKey.user_email,
        sqlalchemy.func.sum(ApiKey.usage),
        sqlalchemy.func.count(ApiKey.usage),
    ).group_by(
        ApiKey.api_key_id,
        ApiKey.api_key_name,
        ApiKey.user_id,
        ApiKey.user_email,
    )

    with Session(engine) as session:
        rows = session.scalars(stmt).all()
        for row in rows:
            c.writerow(row)

    file.seek(0)
    return file


def create_email(sender: str, recipients: str):
    message = MIMEMultipart()
    message["From"] = sender
    message["To"] = recipients
    message["Subject"] = "Weekly Dhruva Usage Report"
    part = MIMEBase("application", "octet-stream")
    part.set_payload(get_csv().read())
    part.add_header(
        "Content-Disposition",
        "attachment; filename=Report.csv",
    )
    message.attach(part)
    return message.as_string()


@app.task(name="send.usage.email")
def send_usage_email() -> None:
    """Send usage email to listed emails"""
    email_list = os.environ["USAGE_EMAIL_RECIPIENTS"]
    sender = os.environ["USAGE_EMAIL_SENDER"]
    smtp_username = os.environ["SMTP_USERNAME"]
    smtp_password = os.environ["SMTP_PASSWORD"]

    email = create_email(sender, email_list)

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(os.environ["SMTP_SERVER"], 465, context=context) as server:
        server.login(smtp_username, smtp_password)
        server.sendmail(sender, email_list.split(","), email)
