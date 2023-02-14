from typing import Optional
from .ulca_base_monolingual_config import _ULCABaseMonolingualTaskConfig


class _ULCABaseAudioConfig(_ULCABaseMonolingualTaskConfig):
    audioFormat: Optional[str]
    encoding: Optional[str]
    samplingRate: Optional[int]
    postProcessors: Optional[list[str]]
