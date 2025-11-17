# stt_app.py
import gradio as gr
from stt_engine import stt
import os
from datetime import datetime
from pathlib import Path

UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

def speech_to_text(audio_file=None, mic_audio=None):
    if audio_file is None and mic_audio is None:
        return "No audio", None, None

    # Use mic if available, else uploaded file
    audio_path = mic_audio if mic_audio else audio_file
    if isinstance(audio_path, str):
        audio_path = Path(audio_path)

    # Save uploaded file
    if not audio_path.exists():
        temp_path = UPLOAD_DIR / f"input_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav"
        import shutil
        shutil.copy(audio_path, temp_path)
        audio_path = temp_path
    else:
        audio_path = Path(audio_path)

    # Transcribe
    result = stt.transcribe(str(audio_path))
    text = result["text"]
    segments = result.get("chunks", [])

    # Save .txt
    txt_path = OUTPUT_DIR / f"transcript_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    txt_path.write_text(text, encoding="utf-8")

    # Save .srt
    srt_path = OUTPUT_DIR / f"subtitles_{datetime.now().strftime('%Y%m%d_%H%M%S')}.srt"
    stt.save_srt(segments, str(srt_path))

    return text, str(txt_path), str(srt_path)

# Gradio UI
with gr.Blocks(title="Speech to Text – Whisper 2025") as demo:
    gr.Markdown("# Free Offline Speech-to-Text (Whisper Large V3 Turbo)")
    gr.Markdown("Supports **English, Sinhala, Tamil, Hindi** + 100+ languages")

    with gr.Tab("Upload Audio"):
        file_input = gr.Audio(label="Upload .wav, .mp3, .m4a", type="filepath")
        btn1 = gr.Button("Transcribe", variant="primary")
    
    with gr.Tab("Record Live"):
        mic_input = gr.Audio(label="Record from mic", type="filepath", source="microphone")
        btn2 = gr.Button("Transcribe", variant="primary")

    text_out = gr.Textbox(label="Transcription", lines=10)
    txt_file = gr.File(label="Download .txt")
    srt_file = gr.File(label="Download .srt (Subtitles)")

    btn1.click(speech_to_text, inputs=file_input, outputs=[text_out, txt_file, srt_file])
    btn2.click(speech_to_text, inputs=mic_input, outputs=[text_out, txt_file, srt_file])

    gr.Examples([
        ["sample_english.wav"],
        ["sample_sinhala.wav"]
    ], inputs=file_input)

if __name__ == "__main__":
    demo.launch(share=True)