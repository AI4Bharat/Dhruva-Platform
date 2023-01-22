from typing import Any
from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest
from db.database import Database
from tests.integration_tests.db.database import MockDatabase


@pytest.fixture()
def test_client(app: FastAPI):
    app.dependency_overrides[Database] = MockDatabase
    client = TestClient(app)
    yield client
    client.close()


# @pytest.fixture()
# def init(test_client: TestClient):
#     test_client.dependency
#     yield client
