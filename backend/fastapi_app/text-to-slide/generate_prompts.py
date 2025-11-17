# main_app.py  ← Updated for Stable Diffusion 3 Medium
import gradio as gr
from generate_prompts import text_to_image_prompts  # Adjust if renamed to 1_generate_prompts.py
from generate_images import generate_image         # Now SD3M
from create_pptx import create_slideshow          # Or 3_create_pptx.py
import shutil, os

def full_pipeline(edu_text, num_slides=4):
    os.makedirs("outputs/images", exist_ok=True)
    shutil.rmtree("outputs/images")  # Clean previous
    os.makedirs("outputs/images", exist_ok=True)
    
    # Step 1: Generate prompts (Mistral unchanged)
    prompts = text_to_image_prompts(edu_text, num_slides)
    
    # Step 2: Generate images with SD3 Medium (new!)
    image_paths = []
    for i, p in enumerate(prompts, 1):
        path = generate_image(p, i)
        image_paths.append(path)
    
    # Step 3: Simple bullets (improve as needed)
    bullets_per_slide = [["• " + line for line in edu_text.split(". ")[:3]] for _ in range(num_slides)]
    
    # Step 4: Build PPTX
    pptx_path = create_slideshow("Your Topic", bullets_per_slide, image_paths, "My_SD3_Slides.pptx")
    
    return image_paths, pptx_path, prompts  # Added prompts for preview

# Gradio UI (updated title)
iface = gr.Interface(
    fn=full_pipeline,
    inputs=[gr.Textbox(label="Enter educational text", lines=10), gr.Slider(2, 8, value=4, step=1, label="Number of slides")],
    outputs=[
        gr.Gallery(label="Generated Images (SD3 Medium)"), 
        gr.File(label="Download PowerPoint"), 
        gr.Textbox(label="Generated Prompts (for debugging)")
    ],
    title="Text → Slides with Stable Diffusion 3 Medium (2025)",
    description="Edu text → AI prompts → SD3M images → PPTX. Better labels & diagrams than Qwen!"
)

if __name__ == "__main__":
    iface.launch(share=True)