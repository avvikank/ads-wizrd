export interface AdRecord {
    advertiser: string;
    snapshot_url: string;
    primary_text: string;
    headline: string;
    cta: string;
    media_type: string;
    placements: string[];
    media_url?: string;
}

export interface AdAnalysis {
    ad_snapshot_url: string;
    hook_type: string;
    visual_hooks: string[];
    audio_hooks: string[];
    offer_structure: string;
    proof_elements: string[];
    pacing_notes?: string;
    copy_patterns: string[];
    ctas_alignment: string;
    risks: string[];
    creative_atoms: string[];
}

export interface ProjectContext {
    url?: string;
    product_idea?: string;
    category: string;
    icp: string;
    keyword_clusters: Record<string, string[]>;
    offer_constraints: string[];
}
