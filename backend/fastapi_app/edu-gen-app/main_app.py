# main_app.py - EduGen AI Pro 2025 - 100% OFFLINE, NO LOGIN, NO NPM, PDF OUTPUT
import gradio as gr
import json
import re
import os
from pathlib import Path
from config import settings
from rag_qwen_engine import EduBrain
from visual_engine import visual
from tts_engine import speak
from flashcard_engine import create_flashcards

brain = EduBrain()

PROMPT_TEMPLATES = {
    "slides": """Generate exactly 6 educational slides about "{topic}" in valid JSON only.
Use this knowledge: {rag}

Return only this format:
{{
  "slides": [
    {{
      "title": "Slide Title",
      "bullets": ["• Point 1", "• Point 2", "• Point 3"],
      "diagram": "mermaid" or "image" or "none",
      "mermaid_code": "graph TD\\n    A-->B",
      "image_prompt": "detailed labeled diagram of photosynthesis, textbook style"
    }}
  ]
}}
Only valid JSON. No markdown.""",

    "mindmap": 'Generate ONLY Mermaid mindmap code for "{topic}". Start with graph TD or mindmap',

    "flashcards": 'Generate exactly 10 Q&A flashcards about "{topic}" as JSON list: [["Question?", "Answer"]]'
}

def generate_all(topic: str):
    output_dir = settings.OUTPUT_DIR
    output_dir.mkdir(exist_ok=True)

    print(f"Generating study package for: {topic}")
    rag = brain.ask(f"Explain {topic} clearly for students.", max_tokens=1500)

    # === 1. Generate Slides ===
    prompt = PROMPT_TEMPLATES["slides"].format(topic=topic, rag=rag[:3500])
    raw = brain.ask(prompt + "\nReturn only valid JSON:")

    pdf_path = None
    try:
        json_match = re.search(r"\{.*\}", raw, re.DOTALL)
        data = json.loads(json_match.group(0)) if json_match else json.loads(raw.replace("```", "").strip())
        
        for i, slide in enumerate(data.get("slides", [])):
            # Generate image or mermaid
            if slide.get("diagram") == "mermaid" and slide.get("mermaid_code"):
                code = slide["mermaid_code"]
                slide["image"] = visual.generate_mermaid(code, f"slide_{i+1}")
            elif slide.get("image_prompt"):
                slide["image"] = visual.generate_image(slide["image_prompt"], f"slide_{i+1}")
            else:
                slide["image"] = None

            # Voice narration
            text = slide["title"] + ". " + " ".join(b.replace("• ", "") for b in slide["bullets"])
            audio_path = output_dir / f"audio_{i+1}.mp3"
            speak(text, str(audio_path))
            slide["audio"] = str(audio_path)

        safe_name = "".join(c if c.isalnum() or c in " _-" else "_" for c in topic)
        pdf_path = visual.create_slides_pdf(data["slides"], topic)
        print(f"PDF created: {pdf_path}")

    except Exception as e:
        print("Slides failed:", e)

    # === 2. Mind Map ===
    mindmap_raw = brain.ask(PROMPT_TEMPLATES["mindmap"].format(topic=topic))
    code = mindmap_raw
    if "```" in mindmap_raw:
        code = mindmap_raw.split("```")[1].strip()
    mindmap_img = visual.generate_mermaid(code, "mindmap")

    # === 3. Flashcards ===
    fc_raw = brain.ask(PROMPT_TEMPLATES["flashcards"].format(topic=topic))
    try:
        qa = json.loads(fc_raw.replace("```", "").strip())
        fc_path = create_flashcards(qa, topic.replace(" ", "_"))
    except:
        fc_path = None

    return (
        str(pdf_path) if pdf_path and Path(pdf_path).exists() else None,
        mindmap_img,
        fc_path,
        rag
    )

# ——— GRADIO UI ———
with gr.Blocks(theme=gr.themes.Soft(), title="EduGen AI Pro 2025") as demo:
    gr.Markdown(f"""
    # EduGen AI Pro 2025  
    **Model:** `{settings.LLM_MODEL.split('/')[-1]}` • **100% OFFLINE** • No Login • No npm
    
    One topic → PDF Slides + Voice + Mind Map + Flashcards
    """)

    topic = gr.Textbox(
        label="Enter Topic",
        placeholder="e.g., Water Cycle, Python OOP, World War II",
        lines=2
    )
    btn = gr.Button("Generate Full Package", variant="primary")

    with gr.Row():
        with gr.Column(scale=2):
            pdf = gr.File(label="PDF Slides (with voice)", file_types=[".pdf"])
            mindmap = gr.Image(label="Mind Map")
        with gr.Column():
            flashcards = gr.File(label="Anki Flashcards (.txt)")
            summary = gr.Textbox(label="Summary", lines=12)

    btn.click(generate_all, inputs=topic, outputs=[pdf, mindmap, flashcards, summary])

    gr.Examples([
        ["Photosynthesis"],
        ["Cell Division"],
        ["Python Functions"],
        ["World War II"]
    ], inputs=topic)

demo.launch(share=True, server_port=7860)