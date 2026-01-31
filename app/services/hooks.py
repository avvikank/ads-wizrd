import os
import json
import google.generativeai as genai
from typing import List, Dict
from app.models import ProjectContext

# Setup Gemini
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("Warning: GEMINI_API_KEY not found in hooks service.")

def generate_strategic_hooks(context: ProjectContext, triggers: List[str]) -> List[Dict[str, str]]:
    """Generates ad hooks based on context and selected emotional triggers."""
    # Hardcoded check for placeholder keys to force mock behavior for demo
    is_placeholder = not api_key or "your-" in api_key or api_key == "dummy"
    if is_placeholder:
        return [
            {"text": f"Is your {context.category} approach costing you clients?", "trigger": "Fear", "angle": "Opportunity Cost"},
            {"text": f"The secret to scaling {context.category} in 2026.", "trigger": "Curiosity", "angle": "Future-Proofing"},
            {"text": f"How we helped {context.icp} double their ROI.", "trigger": "Social Proof", "angle": "Results-Based"}
        ]

    prompt = f"""
    You are an expert Performance Marketer and Copywriter specializing in Meta Ads.
    Your goal is to generate high-converting "Hooks" (the first 1-2 sentences of an ad) for the following business:
    
    URL: {context.url}
    Category: {context.category}
    Ideal Customer (ICP): {context.icp}
    
    Requested Emotional Triggers: {", ".join(triggers)}
    
    Instructions:
    1. Generate 3 distinct hooks for EACH trigger.
    2. Each hook should be punchy, curiosity-driven, or direct, depending on the trigger.
    3. Use the "Creative Laws" of modern social advertising: punchy, short, and benefit-led.
    4. Provide the result as a JSON array of objects with keys: "text", "trigger", and "angle".
    
    Example Output:
    [
        {{"text": "Is your current solution costing you $10k/month?", "trigger": "Fear", "angle": "Sunk Cost"}},
        ...
    ]
    """

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        # Clean up JSON from response
        content = response.text.strip()
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        return json.loads(content)
    except Exception as e:
        print(f"Hook generation failed: {e}")
        return [
            {"text": f"Tired of struggling with {context.category}?", "trigger": "Pain", "angle": "Empathy"},
            {"text": f"What if you could automate your entire {context.category} workflow?", "trigger": "Greed", "angle": "Efficiency"}
        ]
