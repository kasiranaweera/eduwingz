Edu Design Generator
====================

This package provides a FastAPI router and service to generate educational
designs (diagrams, infographics, mindmaps, flashcards, slides, graphical
abstracts, etc.) using local text-to-image models via the `diffusers` library.

**Recommended**: Uses the `diffusers` library for local inference on CPU or GPU
(e.g., Stable Diffusion v1.5). No API quota limits, privacy-preserving, and works offline.

Quickstart
----------

### 1. Install dependencies

From the `fastapi_app` directory:

```bash
pip install -r edu_design_generator/requirements.txt
```

This installs `diffusers`, `torch`, `transformers`, and `pillow`.

### 2. (Optional) Configure the model

By default, uses `runwayml/stable-diffusion-v1-5`. To use a different model:

```bash
export EDU_DESIGN_MODEL="runwayml/stable-diffusion-v1-5"
```

### 3. Start the FastAPI app

From the `fastapi_app` directory:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Make a request

The router is mounted at `/api/edu-design` and the generate endpoint is `/api/edu-design/generate`.

Example curl:

```bash
curl -X POST "http://127.0.0.1:8000/api/edu-design/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A graphical abstract summarizing a method for teaching fractions using visual blocks and examples",
    "design_type": "graphical_abstract",
    "style": "flat, vector icons, minimal",
    "width": 1024,
    "height": 1024,
    "num_images": 1
  }'
```

The response contains base64-encoded PNG images in JSON format.

Request schema
--------------

- `prompt`: text describing content (required)
- `design_type`: one of `diagram`, `infographic`, `chart`, `mindmap`, `flashcards`, `slides`, `graphical_abstract`
- `style`: optional style hint (e.g., "flat, vector, minimal")
- `width`/`height`: image size in pixels (default: 1024x1024)
- `negative_prompt`: optional text to exclude from generation
- `num_images`: 1-4 (default: 1)
- `seed`: optional RNG seed for reproducibility

Response
--------

```json
{
  "images": [
    {
      "base64": "iVBORw0KGgoAAAANS...",
      "mime": "image/png"
    }
  ],
  "model": "runwayml/stable-diffusion-v1-5",
  "prompt": "..."
}
```

First run will download the model (~4GB for SD v1.5). Subsequent runs use the cached model.

Performance notes
-----------------

- **CPU**: ~1-2 min per image (depending on resolution and CPU)
- **GPU (NVIDIA)**: ~5-10 sec per image with CUDA
- To enable GPU: ensure PyTorch is built with CUDA support, or set `CUDA_AVAILABLE=1`

Notes and next steps
--------------------

- This implementation uses local diffusers models (CPU or GPU).
- Future improvements:
  - Add streaming/progress tracking for long generations
  - Support SVG/vector output for diagrams (via post-processing or specialized models)
  - Add layout templates for multi-slide outputs
  - Add rate-limiting and request queueing
  - Support additional backends (Replicate, Stability AI, etc.)

