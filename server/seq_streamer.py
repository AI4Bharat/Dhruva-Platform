import array
import base64
import io
import os
import sys
import wave
from urllib.parse import parse_qs

import numpy as np
import requests
import socketio
from module.services.service.audio_service import AudioService
from pydantic import BaseModel
from schema.services.common import _ULCATaskType
from scipy.io.wavfile import write as scipy_wav_write


class UserState(BaseModel):
    input_audio__buffer: np.ndarray = None
    input_audio__run_inference_once_in_samples: int = -1
    input_audio__response_frequency_in_secs: float = None
    input_audio__max_inference_duration_in_samples: int = -1
    input_audio__last_inference_position_in_samples: int = 0
    input_audio__auto_chunking: bool = True
    input_audio__sampling_rate: int = -1

    task_sequence: list = []
    input_task_type: str = None
    sequence_depth_to_run: int = 0
    http_headers: dict

    # Without this, pydantic throws the following exception:
    # `RuntimeError: no validator found for <class 'numpy.ndarray'>`
    class Config:
        arbitrary_types_allowed = True


DEFAULT_STREAMING_CONFIG = {
    "responseTaskSequenceDepth": 1,
    "responseFrequencyInSecs": 2.0,
}


class StreamingServerTaskSequence:
    """
    This is a SocketIO server for simulating taskSequence inference.
    TODO: Generalize to different sequences. Currently it supports only ASR->Translation->TTS
    """

    def __init__(self, async_mode: bool = True, max_connections: int = -1) -> None:
        if async_mode:
            self.sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
            self.app = socketio.ASGIApp(
                self.sio,
                socketio_path="",
                # other_asgi_app=app
            )
        else:
            self.sio = socketio.Server(cors_allowed_origins="*")
            self.app = socketio.WSGIApp(
                self.sio,
                socketio_path="",
                # other_asgi_app=app
            )

        if "BACKEND_PORT" in os.environ:
            self.inference_url = f"http://localhost:{os.environ['BACKEND_PORT']}/services/inference/pipeline"
        else:
            # self.inference_url = "https://api.dhruva.ai4bharat.org/services/inference/pipeline"
            exit(f"ERROR: Please set the env var `BACKEND_PORT`")

        self.audio_service = AudioService()

        # Constants. TODO: Should we allow changing this?
        self.input_audio__bytes_per_sample = 2
        self.input_audio__max_inference_time_in_ms = 30 * 1000
        self.max_connections = max_connections if max_connections > 0 else 0

        # Storage for state specific to each client (key will be socket connection-ID string, and value would be `UserState`)
        self.client_states = {}

        # Setup the communication handlers
        self.configure_socket_server()

    def delete_user_states(self, sid: str) -> None:
        self.client_states.pop(sid, None)

    def initialize_buffer(self, sid: str, clear_history: bool = False) -> None:
        self.client_states[sid].input_audio__buffer = np.array([], dtype=np.float64)
        self.client_states[sid].input_audio__last_inference_position_in_samples = 0

        if clear_history:
            pass

    def set_streaming_config(self, sid: str, streaming_config: dict) -> None:
        if (
            "responseTaskSequenceDepth" in streaming_config
            and self.client_states[sid].sequence_depth_to_run
            != streaming_config["responseTaskSequenceDepth"]
        ):
            self.client_states[sid].sequence_depth_to_run = streaming_config[
                "responseTaskSequenceDepth"
            ]

        if (
            "responseFrequencyInSecs" in streaming_config
            and self.client_states[sid].input_audio__response_frequency_in_secs
            != streaming_config["responseFrequencyInSecs"]
        ):
            if 1.0 <= streaming_config["responseFrequencyInSecs"] <= 20.0:
                self.client_states[
                    sid
                ].input_audio__response_frequency_in_secs = streaming_config[
                    "responseFrequencyInSecs"
                ]
                self.client_states[
                    sid
                ].input_audio__run_inference_once_in_samples = int(
                    self.client_states[sid].input_audio__sampling_rate
                    * streaming_config["responseFrequencyInSecs"]
                )

    def run_ulca_inference(self, sid: str, audio_chunks: list) -> str:
        audio_payload_list = []
        for audio_chunk in audio_chunks:
            # Convert PCM to WAV bytes
            byte_io: io.IOBase = io.BytesIO()
            scipy_wav_write(
                byte_io, self.client_states[sid].input_audio__sampling_rate, audio_chunk
            )

            # Convert the byte-stream into base64 string
            # TODO: Any better communication format?
            bytes_ = byte_io.read()
            # import datetime
            # with open(f'{str(datetime.datetime.utcnow())}.wav', 'wb') as f:
            #     f.write(bytes_)
            encoded_bytes = base64.b64encode(bytes_)
            encoded_string = encoded_bytes.decode()
            audio_payload_list.append({"audioContent": encoded_string})

        # Construct ULCA request payload
        request_json = {
            "inputData": {
                "audio": audio_payload_list,
            },
            "pipelineTasks": self.client_states[sid].task_sequence[
                : self.client_states[sid].sequence_depth_to_run
            ],
            "controlConfig": {"dataTracking": False},
        }

        # Run inference via Dhruva REST API
        response = requests.post(
            self.inference_url,
            json=request_json,
            headers=self.client_states[sid].http_headers,
            # timeout=1
        )
        # print("response.text", response.text)
        return response.json()

    def run_inference(self, sid: str, is_final: bool) -> str:
        if self.client_states[sid].input_audio__auto_chunking:
            audio_chunks, _ = list(
                self.audio_service.silero_vad_chunking(
                    self.client_states[sid].input_audio__buffer,
                    self.client_states[sid].input_audio__sampling_rate,
                    16,
                )
            )
            if not audio_chunks:
                return None

            # Update the buffer to only the audio_chunk after a silence
            self.client_states[sid].input_audio__buffer = audio_chunks[-1]
        else:
            audio_chunks = [self.client_states[sid].input_audio__buffer]

        is_intermediate = True
        if is_final:
            # It is assumed that the buffer would be discarded after this run
            is_intermediate = False
        elif len(audio_chunks) > 1:
            # And run inference only for those fully-uttered chunks
            audio_chunks = audio_chunks[:-1]
            is_intermediate = False

        result = self.run_ulca_inference(sid, audio_chunks)
        streaming_status = {
            "isIntermediateResult": is_intermediate,
        }
        return (result, streaming_status)

    async def run_inference_and_send(self, sid: str, is_final: bool) -> None:
        if (
            self.client_states[sid].input_audio__buffer is not None
            and not self.client_states[sid].input_audio__buffer.size
        ):
            return
        response = self.run_inference(sid, is_final)
        if response:
            await self.sio.emit("response", data=(response[0], response[1]), room=sid)
        return response

    def configure_socket_server(self):
        @self.sio.event
        async def connect(sid: str, environ: dict, auth):
            if self.max_connections and len(self.client_states) >= self.max_connections:
                await self.sio.emit(
                    "abort",
                    data=(
                        "Server Error: Max connections exceeded! Please try again later."
                    ),
                    room=sid,
                )
                return False

            print("Connected with:", sid)
            # query_dict = parse_qs(environ["QUERY_STRING"])

            if not auth:  # TODO: Validate the fields: api_key
                await self.sio.emit(
                    "abort", data=("Authentication headers not found!"), room=sid
                )
                return False

            self.client_states[sid] = UserState(
                http_headers=auth,
            )
            return True

        @self.sio.on("start")
        async def start(sid: str, task_sequence: list, streaming_config: dict = {}):
            self.initialize_buffer(sid)

            if False:  # TODO: Validate the `task_sequence`
                await self.sio.emit(
                    "abort", data=("Invalid `task_sequence`!"), room=sid
                )

            self.client_states[sid].task_sequence = task_sequence
            self.client_states[sid].input_task_type = task_sequence[0]["taskType"]

            if self.client_states[sid].input_task_type == _ULCATaskType.ASR:
                # Compute the inference_frequency (once in how many samples should we run inference)
                sampling_rate = int(task_sequence[0]["config"]["samplingRate"])
                max_inference_duration_in_samples = int(
                    sampling_rate * (self.input_audio__max_inference_time_in_ms / 1000)
                )

                # TODO: Implement proper translation+TTS strategy when auto_chunking is enabled
                self.client_states[sid].input_audio__auto_chunking = (
                    len(task_sequence) == 1
                )
                # Below max limit is not applicable if `auto_chunking` is set
                self.client_states[
                    sid
                ].input_audio__max_inference_duration_in_samples = (
                    max_inference_duration_in_samples
                )
                self.client_states[sid].input_audio__sampling_rate = task_sequence[0][
                    "config"
                ]["samplingRate"]

                if streaming_config:
                    initial_streaming_config = dict(DEFAULT_STREAMING_CONFIG)
                    initial_streaming_config.update(streaming_config)
                else:
                    initial_streaming_config = DEFAULT_STREAMING_CONFIG
                self.set_streaming_config(sid, initial_streaming_config)

            # print("Ready to start stream for:", sid)
            await self.sio.emit("ready", room=sid)

        @self.sio.on("stop")
        async def stop(sid: str, disconnect_stream: bool):
            self.initialize_buffer(sid, clear_history=True)
            if disconnect_stream:
                await self.sio.emit("terminate", room=sid)

        @self.sio.on("data")
        async def data(
            sid: str,
            input_data: dict,
            streaming_config: dict,
            clear_server_state: bool,
            disconnect_stream: bool,
        ):
            if sid not in self.client_states:
                # TODO: Send an error response stating this
                return

            if input_data:
                # Update the user-state with the input_data
                if self.client_states[sid].input_task_type == _ULCATaskType.ASR:
                    if input_data["audio"] and input_data["audio"][0]["audioContent"]:
                        # For example, in the case of speech client, append audio payload to client buffer
                        audioContent = input_data["audio"][0]["audioContent"]
                        if type(audioContent) is list:
                            # Assume int16 array, and pack it into bytes
                            audioContent = b"".join(
                                [
                                    i.to_bytes(
                                        self.input_audio__bytes_per_sample,
                                        sys.byteorder,
                                    )
                                    for i in audioContent
                                ]
                            )

                        # Convert bytes to int16 array and dequantize
                        raw_audio = np.array(
                            array.array("h", audioContent), dtype=np.float64
                        ) / (2**15 - 1)

                        if not self.client_states[sid].input_audio__auto_chunking:
                            # If max continuous stream limit exceeded, reset the server state
                            remaining_samples_count = self.client_states[
                                sid
                            ].input_audio__max_inference_duration_in_samples - len(
                                self.client_states[sid].input_audio__buffer
                            )
                            if remaining_samples_count <= len(raw_audio):
                                raw_audio = raw_audio[:remaining_samples_count]
                                clear_server_state = True

                        # TODO: Make it efficient. Until then, ask the client to use higher stream rate
                        self.client_states[sid].input_audio__buffer = np.concatenate(
                            [self.client_states[sid].input_audio__buffer, raw_audio]
                        )

            if streaming_config:
                # Update the user-state with the latest streaming-config
                self.set_streaming_config(sid, streaming_config)

            if clear_server_state:
                if not disconnect_stream:
                    # For example, in the case of speech client, if pause is detected, run inference once (in-case there was new data after previous inference) and clear the buffer
                    # intermediate_response__sequence_depth_to_run = self.client_states[sid].sequence_depth_to_run
                    # self.client_states[sid].sequence_depth_to_run = len(self.client_states[sid].task_sequence)
                    await self.run_inference_and_send(sid, is_final=True)
                    # self.client_states[sid].sequence_depth_to_run = intermediate_response__sequence_depth_to_run
                    self.initialize_buffer(sid)
            else:
                # For example, in the case of speech client, run inference once we have accumulated enough amount of audio since previous inference
                if self.client_states[sid].input_task_type == _ULCATaskType.ASR:
                    if (
                        len(self.client_states[sid].input_audio__buffer)
                        - self.client_states[
                            sid
                        ].input_audio__last_inference_position_in_samples
                        >= self.client_states[
                            sid
                        ].input_audio__run_inference_once_in_samples
                    ):
                        await self.run_inference_and_send(sid, is_final=False)
                        self.client_states[
                            sid
                        ].input_audio__last_inference_position_in_samples = len(
                            self.client_states[sid].input_audio__buffer
                        )

            if disconnect_stream:
                # For example, if the speech client wants to disconnect from the stream, run inference for one last-time (in-case there was new data after previous inference)
                self.client_states[sid].sequence_depth_to_run = len(
                    self.client_states[sid].task_sequence
                )
                await self.run_inference_and_send(sid, is_final=True)
                # Remove all info related to the connection, and issue an handshake-signal to terminate
                self.delete_user_states(sid)
                await self.sio.emit("terminate", room=sid)

        @self.sio.event
        def disconnect(sid):
            self.delete_user_states(sid)
            # print("Disconnected with:", sid)
