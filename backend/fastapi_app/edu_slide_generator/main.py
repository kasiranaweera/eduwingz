# main.py - EduWingz AI 2025 — Individual OR Generate All
import gradio as gr
from engine import (
    generate_summary,
    generate_pdf_slides,
    generate_mindmap,
    generate_flashcards,
    generate_voice_notes
)

# NEW: Generate Everything at Once
def generate_everything(topic):
    if not topic.strip():
        return [None]*5 + ["Please enter a topic!"]
    
    print(f"\nGenerating FULL package for: {topic}")
    summary = generate_summary(topic)
    pdf = generate_pdf_slides(topic)
    mindmap = generate_mindmap(topic)
    cards = generate_flashcards(topic)
    voice = generate_voice_notes(topic)
    
    return pdf, mindmap, cards, voice, summary

with gr.Blocks(theme=gr.themes.Soft(), title="EduWingz AI 2025") as app:
    gr.Markdown("""
    # EduWingz AI 2025  
    **Generate one thing… or click "EVERYTHING"**  
    Real AI images • Voice • PDF • Mind Map • Flashcards
    """)

    topic = gr.Textbox(
        label="Your Topic",
        placeholder="Water Cycle, Photosynthesis, Python Loops, World War II...",
        lines=2,
        scale=9
    )
    
    # BIG BUTTON FOR EVERYTHING
    btn_all = gr.Button("GENERATE EVERYTHING AT ONCE", variant="primary", size="lg")

    gr.Markdown("### Or generate only what you need:")
    
    with gr.Row():
        btn_summary = gr.Button("Summary", variant="secondary")
        btn_slides  = gr.Button("PDF Slides", variant="secondary")
        btn_mindmap = gr.Button("Mind Map", variant="secondary")
        btn_cards   = gr.Button("Flashcards", variant="secondary")
        btn_voice   = gr.Button("Voice Notes", variant="secondary")

    # Outputs
    with gr.Row():
        with gr.Column(scale=2):
            out_pdf     = gr.File(label="PDF Slides (AI images + voice)")
            out_mindmap = gr.Image(label="AI Mind Map")
        with gr.Column():
            out_cards   = gr.File(label="Anki Flashcards")
            out_voice   = gr.Audio(label="Voice Notes", type="filepath")
            out_summary = gr.Textbox(label="Smart Summary", lines=12)

    # Connect buttons
    btn_all.click(
        generate_everything,
        inputs=topic,
        outputs=[out_pdf, out_mindmap, out_cards, out_voice, out_summary]
    )

    btn_summary.click(generate_summary, topic, out_summary)
    btn_slides.click(generate_pdf_slides, topic, out_pdf)
    btn_mindmap.click(generate_mindmap, topic, out_mindmap)
    btn_cards.click(generate_flashcards, topic, out_cards)
    btn_voice.click(generate_voice_notes, topic, out_voice)

    gr.Examples([
        ["Photosynthesis"],
        ["Water Cycle"],
        ["Python Functions"],
        ["French Revolution"],
        ["Cell Division"]
    ], inputs=topic)

    gr.Markdown("**You control everything** · 100% free · Works offline after first run")

app.launch(share=True, server_port=7860)