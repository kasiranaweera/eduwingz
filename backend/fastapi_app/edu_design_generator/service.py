import os
import base64
import io
from typing import List, Tuple
from PIL import Image

# Optional: try to import diffusers for local inference
try:
    from diffusers import StableDiffusionPipeline
    DIFFUSERS_AVAILABLE = True
except ImportError:
    DIFFUSERS_AVAILABLE = False


class HuggingFaceImageError(Exception):
    pass


class EduDesignService:
    """Service to generate educational designs using local diffusers library or HF Inference API.
    
    Uses local Stable Diffusion models via diffusers library (CPU or GPU).
    Falls back to HF Inference API if diffusers is not available and HF token is set.
    """

    # Local model to use (must be a diffusers-compatible model)
    DEFAULT_MODEL = os.environ.get("EDU_DESIGN_MODEL", "runwayml/stable-diffusion-v1-5")
    # DEFAULT_MODEL = os.environ.get("EDU_DESIGN_MODEL",  "SimianLuo/LCM_Dreamshaper_v7")

    
    # Instance variable for the pipeline (lazy-loaded)
    _pipeline = None
    _current_model = None

    def __init__(self, api_token: str = None):
        # Try to get HF token for future API fallback
        self.api_token = api_token
        if not self.api_token:
            for name in ("HUGGINGFACE_API_TOKEN", "HUGGINGFACE_TOKEN", "HF_TOKEN"):
                val = os.environ.get(name)
                if val:
                    self.api_token = val
                    break

        if not self.api_token:
            try:
                from config import settings
                self.api_token = getattr(settings, "HF_TOKEN", None) or getattr(settings, "HUGGINGFACE_TOKEN", None)
            except Exception:
                pass
        
        # Note: We don't require a token here since we use local models
        if not DIFFUSERS_AVAILABLE and not self.api_token:
            raise ValueError(
                "No image generation backend available. Install diffusers (pip install diffusers torch) "
                "or set HF_TOKEN for Inference API."
            )

    def _load_pipeline(self, model_id: str):
        """Lazy-load the diffusers pipeline."""
        if EduDesignService._pipeline is None or EduDesignService._current_model != model_id:
            print(f"Loading model: {model_id}...")
            try:
                device = "cuda" if os.environ.get("CUDA_AVAILABLE") == "1" else "cpu"
                EduDesignService._pipeline = StableDiffusionPipeline.from_pretrained(
                    model_id,
                    torch_dtype="torch.float16" if device == "cuda" else "torch.float32"
                )
                EduDesignService._pipeline.to(device)
                EduDesignService._current_model = model_id
                print(f"Model loaded on {device}")
            except Exception as e:
                raise HuggingFaceImageError(f"Failed to load model {model_id}: {e}")
        return EduDesignService._pipeline

    def _build_prompt(self, user_prompt: str, design_type: str, style: str = None) -> str:
        # Simple templates per design type — can be extended later
        type_templates = {
            "diagram": "A clear, labeled diagram that explains: {content}. Use clean lines and readable labels.",
            "infographic": "An engaging infographic about: {content}. Include icons, short bullets, and contrasting colors.",
            "chart": "A professional data visualization chart about: {content}. Prefer a clean, modern style with legends.",
            "mindmap": "A colorful mindmap representing: {content}. Nodes should be clear and connected.",
            "flashcards": "A set of educational flashcard visuals for: {content}. Minimal, high-contrast, with a term and definition layout.",
            "slides": "A presentation slide layout for topic: {content}. Include title area, bullet points, and a visual illustration.",
            "graphical_abstract": "A scientific graphical abstract summarizing: {content}. Focus on main idea, simple icons, and a clear flow."
        }

        template = type_templates.get(design_type, type_templates["graphical_abstract"])
        prompt = template.format(content=user_prompt)
        if style:
            prompt = f"{prompt} Style: {style}."
        # Guidance for stable-diffusion style models
        prompt += " High resolution, high detail, center composition, legible text and icons."
        return prompt

    def generate_images(self, prompt: str, design_type: str = "graphical_abstract", style: str = None,
                        width: int = 1024, height: int = 1024, negative_prompt: str = None,
                        num_images: int = 1, seed: int = None, model: str = None) -> Tuple[str, List[bytes]]:
        """Generate images using local diffusers pipeline (CPU or GPU)."""
        model = model or self.DEFAULT_MODEL
        full_prompt = self._build_prompt(prompt, design_type, style)

        try:
            pipeline = self._load_pipeline(model)
        except HuggingFaceImageError as e:
            raise e

        images_bytes: List[bytes] = []
        try:
            # Generate images using the local pipeline
            print(f"Generating {num_images} image(s) with prompt: {full_prompt[:80]}...")
            
            outputs = pipeline(
                prompt=full_prompt,
                negative_prompt=negative_prompt or "",
                num_images_per_prompt=num_images,
                height=height,
                width=width,
                num_inference_steps=25,  # Lower steps = faster; increase for better quality
                guidance_scale=7.5,
                generator=None  # TODO: use seed if provided
            )
            
            # Convert PIL images to PNG bytes
            for pil_image in outputs.images:
                buf = io.BytesIO()
                pil_image.save(buf, format="PNG")
                images_bytes.append(buf.getvalue())
            
            print(f"Generated {len(images_bytes)} image(s)")
        except Exception as e:
            raise HuggingFaceImageError(f"Error generating images: {e}")

        return model, images_bytes

    @staticmethod
    def bytes_to_base64(img_bytes: bytes) -> str:
        return base64.b64encode(img_bytes).decode("utf-8")
