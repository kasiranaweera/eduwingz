# stt_app.py
import gradio as gr
from stt_engine import stt
from datetime import datetime
from pathlib import Path
import shutil

UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)


def speech_to_text(audio_file=None, mic_audio=None):
    if audio_file is None and mic_audio is None:
        return "No audio provided", None, None

    # Prioritize microphone input
    source_path = mic_audio if mic_audio else audio_file

    # Gradio gives temporary path as string → convert to Path
    if isinstance(source_path, str):
        source_path = Path(source_path)

    # Copy to our persistent uploads folder (so file survives after temp cleanup)
    if not source_path.exists():
        return "Error: Audio file not found", None, None

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    final_audio_path = UPLOAD_DIR / f"input_{timestamp}.wav"
    shutil.copy(source_path, final_audio_path)

    # Transcribe
    result = stt.transcribe(str(final_audio_path))
    text = result.get("text", "").strip()

    # Get segments/chunks (supports both possible keys)
    segments = result.get("chunks") or result.get("segments") or []

    # Save .txt
    txt_path = OUTPUT_DIR / f"transcript_{timestamp}.txt"
    txt_path.write_text(text, encoding="utf-8")

    # Save .srt
    srt_path = OUTPUT_DIR / f"subtitles_{timestamp}.srt"
    stt.save_srt(segments, str(srt_path))

    return text, str(txt_path), str(srt_path)


# Gradio Interface
with gr.Blocks(title="Free Offline Whisper Turbo STT") as demo:
    gr.Markdown("# Whisper Large V3 Turbo — Offline Speech-to-Text")
    gr.Markdown("**100+ languages** • Fast • Accurate • Fully Local • Supports English, Sinhala, Tamil, Hindi, etc.")

    with gr.Tab("Upload Audio File"):
        file_input = gr.Audio(
            label="Upload audio (.wav, .mp3, .m4a, .ogg, etc.)",
            type="filepath",
            sources=["upload"]
        )
        btn_upload = gr.Button("Transcribe Uploaded File", variant="primary")

    with gr.Tab("Record from Microphone"):
        mic_input = gr.Audio(
            label="Record live audio",
            type="filepath",
            sources=["microphone"]
        )
        btn_mic = gr.Button("Transcribe Recording", variant="primary")

    with gr.Row():
        text_output = gr.Textbox(label="Transcription", lines=12, interactive=False)
    
    with gr.Row():
        txt_download = gr.File(label="Download Transcript (.txt)")
        srt_download = gr.File(label="Download Subtitles (.srt)")

    # Button actions
    btn_upload.click(
        fn=speech_to_text,
        inputs=file_input,
        outputs=[text_output, txt_download, srt_download]
    )
    btn_mic.click(
        fn=speech_to_text,
        inputs=mic_input,
        outputs=[text_output, txt_download, srt_download]
    )

    gr.Examples(
        examples=[
            ["sample_english.wav"],
            ["sample_sinhala.wav"],
            ["sample_tamil.wav"]
        ],
        inputs=file_input
    )

if __name__ == "__main__":
    demo.launch(share=True)