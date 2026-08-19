import io
import hashlib
import numpy as np
from PIL import Image, ExifTags
import imagehash
import torch
from sklearn.metrics.pairwise import cosine_similarity
from transformers import pipeline, CLIPProcessor, CLIPModel
from sentence_transformers import SentenceTransformer
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Civic Image Verification API")

# Allow your HTML/JS frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
CIVIC_CATEGORIES = [
    "pothole", "garbage or waste", "broken streetlight",
    "graffiti", "blocked drain", "damaged road sign",
    "illegal parking", "public nuisance", "roadkill",
    "fallen tree", "water leak", "fire hazard"
]

# Load AI Models
clip_embedder = SentenceTransformer("clip-ViT-B-32", device=DEVICE)
ai_detector = pipeline("image-classification", model="umm-maybe/AI-image-detector", device=0 if torch.cuda.is_available() else -1)
clip_zero_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(DEVICE)
clip_zero_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

image_database = []

@app.post("/api/verify")
async def verify_image(file: UploadFile = File(...)):
    contents = await file.read()
    sha256 = hashlib.sha256(contents).hexdigest()
    
    try:
        image = Image.open(io.BytesIO(contents))
        rgb_image = image.convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file format.")

    # Process AI & Hashes
    embedding = clip_embedder.encode(rgb_image, normalize_embeddings=True)
    ai_raw = ai_detector(rgb_image)
    
    ai_score = sum(x["score"] for x in ai_raw if any(w in x["label"].lower() for w in ["ai", "artificial", "fake", "synthetic"]))
    ai_status = "LIKELY_AI" if ai_score >= 0.80 else ("LIKELY_REAL" if ai_score <= 0.20 else "UNCERTAIN")

    inputs = clip_zero_processor(text=CIVIC_CATEGORIES, images=rgb_image, return_tensors="pt", padding=True).to(DEVICE)
    with torch.no_grad():
        outputs = clip_zero_model(**inputs)
    probabilities = outputs.logits_per_image.softmax(dim=1)[0].cpu().numpy()
    top_idx = int(np.argmax(probabilities))
    
    # Check for duplicates
    is_duplicate = any(rec["sha256"] == sha256 for rec in image_database)
    
    image_database.append({"filename": file.filename, "sha256": sha256})

    status = "LIKELY_VALID"
    if is_duplicate:
        status = "REJECT_DUPLICATE"
    elif ai_status == "LIKELY_AI":
        status = "REVIEW_AI_IMAGE"
    elif float(probabilities[top_idx]) < 0.45:
        status = "MANUAL_REVIEW"

    return {
        "status": status,
        "civic_issue": {"category": CIVIC_CATEGORIES[top_idx], "confidence": round(float(probabilities[top_idx]), 4)},
        "ai_detection": {"probability": round(ai_score, 4), "status": ai_status}
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
