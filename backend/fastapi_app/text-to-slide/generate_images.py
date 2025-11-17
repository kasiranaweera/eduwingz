# 2_generate_images.py  ← Now uses Stable Diffusion 3 Medium (2025 best for edu diagrams)
import torch
from diffusers import StableDiffusion3Pipeline
import os
from pathlib import Path

MODEL_NAME = "stabilityai/stable-diffusion-3-medium-diffusers"  # SD3 Medium – superior typography & prompts
OUTPUT_DIR = Path("outputs/images")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Load once (global) – SD3M is efficient, ~28 steps for high quality
pipe = StableDiffusion3Pipeline.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
    variant="fp16" if torch.cuda.is_available() else None
)
pipe = pipe.to("cuda" if torch.cuda.is_available() else "cpu")
pipe.enable_attention_slicing()  # Saves VRAM
pipe.enable_model_cpu_offload()  # For low VRAM GPUs

def generate_image(prompt: str, slide_number: int) -> str:
    # SD3M magic: Handles complex edu prompts with labels/arrows perfectly
    enhanced_prompt = f"{prompt}, educational diagram, clean white background, high resolution, sharp labels, simple colors, no text distortion, 16:9 aspect ratio"
    negative_prompt = "blurry, low quality, distorted text, watermark, people, clutter, dark background"
    
    image = pipe(
        prompt=enhanced_prompt,
        negative_prompt=negative_prompt,
        width=1664,    # 16:9 widescreen for slides
        height=928,
        num_inference_steps=28,  # SD3M sweet spot: fast + detailed
        guidance_scale=7.0,      # Follows prompt closely
        generator=torch.Generator(device=pipe.device).manual_seed(slide_number)  # Reproducible per slide
    ).images[0]

    filename = f"slide_{slide_number:02d}.png"
    filepath = OUTPUT_DIR / filename
    image.save(filepath)
    return str(filepath)

if __name__ == "__main__":
    from generate_prompts import text_to_image_prompts  # Adjust import if renamed
    prompts = text_to_image_prompts("Explain the water cycle in detail", 3)
    for i, p in enumerate(prompts, 1):
        path = generate_image(p, i)
        print(f"Saved SD3M slide → {path}")