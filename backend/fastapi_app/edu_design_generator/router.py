from fastapi import APIRouter, HTTPException
from .schemas import DesignRequest, DesignResponse, ImageResult
from .service import EduDesignService, HuggingFaceImageError
from typing import List

router = APIRouter()


@router.post("/generate", response_model=DesignResponse)
async def generate_design(request: DesignRequest):
    """Generate educational graphics using Hugging Face models.

    This endpoint returns base64-encoded images and meta info about the model used.
    """
    try:
        service = EduDesignService()
    except ValueError as e:
        # Token not configured
        raise HTTPException(status_code=500, detail=str(e))

    try:
        model, images = service.generate_images(
            prompt=request.prompt,
            design_type=request.design_type,
            style=request.style,
            width=request.width,
            height=request.height,
            negative_prompt=request.negative_prompt,
            num_images=request.num_images,
            seed=request.seed
        )

        results: List[ImageResult] = []
        for img in images:
            results.append(ImageResult(base64=EduDesignService.bytes_to_base64(img), mime="image/png"))

        return DesignResponse(images=results, model=model, prompt=request.prompt)

    except HuggingFaceImageError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")
