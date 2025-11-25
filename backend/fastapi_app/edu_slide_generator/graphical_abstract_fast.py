# graphical_abstract_fast.py — Optimized for Speed (20 Steps, CPU/GPU Ready)
import gradio as gr
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler  # Faster scheduler
import torch
from PIL import Image, ImageDraw, ImageFont
import os
from datetime import datetime
from diffusers.utils import logging  # For progress

# Auto device & optimizations
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Loading on {device}... (Optimized: 20 steps, fast scheduler)")

pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16 if device == "cuda" else torch.float32,
    safety_checker=None
)
pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)  # 3x faster denoising
pipe = pipe.to(device)

if device == "cuda":
    pipe.enable_attention_slicing()  # Faster on low VRAM
    pipe.enable_sequential_cpu_offload()  # Offload to CPU between steps
else:
    logging.set_verbosity_error()  # Less CPU logging noise

# Style presets (unchanged)
STYLES = {
    "Nature / Science Journal": "clean scientific illustration, flat design, minimal color palette, high clarity, journal-style graphical abstract, 16:9",
    "Cell Press Style": "vibrant colors, 3D elements, modern biomedical illustration, elegant layout, premium quality",
    "PNAS / PLoS": "infographic style, clear icons, data visualization, professional layout, muted scientific colors",
    "Chemistry / Materials": "molecular structures, crystal lattice, clean white background, precise labels, technical illustration",
    "Neuroscience": "brain circuits, neural networks, synaptic connections, glowing neurons, dark background with bright traces",
    "Ecology / Environment": "natural landscape, ecosystem diagram, green tones, animals and plants, environmental science style",
    "Physics / Quantum": "quantum particles, wave functions, mathematical symbols, cosmic background, abstract physics art"
}

def create_graphical_abstract(research_title, key_findings, style_name="Nature / Science Journal", fast_mode=False):
    if not research_title.strip():
        return None, "Please enter your research title!"

    # Build smart prompt (unchanged)
    style_prompt = STYLES.get(style_name, STYLES["Nature / Science Journal"])
    findings = " • ".join([f.strip() for f in key_findings.split("\n") if f.strip()][:8])

    full_prompt = f"""
    Graphical abstract for research paper titled: "{research_title}"
    Key findings: {findings}
    {style_prompt}, horizontal 16:9 layout, perfect composition, journal cover quality, 
    no text on image, highly detailed, professional scientific visualization
    """

    # Speed settings
    steps = 15 if fast_mode else 20  # 15 for ultra-fast (slight quality trade-off)
    width, height = (1024, 576) if fast_mode else (1344, 768)  # Lower res for CPU speed boost

    print(f"Generating in {style_name} style ({steps} steps, {width}x{height} res)...")
    image = pipe(
        full_prompt,
        width=width, height=height,
        num_inference_steps=steps,
        guidance_scale=8.5
    ).images[0]

    # Add elegant title overlay (unchanged)
    draw = ImageDraw.Draw(image)
    try:
        font = ImageFont.truetype("arial.ttf", 48)
        font_small = ImageFont.truetype("arial.ttf", 28)
    except:
        font = ImageFont.load_default()
        font_small = font

    # Dark overlay bar at bottom
    overlay = Image.new("RGBA", (image.width, 150), (0, 0, 0, 180))
    image.paste(overlay, (0, image.height - 150), overlay)

    # Title text
    title = research_title[:80] + "..." if len(research_title) > 80 else research_title
    draw.text((50, image.height - 120), title, fill="white", font=font)
    draw.text((50, image.height - 60), f"Generated: {datetime.now().strftime('%B %Y')}", fill="#aaaaaa", font=font_small)

    # Save
    os.makedirs("graphical_abstracts", exist_ok=True)
    mode_suffix = "_fast" if fast_mode else ""
    filename = f"graphical_abstracts/{research_title.replace(' ', '_')[:50]}_{style_name.split('/')[0].replace(' ', '')}{mode_suffix}.png"
    image.save(filename)
    
    speed_note = " (Fast Mode: 15 steps, lower res)" if fast_mode else " (High Quality: 20 steps)"
    return image, f"Saved: {filename}{speed_note}\nTime: ~{steps * 2 if device=='cpu' else steps} seconds expected"

# Gradio Interface (Added Fast Mode Toggle)
with gr.Blocks(theme=gr.themes.Soft(), title="Graphical Abstract AI - Optimized") as app:
    gr.Markdown("""
    # Graphical Abstract Creator 2025 — SPEED OPTIMIZED  
    **Instant pro visuals (20 steps max)**  
    Toggle 'Fast Mode' for CPU (2x faster, slight quality trade-off)
    """)

    with gr.Row():
        with gr.Column(scale=2):
            title = gr.Textbox(label="Research Paper Title", lines=2, placeholder="e.g. CRISPR-Cas9 Mediated Genome Editing in Human Cells")
            findings = gr.Textbox(label="Key Findings (one per line)", lines=6, placeholder="• New method increases efficiency by 300%\n• First demonstration in vivo\n• No off-target effects observed")
            style = gr.Dropdown(choices=list(STYLES.keys()), value="Nature / Science Journal", label="Journal Style")
            fast_mode = gr.Checkbox(label="Fast Mode (CPU: 15 steps, lower res — 2x faster)", value=True if device=="cpu" else False)
            btn = gr.Button("Create Graphical Abstract", variant="primary", size="lg")

        with gr.Column():
            output_img = gr.Image(label="Your Graphical Abstract")
            status = gr.Textbox(label="Status & Timing")

    btn.click(
        create_graphical_abstract,
        inputs=[title, findings, style, fast_mode],
        outputs=[output_img, status]
    )

    gr.Examples([
        ["Deep Learning Enables Real-Time Cancer Detection from Histopathology Images", 
         "• 99.1% accuracy on unseen data\n• Processes 1000x faster than pathologists\n• Validated on 10,000 patient samples", "Cell Press Style"],
        ["Room-Temperature Superconductivity in Hydride Compounds Under Pressure", 
         "• Tc = 203 K at 150 GPa\n• Confirmed by multiple methods\n• New pathway for high-Tc materials", "Nature / Science Journal"],
    ], inputs=[title, findings, style])

app.launch(share=True, server_port=7861)