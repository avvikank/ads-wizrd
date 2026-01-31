import trafilatura
from collections import Counter
import re
from typing import List, Dict
from app.models import ProjectContext

def extract_text_from_url(url: str) -> str:
    downloaded = trafilatura.fetch_url(url)
    if not downloaded:
        raise ValueError(f"Could not fetch URL: {url}")
    text = trafilatura.extract(downloaded)
    if not text:
        raise ValueError(f"Could not extract text from URL: {url}")
    return text

import os
import json
import google.generativeai as genai

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def extract_keywords(text: str, top_n: int = 10) -> List[str]:
    # Fallback to simple extraction if LLM fails or for redundancy
    words = re.findall(r'\w+', text.lower())
    stop_words = set(['the', 'and', 'to', 'of', 'a', 'in', 'is', 'it', 'for', 'with', 'on', 'that', 'this', 'are', 'as', 'be', 'by', 'at', 'from', 'or', 'an', 'not', 'your', 'we', 'can', 'you', 'if', 'will', 'all', 'has', 'more', 'about', 'our', 'us'])
    filtered_words = [w for w in words if w not in stop_words and len(w) > 3]
    count = Counter(filtered_words)
    return [word for word, _ in count.most_common(top_n)]

def analyze_url_with_llm(text: str, url: str) -> Dict:
    if not GEMINI_API_KEY:
        print("Warning: GEMINI_API_KEY not found. Using heuristics.")
        return {}

    prompt = f"""
    Analyze the following website content and extract structured information for a marketing campaign.
    
    URL: {url}
    Content Snippet: {text[:10000]}  # Limit context window if needed

    Return a valid JSON object with the following keys and no markdown formatting:
    - product_idea: A clear, 1-2 sentence summary of the company/product and its value prop.
    - category: The specific industry or niche (e.g., "SaaS - Email Marketing", "E-commerce - Women's Fashion").
    - icp: A concise description of the Ideal Customer Profile.
    - keyword_clusters: A dictionary where keys are themes (e.g., "features", "pain_points") and values are lists of relevant keywords.
    - offer_constraints: A list of noticed constraints (e.g., "US only", "requires demo", "subscription based").
    """

    model = genai.GenerativeModel('gemini-flash-latest')
    try:
        response = model.generate_content(prompt)
        content = response.text.replace('```json', '').replace('```', '').strip()
        data = json.loads(content)
        return data
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return {}

def analyze_url(url: str, country: str = "ALL") -> ProjectContext:
    text = extract_text_from_url(url)
    
    # LLM Extraction
    llm_data = analyze_url_with_llm(text, url)
    
    # Fallbacks
    keywords = extract_keywords(text, top_n=15)
    
    product_idea = llm_data.get("product_idea", "Company/Product analysis pending.")
    category = llm_data.get("category", "General")
    if category == "General":
        if 'software' in text.lower(): category = "SaaS"
        elif 'shop' in text.lower(): category = "E-commerce"

    icp = llm_data.get("icp", "Unknown (Could not extract)")
    
    keyword_clusters = llm_data.get("keyword_clusters", {
        "primary": keywords[:5], 
        "secondary": keywords[5:]
    })
    
    offer_constraints = llm_data.get("offer_constraints", [])

    return ProjectContext(
        url=url,
        product_idea=product_idea,
        country=country,
        category=category,
        icp=icp,
        keyword_clusters=keyword_clusters,
        offer_constraints=offer_constraints
    )

def refine_context_with_llm(context: ProjectContext, refinement_message: str) -> ProjectContext:
    if not GEMINI_API_KEY:
        context.icp += f" (Refined: {refinement_message})"
        return context

    prompt = f"""
    Update the following project context based on the user's refinement message.
    
    Current Context:
    {context.model_dump_json()}
    
    Refinement Message:
    "{refinement_message}"
    
    Return a valid JSON object with the UPDATED keys only. Do not change keys that are not affected.
    Keys: product_idea, category, icp, keyword_clusters, offer_constraints.
    """

    model = genai.GenerativeModel('gemini-flash-latest')
    try:
        response = model.generate_content(prompt)
        content = response.text.replace('```json', '').replace('```', '').strip()
        import json
        data = json.loads(content)
        
        # Patch the context
        for key, value in data.items():
            if hasattr(context, key):
                setattr(context, key, value)
                
        return context
    except Exception as e:
        print(f"Error refining with Gemini: {e}")
        context.icp += f" (Refined: {refinement_message})"
        return context
