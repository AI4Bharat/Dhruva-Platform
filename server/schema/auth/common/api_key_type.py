from enum import Enum


class ApiKeyType(str, Enum):
    PLATFORM = "PLATFORM"
    INFERENCE = "INFERENCE"
