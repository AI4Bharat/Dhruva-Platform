import socketio
import json
import base64
import io
from urllib.parse import parse_qs
from dataclasses import dataclass
import wave
import requests
from fastapi import FastAPI

app = FastAPI()

@dataclass
class UserState:
    buffer: bytes
    language: str
    sampling_rate: int
    post_processors: list
    service_id: str
    api_key: str
    run_inference_once_in_bytes: int
    last_inference_position_in_bytes: int

class StreamingServerASR:
    def __init__(self, app, response_frequency_in_ms=2000, bytes_per_sample=2) -> None:
        self.sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
        self.app = socketio.ASGIApp(
            self.sio, socketio_path="",
            # other_asgi_app=app
        )
        app.mount("/socket.io", self.app)
        self.configure_socket_server()
        self.client_states = {}

        self.response_frequency_in_ms = response_frequency_in_ms
        self.bytes_per_sample = bytes_per_sample
    
    def delete_user_states(self, sid):
        self.client_states.pop(sid, None)
    
    def initialize_buffer(self, sid):
        self.client_states[sid].buffer = bytes()
        self.client_states[sid].last_inference_position_in_bytes = 0
    
    async def transcribe_and_send(self, sid):
        if not self.client_states[sid].buffer:
            return
        message = self.run_inference(sid)
        await self.sio.emit(
            "response",
            data=(message, self.client_states[sid].language),
            room=sid
        )

    def run_inference(self, sid):
        byte_io = io.BytesIO()
        with wave.open(byte_io, "wb") as file:
            file.setnchannels(1)
            file.setsampwidth(2)
            file.setframerate(self.client_states[sid].sampling_rate)
            file.writeframes(self.client_states[sid].buffer)
        
        byte_io.seek(0)
        encoded_bytes = base64.b64encode(byte_io.read())
        encoded_string = encoded_bytes.decode()
        print("Running inference")
        request_json = {
            "serviceId": self.client_states[sid].service_id,
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
        
        response = requests.post(
            "https://api.dhruva.ai4bharat.org/services/inference/asr",
            json=request_json,
            headers={"authorization": self.client_states[sid].api_key},
            timeout=1
        )
        # print("response.text", response.text)
        response_json = response.json()
        try:
            return response_json["output"][0]["source"]
        except:
            print(response.text)
            return "<!--ERROR-->"

    def configure_socket_server(self):
        @self.sio.event
        def connect(sid, environ, auth):
            print('Connected with:', sid)
            query_dict = parse_qs(environ["QUERY_STRING"])
            sampling_rate = int(query_dict["samplingRate"][0])
            self.client_states[sid] = UserState(
                buffer=None,
                language=query_dict["language"][0],
                sampling_rate=sampling_rate,
                post_processors=json.loads(query_dict["postProcessors"][0]),
                service_id=query_dict["serviceId"][0],
                api_key=query_dict["apiKey"][0],
                run_inference_once_in_bytes=int(sampling_rate * (self.response_frequency_in_ms / 1000) * self.bytes_per_sample),
                last_inference_position_in_bytes=0
            )
        
        @self.sio.on("connect_mic_stream")
        async def connect_mic_stream(sid):
            print("Connected stream")
            self.initialize_buffer(sid)
            await self.sio.emit("connect-success", room=sid)
        
        @self.sio.on("mic_data")
        async def mic_data(sid, in_data: bytes, language_code: str, is_speaking: bool, disconnect_stream: bool):
            if in_data:
                self.client_states[sid].buffer += in_data
            if not is_speaking:
                await self.transcribe_and_send(sid)
                self.initialize_buffer(sid)
            else:
                if len(self.client_states[sid].buffer) - self.client_states[sid].last_inference_position_in_bytes >= self.client_states[sid].run_inference_once_in_bytes:
                    await self.transcribe_and_send(sid)
                    self.client_states[sid].last_inference_position_in_bytes = len(self.client_states[sid].buffer)
            
            if disconnect_stream:
                await self.transcribe_and_send(sid)
                self.delete_user_states(sid)
                await self.sio.emit("terminate", room=sid)
        
        @self.sio.event
        def disconnect(sid):
            self.delete_user_states(sid)
            # print("Disconnected with:", sid)

StreamingServerASR(app)
