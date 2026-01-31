from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import date

class ProjectContext(BaseModel):
    """Context extracted from the user's website or brief."""
    url: Optional[str] = None
    product_idea: Optional[str] = Field(None, description="A clear summary of the company/product and its core value proposition.")
    country: str = Field(default="ALL", description="Target country code (e.g., US, IN) or ALL")
    language: str = Field(default="en", description="Target language")
    category: str = Field(..., description="Inferred product category")
    icp: str = Field(..., description="Ideal Customer Profile")
    offer_constraints: List[str] = Field(default_factory=list)
    keyword_clusters: Dict[str, List[str]] = Field(default_factory=dict, description="Clusters of keywords for search")

class AdRecord(BaseModel):
    """Represents a single ad collected from Meta Ad Library."""
    advertiser: str
    start_date: Optional[str] = None
    snapshot_url: str
    primary_text: Optional[str] = None
    headline: Optional[str] = None
    cta: Optional[str] = None
    placements: List[str] = Field(default_factory=list)
    media_type: str = Field(default="unknown", description="image, video, carousel, or unknown")
    impressions_lower: Optional[int] = None
    impressions_upper: Optional[int] = None
    media_url: Optional[str] = None # For downloaded or resolved media

class AdAnalysis(BaseModel):
    """Detailed analysis of a single ad."""
    ad_snapshot_url: str
    hook_type: str = Field(..., description="Inferred hook type")
    visual_hooks: List[str] = Field(default_factory=list)
    audio_hooks: List[str] = Field(default_factory=list)
    offer_structure: str
    proof_elements: List[str]
    pacing_notes: Optional[str] = None
    copy_patterns: List[str] = Field(default_factory=list)
    ctas_alignment: str
    risks: List[str] = Field(default_factory=list)
    creative_atoms: List[str] = Field(default_factory=list, description="Fundamental building blocks identified")

class Synthesis(BaseModel):
    """Cross-ad analysis to find patterns."""
    ad_count: int
    dominant_patterns: List[Dict[str, Any]] = Field(description="List of patterns using pattern_name, frequency, confidence")
    creative_laws: List[str] = Field(description="Rules inferred from successful ads")
    fatigue_signals: List[str] = Field(description="Things that seem overused")
    untapped_angles: List[str] = Field(description="Opportunities not yet seen")
    competitor_contrast: Optional[str] = Field(None, description="A direct comparison between competitor strategies and yours.")

class GeneratedCreative(BaseModel):
    """A new ad concept generated from the synthesis."""
    concept_name: str
    hook_script: str
    visual_description: str
    why_it_works: str
    script_body: str
    cta_text: str
    suggested_visuals: List[str]

class GeneratedCreatives(BaseModel):
    """Collection of generated creatives."""
    concepts: List[GeneratedCreative]
