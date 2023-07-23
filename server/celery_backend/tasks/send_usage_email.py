import csv
import io
import os
import smtplib
import ssl
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart

from dotenv import load_dotenv

from ..celery_app import app

load_dotenv()


def get_csv():
    mylist = [["a", "b"], ["c", "d"]]
    file = io.StringIO()
    csv.writer(file).writerows(mylist)
    file.seek(0)
    return file


def create_email():
    message = MIMEMultipart()
    message["From"] = os.environ["USAGE_EMAIL_SENDER"]
    message["To"] = os.environ["USAGE_EMAIL_RECIPIENTS"].split(",")
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
    email_list = os.environ["USAGE_EMAIL_RECIPIENTS"].split(",")
    sender = os.environ["USAGE_EMAIL_SENDER"]
    smtp_username = os.environ["SMTP_USERNAME"]
    smtp_password = os.environ["SMTP_PASSWORD"]

    context = ssl.create_default_context()

    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(smtp_username, smtp_password)
        email = create_email()
        server.sendmail(sender, email_list, email)
