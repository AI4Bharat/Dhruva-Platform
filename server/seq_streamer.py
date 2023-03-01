import socketio
import base64
import io
import os
import sys
from urllib.parse import parse_qs
from dataclasses import dataclass
import wave
import requests

@dataclass
class UserState:
    input_audio__buffer: bytes
    input_audio__run_inference_once_in_bytes: int
    input_audio__last_inference_position_in_bytes: int
    input_audio__sampling_rate: int

    task_sequence: list
    sequence_depth_to_run: int
    http_headers: dict

class StreamingServerTaskSequence:
    '''
    This is a SocketIO server for simulating taskSequence inference.
    TODO: Generalize to different sequences. Currently it supports only ASR->Translation->TTS
    '''
    def __init__(self) -> None:
        self.sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
        self.app = socketio.ASGIApp(
            self.sio, socketio_path="",
            # other_asgi_app=app
        )
        self.inference_url = "https://api.dhruva.ai4bharat.org/services/inference/pipeline"
        if "BACKEND_PORT" in os.environ:
            self.inference_url = f"http://localhost:{os.environ['BACKEND_PORT']}/services/inference/pipeline"

        # Constants. TODO: Should we allow changing this?
        self.input_audio__response_frequency_in_ms = 2000
        self.input_audio__bytes_per_sample = 2
        
        # Storage for state specific to each client (key will be socket connection-ID string, and value would be `UserStateForASR`)
        self.client_states = {}

        # Setup the communication handlers
        self.configure_socket_server()

    def delete_user_states(self, sid: str) -> None:
        self.client_states.pop(sid, None)
    
    def initialize_buffer(self, sid: str, clear_history: bool = False) -> None:
        self.client_states[sid].input_audio__buffer = bytes()
        self.client_states[sid].input_audio__last_inference_position_in_bytes = 0

        if clear_history:
            pass
    
    def run_ulca_inference_from_stream(self, sid: str, stream: io.IOBase) -> str:
        # Convert the byte-stream into base64 string
        encoded_bytes = base64.b64encode(stream.read())
        encoded_string = encoded_bytes.decode()

        # Construct ULCA request payload
        input_data = {
            "audio": [{
                "audioContent": encoded_string
            }]
        }
        request_json = {
            "entryData": input_data,
            "taskSequence": self.client_states[sid].task_sequence[:self.client_states[sid].sequence_depth_to_run]
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
    
    def run_inference(self, sid: str) -> str:
        # Convert the raw bytes to WAV format, and create a byte-stream
        byte_io = io.BytesIO()
        with wave.open(byte_io, "wb") as file:
            file.setnchannels(1)
            file.setsampwidth(2)
            file.setframerate(self.client_states[sid].input_audio__sampling_rate)
            file.writeframes(self.client_states[sid].input_audio__buffer)
        
        byte_io.seek(0)
        return self.run_ulca_inference_from_stream(sid, byte_io)
    
    async def run_inference_and_send(self, sid: str) -> None:
        if not self.client_states[sid].input_audio__buffer:
            return
        response = self.run_inference(sid)
        await self.sio.emit(
            "response",
            data=(response),
            room=sid
        )
        return response
    
    def configure_socket_server(self):
        @self.sio.event
        async def connect(sid: str, environ: dict, auth):
            print('Connected with:', sid)
            # query_dict = parse_qs(environ["QUERY_STRING"])

            if not auth: # TODO: Validate the fields: api_key
                await self.sio.emit("abort", data=("Authentication headers not found!"), room=sid)
                return False
            
            self.client_states[sid] = UserState(
                input_audio__buffer=None,
                input_audio__run_inference_once_in_bytes=-1,
                input_audio__last_inference_position_in_bytes=0,
                input_audio__sampling_rate=-1,

                task_sequence=[],
                sequence_depth_to_run=1,
                http_headers=auth,
            )
            return True
        
        @self.sio.on("start")
        async def start(sid: str, task_sequence: list):
            self.initialize_buffer(sid)

            # Compute the inference_frequency (once in how many bytes should we run inference)
            sampling_rate = int(task_sequence[0]["config"]["samplingRate"])
            run_inference_once_in_bytes = int(sampling_rate * (self.input_audio__response_frequency_in_ms / 1000) * self.input_audio__bytes_per_sample)

            self.client_states[sid].input_audio__run_inference_once_in_bytes = run_inference_once_in_bytes
            self.client_states[sid].task_sequence = task_sequence
            self.client_states[sid].input_audio__sampling_rate = task_sequence[0]["config"]["samplingRate"]

            if False: # TODO: Validate the `task_sequence`
                await self.sio.emit("abort", data=("Invalid `task_sequence`!"), room=sid)

            # print("Ready to start stream for:", sid)
            await self.sio.emit("ready", room=sid)
        
        @self.sio.on("stop")
        async def stop(sid: str, disconnect_stream: bool):
            self.initialize_buffer(sid, clear_history=True)
            if disconnect_stream:
                await self.sio.emit("terminate", room=sid)
        
        @self.sio.on("data")
        async def data(sid: str, input_data: dict, streaming_config: int, clear_server_state: bool, disconnect_stream: bool):
            if input_data:
                # Update the user-state with the input_data
                if input_data["audio"] and input_data["audio"][0]["audioContent"]:
                    # For example, in the case of speech client, append audio payload to client buffer
                    self.client_states[sid].input_audio__buffer += input_data["audio"][0]["audioContent"]
            
            if streaming_config:
                # Update the user-state with the latest streaming-config
                if streaming_config["response_depth"] and self.client_states[sid].sequence_depth_to_run != streaming_config["response_depth"]:
                    self.client_states[sid].sequence_depth_to_run = streaming_config["response_depth"]

            if clear_server_state:
                if not disconnect_stream:
                    # For example, in the case of speech client, if silence is detected, run inference once (in-case there was new data after previous inference) and clear the buffer
                    intermediate_response__sequence_depth_to_run = self.client_states[sid].sequence_depth_to_run
                    self.client_states[sid].sequence_depth_to_run = len(self.client_states[sid].task_sequence)
                    await self.run_inference_and_send(sid)
                    self.client_states[sid].sequence_depth_to_run = intermediate_response__sequence_depth_to_run
                    self.initialize_buffer(sid)
            else:
                # For example, in the case of speech client, run inference once we have accumulated enough amount of audio since previous inference
                if len(self.client_states[sid].input_audio__buffer) - self.client_states[sid].input_audio__last_inference_position_in_bytes >= self.client_states[sid].input_audio__run_inference_once_in_bytes:
                    await self.run_inference_and_send(sid)
                    self.client_states[sid].input_audio__last_inference_position_in_bytes = len(self.client_states[sid].input_audio__buffer)
                
            
            if disconnect_stream:
                # For example, if the speech client wants to disconnect from the stream, run inference for one last-time (in-case there was new data after previous inference)
                self.client_states[sid].sequence_depth_to_run = len(self.client_states[sid].task_sequence)
                await self.run_inference_and_send(sid)
                # Remove all info related to the connection, and issue an handshake-signal to terminate
                self.delete_user_states(sid)
                await self.sio.emit("terminate", room=sid)
        

        @self.sio.event
        def disconnect(sid):
            self.delete_user_states(sid)
            # print("Disconnected with:", sid)

