# stt_engine.py
import torch
from transformers import pipeline
from pathlib import Path
from datetime import timedelta

class SpeechToText:
    def __init__(self):
        self.device = 0 if torch.cuda.is_available() else -1
        print("Loading Whisper Large V3 Turbo... (first time ~2-3 min, ~3 GB)")
        self.pipe = pipeline(
            "automatic-speech-recognition",
            model="openai/whisper-large-v3-turbo",
            torch_dtype=torch.float16 if self.device == 0 else torch.float32,
            device=self.device,
            chunk_length_s=30,
            batch_size=16,
        )
        # Auto language detection
        self.pipe.model.generation_config.language = None
        print("STT model loaded successfully!")

    def transcribe(self, audio_path: str):
        result = self.pipe(
            audio_path,
            return_timestamps=True,                    # This gives word-level or chunk-level timestamps
            generate_kwargs={"language": None, "task": "transcribe"}
        )
        return result

    @staticmethod
    def _seconds_to_srt_time(seconds: float) -> str:
        """Convert float seconds → SRT format: HH:MM:SS,mmm"""
        if seconds is None:
            return "00:00:00,000"
        delta = timedelta(seconds=float(seconds))
        total_ms = int(seconds * 1000)
        hours, remainder = divmod(total_ms, 3600000)
        minutes, remainder = divmod(remainder, 60000)
        seconds, millis = divmod(remainder, 1000)
        return f"{hours:02d}:{minutes:02d}:{seconds:02d},{millis:03d}"

    def save_srt(self, segments, output_path: str):
        """Save segments with timestamps as .srt file"""
        if not segments:
            Path(output_path).write_text("", encoding="utf-8")
            return

        with open(output_path, "w", encoding="utf-8") as f:
            for i, seg in enumerate(segments, 1):
                # Handle both possible keys: "timestamp" (tuple) or old "start"/"end"
                timestamp = seg.get("timestamp") or seg.get("timestamps")
                if timestamp and len(timestamp) == 2:
                    start_sec, end_sec = timestamp
                else:
                    # Fallback (very rare)
                    start_sec = seg.get("start")
                    end_sec = seg.get("end")

                if start_sec is None or end_sec is None:
                    continue

                start = self._seconds_to_srt_time(start_sec)
                end = self._seconds_to_srt_time(end_sec)
                text = seg["text"].strip()

                f.write(f"{i}\n{start} --> {end}\n{text}\n\n")


# Global instance (loads once at startup)
stt = SpeechToText()