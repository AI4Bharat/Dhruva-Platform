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
        keys = self.api_key_repository.find({})

        final_keys = []
        total_usage = 0
        for k in keys:
            api_key_info = k.dict(exclude={"id"})
            if api_key_info:
                final_keys.append(api_key_info)
                total_usage += api_key_info["usage"]

        return (
            final_keys[(page - 1) * limit: page * limit],
            total_usage,
            math.ceil(len(final_keys) / limit)
        )
