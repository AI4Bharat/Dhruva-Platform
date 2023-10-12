import os

from dotenv import load_dotenv
from mongodb_migrations.cli import MigrationManager
from mongodb_migrations.config import Configuration, Execution

load_dotenv()


def parse_connection_string(conn_str: str):
    new_conn_str = conn_str.replace("mongodb://", "")
    parts = new_conn_str.split(":")
    username = parts[0]
    (password, _) = parts[1].split("@")

    return {"mongo_username": username, "mongo_password": password}


connection_string = os.environ["APP_DB_CONNECTION_STRING"]
execution = (
    Execution.MIGRATE
    if os.environ["MIGRATION_ACTION"] == "migrate"
    else Execution.DOWNGRADE
)
auth_details = parse_connection_string(connection_string)

config = {
    "mongo_url": connection_string,
    "mongo_database": os.environ["APP_DB_NAME"],
    "metastore": "migrations",
    "execution": execution,
    **auth_details,
}

manager = MigrationManager(Configuration(config))
manager.run()
