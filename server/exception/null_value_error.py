from typing import Optional


class NullValueError(Exception):
    def __init__(self) -> None:
        super().__init__()
