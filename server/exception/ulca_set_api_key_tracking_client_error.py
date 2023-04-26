class ULCASetApiKeyTrackingClientError(Exception):
    def __init__(self, error_code: int, message: str) -> None:
        self.error_code = error_code
        self.message = message
        super().__init__(error_code, message)
