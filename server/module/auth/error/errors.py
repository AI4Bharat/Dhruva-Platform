from enum import Enum


class Errors(Enum):
    DHRUVA201 = {"kind": "DHRUVA-201", "message": "Failed to get user details from db"}
    DHRUVA202 = {"kind": "DHRUVA-202", "message": "Failed to compare password hash"}
    DHRUVA203 = {
        "kind": "DHRUVA-203",
        "message": "Failed to store auth token data in db",
    }
    DHRUVA204 = {
        "kind": "DHRUVA-204",
        "message": "Failed to create api key",
    }
    DHRUVA205 = {
        "kind": "DHRUVA-205",
        "message": "Failed to get all api keys",
    }
    DHRUVA206 = {
        "kind": "DHRUVA-206",
        "message": "Failed to get user",
    }
    DHRUVA207 = {
        "kind": "DHRUVA-207",
        "message": "Failed to create user",
    }
    DHRUVA208 = {
        "kind": "DHRUVA-208",
        "message": "Failed to get api key",
    }
    DHRUVA209 = {
        "kind": "DHRUVA-209",
        "message": "Failed to update api key status",
    }
    DHRUVA210 = {
        "kind": "DHRUVA-210",
        "message": "Failed to update api key tracking status",
    }
    DHRUVA211 = {
        "kind": "DHRUVA-211",
        "message": "Failed to modify api key params",
    }
    DHRUVA212 = {
        "kind": "DHRUVA-212",
        "message": "Failed to modify user details",
    }
