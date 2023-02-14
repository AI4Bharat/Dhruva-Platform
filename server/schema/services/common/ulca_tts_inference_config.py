from typing import Literal
from .ulca_base_monolingual_config import _ULCABaseMonolingualTaskConfig


class _ULCATtsInferenceConfig(_ULCABaseMonolingualTaskConfig):
    gender: Literal['male', 'female']
