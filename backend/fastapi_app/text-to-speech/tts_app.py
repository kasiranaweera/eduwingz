# tts_app.py
import gradio as gr
from tts_engine import tts_eng
import os
from datetime import datetime

OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def text_to_speech(text, language="English", speed=1.0):
    if not text.strip():
        return None, None
    
    # Choose model
    if "sinhala" in language.lower() or "සිංහල" in language:
        from tts_engine import TextToSpeech
        tts = TextToSpeech("sin")  # lazy load Sinhala
    else:
        tts = tts_eng
    
    filename = f"speech_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav"
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    audio_data, sr = tts.speak(text, output_path=filepath, speaker_speed=speed)
    
    return (sr, audio_data), filepath

# Gradio Interface
with gr.Blocks(title="Text to Speech – Hugging Face") as demo:
    gr.Markdown("# Free Offline Text-to-Speech (2025 Best Models)")
    gr.Markdown("Supports English + 100+ languages including basic Sinhala")
    
    with gr.Row():
        textbox = gr.Textbox(
            label="Enter your text",
            placeholder="Type or paste any text here...",
            lines=6
        )
    
    with gr.Row():
        lang = gr.Dropdown(
            ["English", "Sinhala (experimental)", "Spanish", "French", "Hindi", "Tamil"],
            value="English",
            label="Voice Language"
        )
    
    btn = gr.Button("Generate Speech", variant="primary")
    
    with gr.Row():
        audio_out = gr.Audio(label="Listen here", type="numpy")
        file_out = gr.File(label="Download .wav file")
    
    btn.click(
        fn=text_to_speech,
        inputs=[textbox, lang],
        outputs=[audio_out, file_out]
    )
    
    gr.Examples([
        ["Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods from carbon dioxide and water."],
        ["ආයුබෝවන්! මම කැලණිය විශ්වවිද්‍යාලයේ සිසුවෙක්."],
        ["Hello from Sri Lanka! This is a free offline TTS."]
    ], inputs=textbox)

if __name__ == "__main__":
    demo.launch(share=True)  # share=True gives public link