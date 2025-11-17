# main_app.py  ← Now with SD3 Medium (No T5-XXL) for low-VRAM runs
import gradio as gr
from generate_prompts import text_to_image_prompts  # Adjust if renamed
from generate_images import generate_image         # Now no-T5
from create_pptx import create_slideshow          # Or 3_create_pptx.py
import shutil, os

def full_pipeline(edu_text, num_slides=4):
    os.makedirs("outputs/images", exist_ok=True)
    shutil.rmtree("outputs/images")  # Clean previous
    os.makedirs("outputs/images", exist_ok=True)
    
    # Step 1: Prompts (unchanged)
    prompts = text_to_image_prompts(edu_text, num_slides)
    
    # Step 2: Images with no-T5 SD3 (lightning fast)
    image_paths = []
    for i, p in enumerate(prompts, 1):
        path = generate_image(p, i)
        image_paths.append(path)
    
    # Step 3: Bullets (simple split)
    bullets_per_slide = [["• " + line for line in edu_text.split(". ")[:3]] for _ in range(num_slides)]
    
    # Step 4: PPTX
    pptx_path = create_slideshow("Your Topic", bullets_per_slide, image_paths, "My_NoT5_Slides.pptx")
    
    return image_paths, pptx_path, prompts

# Gradio UI
iface = gr.Interface(
    fn=full_pipeline,
    inputs=[gr.Textbox(label="Enter educational text", lines=10), gr.Slider(2, 8, value=4, step=1, label="Number of slides")],
    outputs=[
        gr.Gallery(label="Generated Images (SD3 Medium No T5-XXL)"), 
        gr.File(label="Download PowerPoint"), 
        gr.Textbox(label="Generated Prompts")
    ],
    title="Text → Slides: SD3 Medium (No T5-XXL) – Lite & Fast",
    description="Edu text → Prompts → No-T5 images (5-8GB VRAM) → PPTX. Ideal for laptops!"
)

if __name__ == "__main__":
    iface.launch(share=True)