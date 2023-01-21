from typing import Any
from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest
import json
import os
from db.database import Database


@pytest.fixture()
def override_database() -> Any:
    db = dict()

    base_path = os.path.dirname(__file__)
    with open(base_path + "/fixtures/models_registry.json") as fhand:
        models_registry = json.loads(fhand.read())
        db["model"] = models_registry

    with open(base_path + "/fixtures/services_registry.json") as fhand:
        services_registry = json.loads(fhand.read())
        db["service"] = services_registry

    with open(base_path + "/fixtures/api_key_registry.json") as fhand:
        api_key_registry = json.loads(fhand.read())
        db["api_key"] = api_key_registry

    return db


@pytest.fixture()
def test_client(app: FastAPI, override_database: Any):
    app.dependency_overrides[Database] = override_database
    client = TestClient(app)
    yield client
    client.close()


# @pytest.fixture()
# def init(test_client: TestClient):
#     test_client.dependency
#     yield client
