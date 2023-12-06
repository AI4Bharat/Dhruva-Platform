from enum import Enum


class RoleType(str, Enum):
    ADMIN = "ADMIN"
    CONSUMER = "CONSUMER"
