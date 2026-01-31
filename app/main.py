from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from app.services.extractor import analyze_url, refine_context_with_llm
from app.services.ad_library import generate_search_urls, search_ads_real
from app.services.analysis import synthesize_and_generate
from app.services.hooks import generate_strategic_hooks
from app.models import ProjectContext, AdRecord

app = FastAPI(title="Meta Ad Agent API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UrlRequest(BaseModel):
    url: str
    country: str = "ALL"

class RefinementRequest(BaseModel):
    context: ProjectContext
    refinement_message: str

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Meta Ad Agent API is running"}

@app.post("/api/extract-context")
async def extract_context_endpoint(request: UrlRequest):
    try:
        context = analyze_url(request.url, request.country)
        return {
            "context": context,
            "keywords": context.keyword_clusters.get("primary", []) + context.keyword_clusters.get("secondary", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/refine-context")
async def refine_context_endpoint(request: RefinementRequest):
    try:
        context = refine_context_with_llm(request.context, request.refinement_message)
        return {
            "context": context,
            "keywords": context.keyword_clusters.get("primary", []) + context.keyword_clusters.get("secondary", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SearchRequest(BaseModel):
    keywords: List[str]
    country: str = "ALL"

@app.post("/api/search-ads")
async def search_ads_endpoint(request: SearchRequest):
    try:
        ads = await search_ads_real(request.keywords, request.country)
        return {"ads": ads}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AnalysisRequest(BaseModel):
    items: List[AdRecord]
    context: ProjectContext

@app.post("/api/analyze")
async def analyze_ads_endpoint(request: AnalysisRequest):
    try:
        result = synthesize_and_generate(request.items, request.context)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class HooksRequest(BaseModel):
    context: ProjectContext
    triggers: List[str]

@app.post("/api/generate-hooks")
async def generate_hooks_endpoint(request: HooksRequest):
    try:
        hooks = generate_strategic_hooks(request.context, request.triggers)
        return {"hooks": hooks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
