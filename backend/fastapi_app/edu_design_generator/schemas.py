from pydantic import BaseModel, Field
from typing import Optional, List


class DesignRequest(BaseModel):
    prompt: str = Field(..., description="Main text prompt describing the design content")
    design_type: str = Field(
        default="graphical_abstract",
        description="Type of design: diagram, infographic, chart, mindmap, flashcards, slides, graphical_abstract"
    )
    style: Optional[str] = Field(default=None, description="Art style hint, e.g. flat, isometric, minimal, sketch")
    width: Optional[int] = Field(default=1024, description="Width in pixels for the generated image")
    height: Optional[int] = Field(default=1024, description="Height in pixels for the generated image")
    negative_prompt: Optional[str] = None
    num_images: Optional[int] = Field(default=1, ge=1, le=4)
    seed: Optional[int] = Field(default=None, description="Optional RNG seed for deterministic outputs")


class ImageResult(BaseModel):
    base64: str
    mime: str


class DesignResponse(BaseModel):
    images: List[ImageResult]
    model: str
    prompt: str
