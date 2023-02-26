import socketio
import json
import base64
import io
from urllib.parse import parse_qs
from dataclasses import dataclass
import wave
import requests

@dataclass
class UserStateForASR:
    buffer: bytes
    language: str
    sampling_rate: int
    post_processors: list
    service_id: str
    api_key: str
    run_inference_once_in_bytes: int
    last_inference_position_in_bytes: int
    historical_text: str

class StreamingServerASR:
    '''
    This is a SocketIO server for simulating streaming-ASR.
    TODO: Write a base class or wrapper above this, that generalizes across task-types

    The following implementation is based on the standards followed by Vakyansh's Open-Speech-API:
    https://github.com/AI4Bharat/speech-recognition-open-api-proxy
    '''
    def __init__(self, response_frequency_in_ms: int = 2000, bytes_per_sample: int = 2) -> None:
        self.sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
        self.app = socketio.ASGIApp(
            self.sio, socketio_path="",
            # other_asgi_app=app
        )

        # Save config
        self.response_frequency_in_ms = response_frequency_in_ms
        self.bytes_per_sample = bytes_per_sample
        
        # Storage for state specific to each client (key will be socket connection-ID string, and value would be `UserStateForASR`)
        self.client_states = {}

        # Setup the communication handlers
        self.configure_socket_server()
    
    def delete_user_states(self, sid: str) -> None:
        self.client_states.pop(sid, None)
    
    def initialize_buffer(self, sid: str) -> None:
        self.client_states[sid].buffer = bytes()
        self.client_states[sid].last_inference_position_in_bytes = 0
    
    def run_ulca_inference_from_stream(self, sid: str, stream: io.IOBase) -> str:
        # Convert the byte-stream into base64 string
        encoded_bytes = base64.b64encode(stream.read())
        encoded_string = encoded_bytes.decode()

        # Construct ULCA request payload
        request_json = {
            # "serviceId": self.client_states[sid].service_id,
            "audio": [
                {
                    "audioContent": encoded_string
                }
            ],
            "config": {
                "language": {
                    "sourceLanguage": self.client_states[sid].language
                },
                "audioFormat": "wav",
                "samplingRate": self.client_states[sid].sampling_rate,
                "encoding": "base64"
            }
        }
        
        # Run inference via Dhruva REST API
        response = requests.post(
            "https://api.dhruva.ai4bharat.org/services/inference/asr?serviceId=" + self.client_states[sid].service_id,
            json=request_json,
            headers={"authorization": self.client_states[sid].api_key},
            # timeout=1
        )
        # print("response.text", response.text)
        response_json = response.json()
        try:
            return response_json["output"][0]["source"]
        except:
            print(response.text)
            return "<!--ERROR-->"

    def run_inference(self, sid: str) -> str:
        # Convert the raw bytes to WAV format, and create a byte-stream
        byte_io = io.BytesIO()
        with wave.open(byte_io, "wb") as file:
            file.setnchannels(1)
            file.setsampwidth(2)
            file.setframerate(self.client_states[sid].sampling_rate)
            file.writeframes(self.client_states[sid].buffer)
        
        byte_io.seek(0)
        return self.run_ulca_inference_from_stream(sid, byte_io)
    
    async def transcribe_and_send(self, sid: str) -> None:
        if not self.client_states[sid].buffer:
            return
        transcript = self.run_inference(sid)
        full_transcript = self.client_states[sid].historical_text + transcript.strip()
        await self.sio.emit(
            "response",
            data=(full_transcript, self.client_states[sid].language),
            room=sid
        )
        return transcript

    def configure_socket_server(self):
        @self.sio.event
        async def connect(sid: str, environ: dict, auth):
            print('Connected with:', sid)
            query_dict = parse_qs(environ["QUERY_STRING"])
            sampling_rate = int(query_dict["samplingRate"][0])

            if False: # TODO: Validate the fields: api_key, service_id, language
                await self.sio.emit("abort", room=sid)
                return False
            
            # Compute the inference_frequency (once in how many bytes should we run inference)
            run_inference_once_in_bytes = int(sampling_rate * (self.response_frequency_in_ms / 1000) * self.bytes_per_sample)

            self.client_states[sid] = UserStateForASR(
                buffer=None,
                language=query_dict["language"][0],
                sampling_rate=sampling_rate,
                post_processors=json.loads(query_dict["postProcessors"][0]) if "postProcessors" in query_dict else [],
                service_id=query_dict["serviceId"][0],
                api_key=query_dict["apiKey"][0],
                run_inference_once_in_bytes=run_inference_once_in_bytes,
                last_inference_position_in_bytes=0,
                historical_text=""
            )
            return True
        
        @self.sio.on("connect_mic_stream")
        async def connect_mic_stream(sid: str):
            self.initialize_buffer(sid)
            # print("Connected stream for:", sid)
            await self.sio.emit("connect-success", room=sid)
        
        @self.sio.on("mic_data")
        async def mic_data(sid, in_data: bytes, language_code: str, is_speaking: bool, disconnect_stream: bool):
            if in_data: # Append audio payload to client buffer
                self.client_states[sid].buffer += in_data
            
            if not is_speaking:
                # If silence is detected, run inference once (in-case there was new data after previous inference) and clear the buffer
                transcript = await self.transcribe_and_send(sid)
                if transcript:
                    self.client_states[sid].historical_text += transcript + '\n'
                self.initialize_buffer(sid)
            else:
                # Run inference once we have accumulated enough amount of audio since previous inference
                if len(self.client_states[sid].buffer) - self.client_states[sid].last_inference_position_in_bytes >= self.client_states[sid].run_inference_once_in_bytes:
                    await self.transcribe_and_send(sid)
                    self.client_states[sid].last_inference_position_in_bytes = len(self.client_states[sid].buffer)
            
            if disconnect_stream:
                # If the client wants to disconnect from the stream, run inference for one last-time (in-case there was new data after previous inference)
                await self.transcribe_and_send(sid)
                # Remove all info related to the connection, and issue an handshake-signal to terminate
                self.delete_user_states(sid)
                await self.sio.emit("terminate", room=sid)
        
        @self.sio.event
        def disconnect(sid):
            self.delete_user_states(sid)
            # print("Disconnected with:", sid)
