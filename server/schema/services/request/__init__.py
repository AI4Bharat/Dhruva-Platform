from typing import Union

from .create_snapshot_request import CreateSnapshotRequest
from .feedback_download_query import FeedbackDownloadQuery
from .feedback_submit_request import ULCAFeedbackRequest
from .model_create_request import ModelCreateRequest
from .model_update_request import ModelUpdateRequest
from .model_view_request import ModelViewRequest
from .service_create_request import ServiceCreateRequest
from .service_heartbeat_request import ServiceHeartbeatRequest
from .service_update_request import ServiceUpdateRequest
from .service_view_request import ServiceViewRequest
from .ulca_asr_inference_request import (
    ULCAAsrInferenceRequest,
    _ULCAAsrInferenceRequestConfig,
)
from .ulca_feedback_questions_request import ULCAFeedbackQuestionRequest
from .ulca_generic_inference_request import ULCAGenericInferenceRequest
from .ulca_inference_query import ULCAInferenceQuery
from .ulca_ner_inference_request import (
    ULCANerInferenceRequest,
    _ULCANerInferenceRequestConfig,
)
from .ulca_pipeline_inference_request import ULCAPipelineInferenceRequest
from .ulca_s2s_inference_request import ULCAS2SInferenceRequest
from .ulca_translation_inference_request import ULCATranslationInferenceRequest
from .ulca_ocr_inference_request import ULCAOcrInferenceRequest
from .ulca_transliteration_inference_request import ULCATransliterationInferenceRequest
from .ulca_tts_inference_request import (
    ULCATtsInferenceRequest,
    _ULCATtsInferenceRequestConfig,
)
from .ulca_vad_inference_request import ULCAVadInferenceRequest

ULCAInferenceRequest = Union[
    ULCAGenericInferenceRequest,
    ULCAAsrInferenceRequest,
    ULCAOcrInferenceRequest,
    ULCATranslationInferenceRequest,
    ULCATransliterationInferenceRequest,
    ULCATtsInferenceRequest,
    ULCANerInferenceRequest,
    ULCAVadInferenceRequest,
]
