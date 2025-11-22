# engine.py - All functions work independently
import os
import torch
from transformers import pipeline
from diffusers import StableDiffusionPipeline
from weasyprint import HTML
import edge_tts
import asyncio
from pathlib import Path

# Device & Models (loaded once)
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Device: {device}")

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16 if device == "cuda" else torch.float32,
    safety_checker=None
).to(device)
if device == "cuda":
    pipe.enable_attention_slicing()

os.makedirs("outputs", exist_ok=True)

# TTS
async def _tts(text, file):
    c = edge_tts.Communicate(text, "en-US-AriaNeural")
    await c.save(file)

def speak(text, path):
    asyncio.run(_tts(text, path))

# Generate AI Image
def gen_image(prompt, name):
    print(f"AI Image: {prompt[:60]}...")
    img = pipe(prompt, height=768, width=1024, num_inference_steps=20).images[0]
    path = f"outputs/{name}.png"
    img.save(path)
    return path

# 1. Summary
def generate_summary(topic):
    if not topic.strip(): return "Enter a topic!"
    text = summarizer(f"Explain {topic} simply for students", max_length=500)[0]["summary_text"]
    return text

# 2. PDF Slides (6 AI images + voice)
def generate_pdf_slides(topic):
    if not topic.strip(): return None
    prompts = [
        f"educational diagram of {topic}, labeled, clean, whiteboard style",
        f"step by step process of {topic}, infographic style",
        f"realistic illustration of {topic}, textbook quality",
        f"comparison chart about {topic}, clear labels",
        f"timeline of {topic}, educational design",
        f"3D educational visual of {topic}, white background"
    ]
    
    html = f"<h1>{topic}</h1><p>EduWingz AI Slides</p>"
    for i, p in enumerate(prompts):
        img_path = gen_image(p, f"slide_{i+1}")
        audio_path = f"outputs/voice_{i+1}.mp3"
        speak(f"Slide {i+1}. {p.split(',')[0]}", audio_path)
        html += f'<div style="page-break-after:always;text-align:center"><img src="{img_path}" style="max-width:90%"><br><audio controls><source src="{audio_path}"></audio></div>'

    pdf_path = f"outputs/{topic.replace(' ', '_')[:30]}_SLIDES.pdf"
    HTML(string=f"<html><body style='background:#0f172a;color:white;font-family:Arial'>{html}</body></html>").write_pdf(pdf_path)
    return pdf_path

# 3. Mind Map
def generate_mindmap(topic):
    if not topic.strip(): return None
    prompt = f"beautiful colorful educational mind map of {topic}, hand-drawn style, central node, branches with keywords, white background"
    return gen_image(prompt, "mindmap")

# 4. Flashcards
def generate_flashcards(topic):
    if not topic.strip(): return None
    raw = summarizer(f"Make 10 simple quiz questions about {topic}", max_length=600)[0]["summary_text"]
    path = "outputs/flashcards.txt"
    with open(path, "w") as f:
        for i, line in enumerate(raw.split("\n"), 1):
            if "?" in line or len(line) > 20:
                f.write(f"Q{i}: {line.strip()}\tA: [Your answer]\n")
    return path

# 5. Voice Notes
def generate_voice_notes(topic):
    if not topic.strip(): return None
    text = summarizer(f"Explain {topic} in 3 minutes like a teacher", max_length=800)[0]["summary_text"]
    path = "outputs/voice_notes.mp3"
    speak(text, path)
    return path