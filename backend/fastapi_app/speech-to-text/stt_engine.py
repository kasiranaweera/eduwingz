# stt_engine.py
import torch
from transformers import pipeline
from pathlib import Path
import json
from datetime import timedelta

class SpeechToText:
    def __init__(self):
        self.device = 0 if torch.cuda.is_available() else -1
        print("Loading Whisper Large V3 Turbo... (first time ~2 min, 3 GB)")
        self.pipe = pipeline(
            "automatic-speech-recognition",
            model="openai/whisper-large-v3-turbo",
            torch_dtype=torch.float16 if self.device == 0 else torch.float32,
            device=self.device,
            chunk_length_s=30,
            batch_size=16
        )
        self.pipe.model.generation_config.language = None  # Auto-detect
        print("STT model loaded!")

    def transcribe(self, audio_path: str):
        result = self.pipe(
            audio_path,
            return_timestamps=True,
            generate_kwargs={"language": None, "task": "transcribe"}
        )
        return result

    def save_srt(self, segments, output_path: str):
        with open(output_path, "w", encoding="utf-8") as f:
            for i, seg in enumerate(segments, 1):
                start = str(timedelta(seconds=int(seg["start"]))).split(".")[0] + ",000"
                end = str(timedelta(seconds=int(seg["end"]))).split(".")[0] + ",000"
                f.write(f"{i}\n{start} --> {end}\n{seg['text'].strip()}\n\n")

# Global engine
stt = SpeechToText()