from typing import List
from app.models import AdRecord, AdAnalysis, Synthesis, GeneratedCreatives, GeneratedCreative, ProjectContext

import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class GeminiLLM:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-flash-latest')

    def analyze_ad(self, ad: AdRecord) -> AdAnalysis:
        if not GEMINI_API_KEY:
            # Fallback to mock if no key
            return self._mock_analyze_ad(ad)

        prompt = f"""
        Analyze this Facebook ad and provide structured insights.
        
        Ad Context:
        Overview: {ad.snapshot_url}
        Primary Text: {ad.primary_text}
        Headline: {ad.headline}
        CTA: {ad.cta}
        
        Please return a JSON object with the following fields:
        - hook_type: (e.g., Problem-Agitation-Solution, Benefit-Driven, Story-Based)
        - visual_hooks: List of visual elements that grab attention (infer from text usage if video not available, or suggest what they imply)
        - audio_hooks: List of likely audio elements (suggest based on copy tone)
        - offer_structure: (e.g., Discount, Bundle, Guarantee)
        - proof_elements: (e.g., Testimonials, Numbers, Badges)
        - pacing_notes: (e.g., Fast, Slow, Building)
        - copy_patterns: List of patterns used in the text
        - ctas_alignment: Strong/Weak
        - risks: Potential downsides or compliance issues
        - creative_atoms: Modular elements that can be reused
        """
        
        try:
            response = self.model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            import json
            data = json.loads(response.text)
            
            return AdAnalysis(
                ad_snapshot_url=ad.snapshot_url or "",
                hook_type=data.get("hook_type", "Unknown"),
                visual_hooks=data.get("visual_hooks", []),
                audio_hooks=data.get("audio_hooks", []),
                offer_structure=data.get("offer_structure", ""),
                proof_elements=data.get("proof_elements", []),
                pacing_notes=data.get("pacing_notes", ""),
                copy_patterns=data.get("copy_patterns", []),
                ctas_alignment=data.get("ctas_alignment", ""),
                risks=data.get("risks", []),
                creative_atoms=data.get("creative_atoms", [])
            )
        except Exception as e:
            print(f"Error analyzing ad with Gemini: {e}")
            return self._mock_analyze_ad(ad)

    def _mock_analyze_ad(self, ad: AdRecord) -> AdAnalysis:
         # Simulate intelligent analysis based on inputs
        hook_type = "Problem-Agitation-Solution" if "tired" in (ad.primary_text or "").lower() else "Benefit-Driven"
        
        return AdAnalysis(
            ad_snapshot_url=ad.snapshot_url,
            hook_type=hook_type,
            visual_hooks=["High contrast text overlay", "Face to camera"],
            audio_hooks=["Trending audio", "Voiceover start"],
            offer_structure="Discount + Scarcity",
            proof_elements=["Testimonial", "Trust badges"],
            pacing_notes="Fast cuts in first 3 seconds",
            copy_patterns=["Short sentences", "Emoji usage"],
            ctas_alignment="Strong",
            risks=["Might feel too salesy"],
            creative_atoms=["UGC style", "Unboxing", "Green screen"]
        )

    def synthesize(self, analyses: List[AdAnalysis], context: ProjectContext) -> Synthesis:
        if not GEMINI_API_KEY:
            return self._mock_synthesize(analyses, context)

        prompt = f"""
        Synthesize trends from these ad analyses into a winning formula and contrast them with the project context.
        
        Project Context:
        {context.model_dump_json()}

        Analyses:
        {[a.model_dump_json() for a in analyses]}
        
        Return JSON with:
        - dominant_patterns: list of {{"pattern_name", "frequency" (float), "confidence"}}
        - creative_laws: list of rules for success
        - fatigue_signals: what is being overused
        - untapped_angles: new ideas to try
        - competitor_contrast: A 2-3 sentence analysis of how these competitors' strategies differ from the project's current positioning (e.g., "They focus on speed, while you focus on reliability").
        """
        
        try:
            response = self.model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            import json
            data = json.loads(response.text)
            
            return Synthesis(
                ad_count=len(analyses),
                dominant_patterns=data.get("dominant_patterns", []),
                creative_laws=data.get("creative_laws", []),
                fatigue_signals=data.get("fatigue_signals", []),
                untapped_angles=data.get("untapped_angles", []),
                competitor_contrast=data.get("competitor_contrast", "")
            )
        except Exception as e:
             print(f"Error synthesizing with Gemini: {e}")
             return self._mock_synthesize(analyses, context)

    def _mock_synthesize(self, analyses: List[AdAnalysis], context: ProjectContext) -> Synthesis:
        return Synthesis(
            ad_count=len(analyses),
            dominant_patterns=[
                {"pattern_name": "UGC Testimonial", "frequency": 0.8, "confidence": "High"},
                {"pattern_name": "Problem First Hook", "frequency": 0.6, "confidence": "Medium"}
            ],
            creative_laws=[
                "Always start with a human face",
                "Show the product result within 3 seconds"
            ],
            fatigue_signals=["Generic stock footage", "Overused TikTok sounds"],
            untapped_angles=["ASMR unboxing", "Founder story"],
            competitor_contrast=f"While your brand focuses on {context.category}, competitors are leaning heavily into price-driven UGC hooks."
        )

    def generate_creatives(self, synthesis: Synthesis, context: ProjectContext) -> GeneratedCreatives:
        if not GEMINI_API_KEY:
            return self._mock_generate_creatives(synthesis, context)
            
        prompt = f"""
        Generate 3 net-new ad concepts based on this synthesis and project context.
        
        Context: {context.model_dump_json()}
        Synthesis: {synthesis.model_dump_json()}
        
        Return JSON object with 'concepts' array containing:
        - concept_name
        - hook_script
        - visual_description
        - why_it_works
        - script_body
        - cta_text
        - suggested_visuals (list)
        """
        
        try:
            response = self.model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            import json
            data = json.loads(response.text)
            
            concepts = []
            for c in data.get("concepts", []):
                concepts.append(GeneratedCreative(**c))
                
            return GeneratedCreatives(concepts=concepts)
        
        except Exception as e:
            print(f"Error generating creatives with Gemini: {e}")
            return self._mock_generate_creatives(synthesis, context)

    def _mock_generate_creatives(self, synthesis: Synthesis, context: ProjectContext) -> GeneratedCreatives:
        return GeneratedCreatives(
            concepts=[
                GeneratedCreative(
                    concept_name="The 'Us vs Them' Split",
                    hook_script="Stop using [Competitor Product]. Here is why...",
                    visual_description="Split screen showing the old way (struggling) vs new way (easy)",
                    why_it_works="Visual contrast creates immediate desire",
                    script_body="Most people struggle with X. Our Y solves it by...",
                    cta_text="Get 50% Off Today",
                    suggested_visuals=["Split screen", "Red X overlay", "Green checkmark"]
                ),
                GeneratedCreative(
                    concept_name="The Founder's Promise",
                    hook_script="I built this because I was tired of...",
                    visual_description="Founder talking directly to camera, selfie style",
                    why_it_works="Builds trust and personal connection",
                    script_body="I spent 2 years perfecting the formula. If you don't love it, I'll refund you.",
                    cta_text="Try Risk Free",
                    suggested_visuals=["Selfie video", "Warehouse background"]
                )
            ]
        )

llm = GeminiLLM()

def analyze_ads(ads: List[AdRecord]) -> List[AdAnalysis]:
    return [llm.analyze_ad(ad) for ad in ads]

def synthesize_and_generate(ads: List[AdRecord], context: ProjectContext) -> dict:
    analyses = analyze_ads(ads)
    synthesis = llm.synthesize(analyses, context)
    creatives = llm.generate_creatives(synthesis, context)
    
    return {
        "analyses": analyses,
        "synthesis": synthesis,
        "creatives": creatives
    }
