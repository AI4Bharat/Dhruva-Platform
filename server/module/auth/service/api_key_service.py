import math
from typing import List
from fastapi import Depends
from ..repository import ApiKeyRepository


class ApiKeyService:
    def __init__(
        self,
        api_key_repository: ApiKeyRepository = Depends(ApiKeyRepository),
    ) -> None:
        self.api_key_repository = api_key_repository

    def get_all_api_key_details(self, page, limit) -> List:
        """
        Fetches all API keys from the collection and calculates the total usage
        Args:
            - page: Current page
            - limit: Number of documents per page
        Returns:
            - List[APIKeys]
            - total_usage
            - total_pages
        """
        keys = self.api_key_repository.find_all()
        total_usage = sum(k.usage for k in keys)

        return (
            keys[(page - 1) * limit: page * limit],
            total_usage,
            math.ceil(len(keys) / limit)
        )
