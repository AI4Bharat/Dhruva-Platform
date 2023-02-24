from enum import Enum


class Errors(Enum):
    DHRUVA201 = {"kind": "DHRUVA-201", "message": "Failed to get user details from db"}
    DHRUVA202 = {"kind": "DHRUVA-202", "message": "Failed to compare password hash"}
