# visual_engine.py - 100% Public Models, No Login
from diffusers import StableDiffusionPipeline
from PIL import Image, ImageDraw, ImageFont
import torch
import base64
import requests
from io import BytesIO
from pathlib import Path
from jinja2 import Template
from weasyprint import HTML

class VisualEngine:
    def __init__(self):
        print("Loading Stable Diffusion 1.5 (public)...")
        self.pipe = StableDiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            torch_dtype=torch.float16,
            safety_checker=None
        )
        self.pipe = self.pipe.to("cuda")
        self.pipe.enable_attention_slicing()
        Path("outputs/images").mkdir(parents=True, exist_ok=True)
        Path("outputs/mermaid").mkdir(parents=True, exist_ok=True)

    def generate_image(self, prompt: str, filename: str):
        enhanced = f"{prompt}, educational diagram, labeled, clean, white background, high quality"
        image = self.pipe(enhanced, height=768, width=1024).images[0]
        path = f"outputs/images/{filename}.png"
        image.save(path)
        return path

    def generate_mermaid(self, code: str, filename: str):
        try:
            url = f"https://mermaid.ink/img/{base64.b64encode(code.encode()).decode()}"
            data = requests.get(url, timeout=10).content
            path = f"outputs/mermaid/{filename}.png"
            Image.open(BytesIO(data)).save(path)
            return path
        except:
            img = Image.new("RGB", (900, 600), "white")
            d = ImageDraw.Draw(img)
            font = ImageFont.load_default()
            d.text((50, 200), "Diagram\n(Offline)", fill="black", font=font)
            path = f"outputs/mermaid/{filename}.png"
            img.save(path)
            return path

    def create_slides_pdf(self, slides, topic):
        template = Template("""
        <!DOCTYPE html>
        <html><head><meta charset="utf-8">
        <style>
            body { margin:0; font-family: Arial; background: #0f172a; color: white; }
            .slide { height: 100vh; padding: 60px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; background: linear-gradient(135deg, #1e293b, #334155); }
            h1 { font-size: 56px; margin: 0 0 40px; color: #60a5fa; }
            ul { font-size: 36px; text-align: left; max-width: 90%; }
            li { margin: 15px 0; }
            img { max-width: 85%; max-height: 45vh; margin: 20px 0; border-radius: 12px; }
            audio { margin-top: 20px; }
        </style></head><body>
            <div class="slide"><h1>{{ topic }}</h1><p>EduGen AI • 100% Offline</p></div>
            {% for s in slides %}
            <div class="slide">
                <h1>{{ s.title }}</h1>
                <ul>{% for b in s.bullets %}<li>{{ b }}</li>{% endfor %}</ul>
                {% if s.image %}<img src="{{ s.image }}" />{% endif %}
                {% if s.audio %}<audio controls><source src="{{ s.audio }}"></audio>{% endif %}
            </div>
            {% endfor %}
        </body></html>
        """)

        html = template.render(topic=topic, slides=slides)
        html_path = "outputs/slides.html"
        pdf_path = f"outputs/{topic.replace(' ', '_')}_SLIDES.pdf"
        Path(html_path).write_text(html)
        HTML(html_path).write_pdf(pdf_path)
        return pdf_path

visual = VisualEngine()