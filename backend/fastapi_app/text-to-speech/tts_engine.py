# tts_engine.py
import torch
from transformers import VitsModel, AutoTokenizer
import soundfile as sf
from pathlib import Path

# Best free & natural model in 2025 (multilingual, 200+ languages)
MODEL_NAME = "facebook/mms-tts-eng"          # English (super natural)
# For Sinhala (experimental but works okay): "facebook/mms-tts-sin"

class TextToSpeech:
    def __init__(self, language="eng"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        model_id = f"facebook/mms-tts-{language}"
        print(f"Loading TTS model: {model_id} ... (first time takes 1-2 min)")
        self.tokenizer = AutoTokenizer.from_pretrained(model_id)
        self.model = VitsModel.from_pretrained(model_id)
        self.model = self.model.to(self.device)
        print("TTS model loaded!")

    def speak(self, text: str, output_path: str = None, speaker_speed=1.0):
        inputs = self.tokenizer(text, return_tensors="pt").to(self.device)
        
        with torch.no_grad():
            output = self.model(**inputs).waveform
        
        # Convert tensor to numpy (float32 → int16 for .wav)
        audio = output.squeeze().cpu().numpy()
        sample_rate = self.model.config.sampling_rate
        
        if output_path:
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            sf.write(output_path, audio, sample_rate)
        
        return audio, sample_rate

# Global engine (loads once)
tts_eng = TextToSpeech("eng")        # English
# tts_sin = TextToSpeech("sin")      # Uncomment for Sinhala