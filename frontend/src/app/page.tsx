"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search, CheckCircle2, LayoutGrid, Zap, ArrowRight,
    Loader2, Sparkles, Globe, Target, BarChart3,
    Layers, ChevronRight, Play, Image as ImageIcon,
    Clock, MousePointer2, Info, ChevronDown, Trash2
} from 'lucide-react';
import { ProjectContext, AdRecord } from './types';

export default function Home() {
    const [step, setStep] = useState<'input' | 'keywords' | 'gallery' | 'analysis'>('input');
    const [url, setUrl] = useState('');
    const [country, setCountry] = useState('IN');
    const [loading, setLoading] = useState(false);
    const [context, setContext] = useState<ProjectContext | null>(null);
    const [keywords, setKeywords] = useState<{ text: string, checked: boolean }[]>([]);
    const [ads, setAds] = useState<AdRecord[]>([]);
    const [selectedAds, setSelectedAds] = useState<string[]>([]);
    const [refinementMessage, setRefinementMessage] = useState('');
    const [showRefinement, setShowRefinement] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [generatedHooks, setGeneratedHooks] = useState<{ text: string, trigger: string, angle: string }[]>([]);
    const [selectedTriggers, setSelectedTriggers] = useState<string[]>(['Curiosity', 'Benefit-Led']);
    const [generatingHooks, setGeneratingHooks] = useState(false);

    const startExtraction = async () => {
        if (!url) return;
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await axios.post(`${apiUrl}/api/extract-context`, { url, country });
            const ctx = response.data.context;
            setContext(ctx);
            const kws = response.data.keywords.map((k: string) => ({ text: k, checked: true }));
            setKeywords(kws);
            setStep('keywords');
        } catch (error) {
            console.error("Extraction failed", error);
            alert("Failed to analyze website. Ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const refineContext = async () => {
        if (!context || !refinementMessage) return;
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await axios.post(`${apiUrl}/api/refine-context`, {
                context,
                refinement_message: refinementMessage
            });
            setContext(response.data.context);
            const kws = response.data.keywords.map((k: string) => ({ text: k, checked: true }));
            setKeywords(kws);
            setRefinementMessage('');
            setShowRefinement(false);
        } catch (error) {
            console.error("Refinement failed", error);
        } finally {
            setLoading(false);
        }
    };

    const performSearch = async () => {
        setLoading(true);
        try {
            const selectedKws = keywords.filter(k => k.checked).map(k => k.text);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await axios.post(`${apiUrl}/api/search-ads`, {
                keywords: selectedKws,
                country: country
            });
            setAds(response.data.ads);
            setStep('gallery');
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAdSelection = (adUrl: string) => {
        if (selectedAds.includes(adUrl)) {
            setSelectedAds(selectedAds.filter(u => u !== adUrl));
        } else if (selectedAds.length < 10) {
            setSelectedAds([...selectedAds, adUrl]);
        }
    };

    const performAnalysis = async () => {
        if (selectedAds.length === 0) return;
        setLoading(true);
        try {
            const selectedItems = ads.filter(ad => selectedAds.includes(ad.snapshot_url));
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await axios.post(`${apiUrl}/api/analyze`, {
                items: selectedItems,
                context: context
            });
            setAnalysisResult(response.data);
            setStep('analysis');
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setLoading(false);
        }
    };

    const generateHooks = async () => {
        if (!context || selectedTriggers.length === 0) return;
        setGeneratingHooks(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await axios.post(`${apiUrl}/api/generate-hooks`, {
                context,
                triggers: selectedTriggers
            });
            setGeneratedHooks(response.data.hooks);
        } catch (error) {
            console.error("Hook generation failed", error);
        } finally {
            setGeneratingHooks(false);
        }
    };

    const smartSelectTopAds = () => {
        // Proxy logic: select first 5 ads if available
        const top5 = ads.slice(0, 5).map(ad => ad.snapshot_url);
        setSelectedAds(top5);
    };

    const copyAllHooks = () => {
        const text = generatedHooks.map(h => `[${h.trigger} - ${h.angle}]\n${h.text}`).join('\n\n');
        navigator.clipboard.writeText(text);
        alert("All hooks copied to clipboard in batch format!");
    };

    // Skeleton System for Expert Polish
    const AdGallerySkeleton = () => (
        <div className="gallery-grid">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton-card skeleton-pro" />
            ))}
        </div>
    );

    const AnalysisSkeleton = () => (
        <div className="space-y-24 animate-pulse">
            <div className="space-y-8">
                <div className="h-10 w-64 bg-white/5 rounded mx-auto" />
                <div className="h-24 w-1/2 bg-white/5 rounded-lg mx-auto" />
            </div>
            <div className="h-[400px] bg-white/5 rounded-xl border border-white/5" />
            <div className="grid md:grid-cols-2 gap-8">
                <div className="h-64 bg-white/5 rounded-xl" />
                <div className="h-64 bg-white/5 rounded-xl" />
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen transition-all duration-500 ${selectedAds.length > 0 ? 'pb-48' : ''}`}>
            {/* Hyper-Pro Header - Optimized for Vertical Space */}
            <nav className="fixed top-0 inset-x-0 h-14 bg-black/60 backdrop-blur-xl border-b border-white/[0.04] z-[100] flex items-center justify-between px-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setStep('input')}>
                        <div className="w-6 h-6 bg-[#3b82f6] rounded flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                            <Zap className="icon-sm text-white fill-white" />
                        </div>
                        <span className="text-xs font-bold tracking-widest uppercase text-white/90">MetaAgent</span>
                    </div>

                    {context && step !== 'input' && (
                        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-white/[0.08]">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 bg-white/[0.02] px-3 py-1 rounded-full border border-white/[0.04]">
                                <Globe className="icon-xs text-[#3b82f6]" />
                                <span className="truncate max-w-[120px]">{context.url}</span>
                                <span className="text-neutral-800 mx-1">/</span>
                                <Target className="icon-xs" />
                                <span>{context.category}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center gap-5">
                        {['Search', 'Target', 'Library', 'Insights'].map((l, i) => {
                            const steps: Array<'input' | 'keywords' | 'gallery' | 'analysis'> = ['input', 'keywords', 'gallery', 'analysis'];
                            const isCurrent = steps[i] === step;
                            const isPast = steps.indexOf(step) > i;

                            return (
                                <button
                                    key={l}
                                    onClick={() => isPast && setStep(steps[i])}
                                    className={`flex items-center gap-2 transition-all ${isPast ? 'hover:text-white cursor-pointer' : 'cursor-default'}`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full transition-all ${isCurrent ? 'bg-[#2563eb] shadow-[0_0_8px_#2563eb]' : isPast ? 'bg-emerald-500' : 'bg-white/10'}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-white' : isPast ? 'text-neutral-400' : 'text-neutral-700'}`}>{l}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Direct Access
                    </div>
                </div>
            </nav>

            <main className="pt-28 pb-32 max-w-6xl mx-auto px-6">

                {/* Step 1: Input (Hyper-Pro Layout) */}
                {step === 'input' && (
                    <div className="max-w-3xl mx-auto space-y-16 animate-slide-up">
                        <div className="space-y-6 text-center">
                            <h1 className="heading-display">The ad agency <br /> inside your machine.</h1>
                            <p className="text-neutral-500 text-xl font-medium max-w-xl mx-auto">
                                Deploy our crawler to the Meta Ad Library. <br />
                                Deconstruct competitors. Build winners.
                            </p>
                        </div>

                        <div className="bezel-card !p-1.5 focus-within:border-[#2563eb]/40 transition-all duration-500">
                            <div className="flex items-center gap-1 p-1.5 bg-black/60 rounded-[8px]">
                                <div className="px-4">
                                    <Search className="icon-md text-neutral-600" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter your target URL (e.g., v0.dev)..."
                                    className="flex-1 bg-transparent border-none py-4 text-lg text-white outline-none placeholder:text-neutral-800 font-medium"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && startExtraction()}
                                />
                                <div className="px-3">
                                    <select
                                        className="bg-zinc-900 text-[11px] font-bold py-2 px-4 rounded border border-white/5 text-neutral-400 outline-none hover:bg-zinc-800 transition-colors cursor-pointer"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                    >
                                        <option value="ALL">GLOBAL</option>
                                        <option value="US">USA</option>
                                        <option value="IN">IND</option>
                                        <option value="GB">GBR</option>
                                    </select>
                                </div>
                                <button
                                    onClick={startExtraction}
                                    disabled={loading || !url}
                                    className="btn-tactical btn-primary h-12 px-8 rounded-[6px]"
                                >
                                    {loading ? <Loader2 className="animate-spin icon-md" /> : "Automate Scan"}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-center gap-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
                            {['Playwright', 'Gemini 1.5', 'Facebook SDK'].map(p => (
                                <span key={p} className="text-[10px] font-black uppercase tracking-[0.3em] font-mono">{p}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Refinement (Bezel Density) */}
                {step === 'keywords' && context && (
                    <div className="space-y-12 animate-slide-up">
                        <header className="flex items-end justify-between border-b border-white/[0.04] pb-8">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold tracking-tight">Strategy Parameters</h1>
                                <p className="text-sm text-neutral-500 font-medium">Heuristics extracted from <span className="text-white">{url}</span>.</p>
                            </div>
                            <button
                                onClick={() => setShowRefinement(!showRefinement)}
                                className="btn-tactical bg-white/5 border-white/10 text-xs hover:bg-white/10"
                            >
                                <Sparkles className="icon-sm text-[#3b82f6]" />
                                {showRefinement ? "Review context" : "Refine heuristic"}
                            </button>
                        </header>

                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <section className="bezel-card p-10 space-y-12">
                                    <div className="grid sm:grid-cols-2 gap-16">
                                        <div className="space-y-5">
                                            <p className="label-caps">Niche Classification</p>
                                            <div className="space-y-2">
                                                <p className="text-2xl font-bold tracking-tight">{context.category}</p>
                                                <div className="h-0.5 w-8 bg-[#2563eb]/40" />
                                            </div>
                                        </div>
                                        <div className="space-y-5">
                                            <p className="label-caps">Target Persona</p>
                                            <p className="text-sm font-medium text-neutral-400 leading-relaxed italic border-l-2 border-white/5 pl-6">
                                                {context.icp}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-12 border-t border-white/[0.04]">
                                        <div className="flex items-center justify-between">
                                            <p className="label-caps">High-Intent Keywords</p>
                                            <span className="text-[10px] font-black text-[#2563eb]">{keywords.filter(k => k.checked).length} ARMED</span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {keywords.map((kw, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => {
                                                        const n = [...keywords];
                                                        n[i].checked = !n[i].checked;
                                                        setKeywords(n);
                                                    }}
                                                    className={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${kw.checked
                                                        ? 'bg-[#3b82f6]/10 border-[#3b82f6] shadow-lg shadow-[#3b82f6]/5'
                                                        : 'bg-black/40 border-white/[0.04] text-neutral-500 hover:border-white/20'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={kw.checked}
                                                        readOnly
                                                        className="checkbox-custom"
                                                    />
                                                    <span className={`text-[13px] font-bold ${kw.checked ? 'text-white' : 'text-neutral-500'}`}>
                                                        {kw.text}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {showRefinement && (
                                    <div className="bezel-card !bg-[#2563eb]/5 border-[#2563eb]/20 p-6 flex flex-col gap-4 animate-slide-up">
                                        <div className="flex items-center gap-2 text-[#2563eb]">
                                            <Sparkles size={16} />
                                            <span className="text-xs font-bold uppercase tracking-widest">Natural Language Pivot</span>
                                        </div>
                                        <textarea
                                            placeholder="Direct the engine, e.g. 'Focus only on the B2B enterprise segment...'"
                                            className="w-full bg-black/40 border border-white/[0.08] p-4 rounded-md text-sm text-white outline-none focus:border-[#2563eb]/40 h-28 resize-none font-medium"
                                            value={refinementMessage}
                                            onChange={(e) => setRefinementMessage(e.target.value)}
                                        />
                                        <div className="flex justify-end">
                                            <button onClick={refineContext} className="btn-tactical btn-primary h-9 text-[11px]">Re-calibrate Logic</button>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={performSearch}
                                    disabled={loading}
                                    className="btn-tactical btn-primary w-full h-14 text-[13px] tracking-[0.2em] uppercase font-black"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-4">
                                            <Loader2 className="animate-spin icon-md" />
                                            <span>Scanning Library...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <LayoutGrid className="icon-md" />
                                            <span>Execute Real-Time Search</span>
                                        </div>
                                    )}
                                </button>
                            </div>

                            <aside className="space-y-6">
                                <div className="bezel-card p-6 space-y-8">
                                    <h4 className="label-caps">Agent Intelligence</h4>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Crawl Engine', val: 'Async Playwright' },
                                            { label: 'LLM Synthesis', val: 'Gemini 1.5' },
                                            { label: 'Geography', val: country }
                                        ].map(item => (
                                            <div key={item.label} className="flex flex-col gap-1 text-[11px]">
                                                <span className="text-neutral-600 font-bold tracking-tight">{item.label}</span>
                                                <span className="text-neutral-200 font-medium">{item.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-5 bezel-card border-amber-500/20 bg-amber-500/5">
                                    <p className="text-[11px] text-amber-500/80 leading-relaxed font-bold italic">
                                        Headless detection bypass active. Real-time data will be sanitized for analysis loops.
                                    </p>
                                </div>
                            </aside>
                        </div>
                    </div>
                )}

                {/* Step 3: Gallery (Hyper-Pro Matrix) */}
                {step === 'gallery' && (
                    <div className="space-y-12 animate-slide-up">
                        <header className="flex items-end justify-between border-b border-white/[0.04] pb-8">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold tracking-tight">Ad Repository</h1>
                                <p className="text-sm text-neutral-500 font-medium">Found <span className="text-white">{ads.length} variants</span> worth analyzing.</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={smartSelectTopAds}
                                    className="btn-tactical bg-[#3b82f6]/10 border-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/20 px-6 h-10"
                                >
                                    <Sparkles className="icon-sm mr-2" />
                                    <span>Smart Select Winners</span>
                                </button>
                                <div className="h-10 w-px bg-white/10 mx-2" />
                            </div>
                        </header>

                        {loading ? <AdGallerySkeleton /> : (
                            <div className="gallery-grid">
                                {ads.map((ad, i) => {
                                    const isSelected = selectedAds.includes(ad.snapshot_url);
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => toggleAdSelection(ad.snapshot_url)}
                                            className={`bezel-card group cursor-pointer overflow-hidden transition-all duration-500 ${isSelected ? 'ring-2 ring-[#3b82f6] !border-[#3b82f6]/40' : ''}`}
                                        >
                                            <div className="relative aspect-[4/5] bg-neutral-900 flex items-center justify-center overflow-hidden">
                                                {/* Fallback blurred background for aspect ratio containment */}
                                                {ad.media_url && (
                                                    <img src={ad.media_url} className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 scale-150" alt="" />
                                                )}

                                                {ad.media_url ? (
                                                    <img src={ad.media_url} className="relative z-10 w-full h-full object-contain grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" alt="ad" />
                                                ) : (
                                                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-neutral-800 gap-2">
                                                        {ad.media_type === 'video' ? <Play className="icon-lg" /> : <ImageIcon className="icon-lg" />}
                                                    </div>
                                                )}

                                                {/* Status Badge */}
                                                <div className="absolute top-4 left-4 flex gap-1.5 pointer-events-none z-20">
                                                    <div className="bg-[#3b82f6] text-white text-[8px] font-black px-2 py-0.5 rounded shadow-[0_4px_10px_rgba(0,0,0,0.5)] uppercase tracking-widest border border-white/10">Active</div>
                                                </div>

                                                {/* Selection Overlay */}
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-[#3b82f6]/10 backdrop-blur-[1px] border-2 border-[#3b82f6] pointer-events-none z-30" />
                                                )}

                                                {/* Selection Badge (Implicit visibility fix) */}
                                                {isSelected && (
                                                    <div className="selection-badge">
                                                        <CheckCircle2 size={16} strokeWidth={3} />
                                                    </div>
                                                )}

                                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black to-transparent pt-16 z-20">
                                                    <p className="label-caps !text-white truncate drop-shadow-md">{ad.advertiser}</p>
                                                </div>
                                            </div>
                                            <div className="p-5 space-y-4">
                                                <p className="text-[12px] font-bold leading-tight line-clamp-2 text-neutral-300 h-9">{ad.headline || "Hook deconstruction in progress..."}</p>
                                                <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                                                    <span className="text-[10px] font-black text-[#3b82f6] uppercase tracking-wider">{ad.cta || 'LEARN MORE'}</span>
                                                    <ChevronRight className="icon-sm text-neutral-700 group-hover:text-white transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Selection Tray (Hyper-Pro) */}
                        <div className={`selection-tray ${selectedAds.length > 0 ? 'visible' : ''}`}>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#3b82f6]/20 flex items-center justify-center border border-[#3b82f6]/30">
                                    <Sparkles className="icon-sm text-[#3b82f6]" />
                                </div>
                                <span className="text-xs font-bold text-white/90 uppercase tracking-tighter">
                                    {selectedAds.length} Variants Selected
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSelectedAds([])}
                                    className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="icon-md" />
                                </button>
                                <button
                                    onClick={performAnalysis}
                                    disabled={loading}
                                    className="btn-tactical btn-primary !rounded-full !py-2 !h-auto !px-8 text-xs shadow-xl"
                                >
                                    {loading ? <Loader2 className="animate-spin icon-sm" /> : "Synthesize Strategy"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Analysis (SaaS Dashboard) */}
                {step === 'analysis' && analysisResult && (
                    <div className="space-y-8 animate-slide-up pb-32">
                        {/* Dashboard Toolbar */}
                        <div className="flex items-center justify-between border-b border-white/[0.04] pb-6">
                            <div className="flex flex-col">
                                <h1 className="text-[16px] font-black tracking-tight text-white/90">Intelligence Dashboard</h1>
                                <div className="flex items-center gap-2 text-[9px] uppercase tracking-wider font-bold text-neutral-600">
                                    <span className="text-[#3b82f6]">Live Intelligence</span>
                                    <span className="text-neutral-800">•</span>
                                    <span>REF-{Math.random().toString(36).substring(7).toUpperCase()}</span>
                                    <span className="text-neutral-800">•</span>
                                    <span>{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button className="btn-tactical bg-white/5 border-white/10 px-4 h-9 text-[10px] uppercase">
                                    <Layers className="icon-xs" /> Share Briefing
                                </button>
                                <button className="btn-tactical btn-primary px-5 h-9 text-[10px] uppercase">
                                    <Zap className="icon-xs" /> Export Deck
                                </button>
                            </div>
                        </div>

                        {loading ? <AnalysisSkeleton /> : (
                            <div className="space-y-6">
                                {/* KPI Metric Row */}
                                <div className="kpi-grid">
                                    <div className="kpi-card">
                                        <span className="kpi-label">Primary Lever</span>
                                        <span className="kpi-value text-blue-500">{analysisResult.synthesis.dominant_patterns[0]?.pattern_name.split(' ')[0] || "Curiosity"}</span>
                                    </div>
                                    <div className="kpi-card">
                                        <span className="kpi-label">Statistical Weight</span>
                                        <span className="kpi-value text-emerald-500">{Math.round(analysisResult.synthesis.dominant_patterns[0]?.frequency * 100 || 85)}%</span>
                                    </div>
                                    <div className="kpi-card">
                                        <span className="kpi-label">Growth Potential</span>
                                        <span className="kpi-value text-amber-500">EXPERT</span>
                                    </div>
                                    <div className="kpi-card">
                                        <span className="kpi-label">Market Moat</span>
                                        <span className="kpi-value text-white">HIGH</span>
                                    </div>
                                </div>

                                {/* Main Dashboard Bento Grid */}
                                <div className="grid grid-cols-12 gap-3">
                                    {/* Widget 1: The Moat (Strategy Synthesis) - Span 8 */}
                                    <div className="col-span-12 lg:col-span-8">
                                        <div className="widget-tile !border-[#3b82f6]/20 bg-[#3b82f6]/[0.02]">
                                            <div className="widget-header">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="icon-xs text-[#3b82f6]" />
                                                    <span className="kpi-label !text-white !text-[9px]">Strategy Synthesis</span>
                                                </div>
                                                <Info className="icon-xs text-neutral-800" />
                                            </div>
                                            <div className="widget-body">
                                                <div className="flex flex-col gap-4">
                                                    <div className="bg-black/60 p-4 rounded-lg border border-white/5 relative">
                                                        <p className="text-[12px] italic leading-relaxed text-blue-100/70 font-medium">
                                                            {analysisResult.synthesis.competitor_contrast}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                                                        {analysisResult.synthesis.creative_laws.slice(0, 4).map((law: string, i: number) => (
                                                            <div key={i} className="flex gap-1.5 items-center text-[10px] font-bold text-neutral-500">
                                                                <div className="w-1 h-1 rounded-full bg-[#3b82f6]" />
                                                                <span>{law}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Widget 2: Pattern Distribution - Span 4 */}
                                    <div className="col-span-12 lg:col-span-4">
                                        <div className="widget-tile">
                                            <div className="widget-header">
                                                <div className="flex items-center gap-2">
                                                    <BarChart3 className="icon-xs text-emerald-500" />
                                                    <span className="kpi-label !text-white !text-[9px]">Prevalence Matrix</span>
                                                </div>
                                            </div>
                                            <div className="widget-body">
                                                <div className="space-y-4">
                                                    {analysisResult.synthesis.dominant_patterns.map((p: any, i: number) => (
                                                        <div key={i} className="space-y-1.5">
                                                            <div className="flex justify-between text-[9px] font-black tracking-tight">
                                                                <span className="text-neutral-500 uppercase">{p.pattern_name}</span>
                                                                <span className="text-blue-500">{Math.round(p.frequency * 100)}%</span>
                                                            </div>
                                                            <div className="progress-bar-pro w-full !h-1">
                                                                <div className="progress-fill-pro !bg-emerald-500 transition-all duration-1000" style={{ width: `${p.frequency * 100}%` }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Widget 2: Pattern Distribution */}
                                    <div className="col-span-12 lg:col-span-6">
                                        <div className="widget-tile">
                                            <div className="widget-header">
                                                <div className="flex items-center gap-2">
                                                    <BarChart3 className="icon-xs text-emerald-500" />
                                                    <span className="kpi-label !text-white">Prevalence Matrix</span>
                                                </div>
                                            </div>
                                            <div className="widget-body">
                                                <div className="space-y-5">
                                                    {analysisResult.synthesis.dominant_patterns.map((p: any, i: number) => (
                                                        <div key={i} className="space-y-2">
                                                            <div className="flex justify-between text-[10px] font-black tracking-tight">
                                                                <span className="text-neutral-500 uppercase">{p.pattern_name}</span>
                                                                <span className="text-blue-500">{Math.round(p.frequency * 100)}%</span>
                                                            </div>
                                                            <div className="progress-bar-pro w-full !h-1.5">
                                                                <div className="progress-fill-pro transition-all duration-1000" style={{ width: `${p.frequency * 100}%` }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Widget 3: Media Buying Lever - Span 4 */}
                                    <div className="col-span-12 lg:col-span-3">
                                        <div className="widget-tile">
                                            <div className="widget-header">
                                                <div className="flex items-center gap-2">
                                                    <Target className="icon-xs text-amber-500" />
                                                    <span className="kpi-label !text-white !text-[9px]">Media Directives</span>
                                                </div>
                                            </div>
                                            <div className="widget-body space-y-3">
                                                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                                                    <p className="text-[9px] font-black text-amber-500 uppercase mb-0.5">Test Strategy</p>
                                                    <p className="text-[11px] font-bold text-neutral-300 leading-snug">30% Spend / Primary Angles.</p>
                                                </div>
                                                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                                    <p className="text-[9px] font-black text-neutral-600 uppercase mb-0.5">Scale Logic</p>
                                                    <p className="text-[11px] font-bold text-neutral-300 leading-snug">Broad Targeting / Algorithmic Resonance.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Widget 4: Variant Breakdown (Bento Matrix) - Span 9 */}
                                    <div className="col-span-12 lg:col-span-9">
                                        <div className="widget-tile">
                                            <div className="widget-header">
                                                <div className="flex items-center gap-2">
                                                    <LayoutGrid className="icon-xs text-white/40" />
                                                    <span className="kpi-label !text-white !text-[9px]">Variant Matrix</span>
                                                </div>
                                                <span className="text-[8px] font-bold text-neutral-700 uppercase tracking-widest">{analysisResult.analyses.length} Signals Captured</span>
                                            </div>
                                            <div className="widget-body !p-0 overflow-x-auto">
                                                <table className="w-full text-left border-collapse min-w-[800px]">
                                                    <thead>
                                                        <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                                                            <th className="p-4 text-[9px] font-black text-neutral-600 uppercase">Reference</th>
                                                            <th className="p-4 text-[9px] font-black text-neutral-600 uppercase">Growth Hypothesis</th>
                                                            <th className="p-4 text-[9px] font-black text-neutral-600 uppercase">Trigger Hook</th>
                                                            <th className="p-4 text-[9px] font-black text-neutral-600 uppercase">Lever</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {analysisResult.analyses.map((teardown: any, i: number) => (
                                                            <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                                                                <td className="p-3 text-[9px] font-black text-neutral-700">V-{i + 1}</td>
                                                                <td className="p-3">
                                                                    <p className="text-[11px] font-bold text-neutral-300 leading-snug">{teardown.offer_structure}</p>
                                                                </td>
                                                                <td className="p-3">
                                                                    <span className="bg-[#3b82f6]/10 text-[#3b82f6] text-[8px] font-black px-1.5 py-0.5 rounded uppercase">{teardown.hook_type.split(' ')[0]}</span>
                                                                </td>
                                                                <td className="p-3">
                                                                    <p className="text-[10px] text-neutral-600 italic opacity-70 group-hover:opacity-100 group-hover:text-neutral-400">"{teardown.creative_atoms[0]}"</p>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Widget 5: Creative concepts (Bento Concept Grid) - Span 12 */}
                                    <div className="col-span-12">
                                        <div className="widget-tile border-dashed !border-white/10 !bg-transparent">
                                            <div className="widget-header !bg-transparent">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="icon-xs text-[#3b82f6]" />
                                                    <span className="kpi-label !text-white !text-[9px]">Creative Sandbox</span>
                                                </div>
                                            </div>
                                            <div className="widget-body grid md:grid-cols-3 gap-3">
                                                {analysisResult.creatives.concepts.map((concept: any, i: number) => (
                                                    <div key={i} className="data-card !p-3 group hover:!bg-white/5 transition-all">
                                                        <div className="flex justify-between items-start mb-1.5">
                                                            <p className="text-[8px] font-black text-[#3b82f6]/60 uppercase tracking-widest">D-0{i + 1}</p>
                                                            <ChevronRight className="icon-xs text-neutral-900" />
                                                        </div>
                                                        <h4 className="text-[11px] font-bold mb-1.5 text-neutral-200">{concept.concept_name}</h4>
                                                        <div className="p-2 bg-black/60 rounded border border-white/5 mb-2">
                                                            <p className="text-[10px] font-medium leading-[1.4] italic text-neutral-400 group-hover:text-neutral-200 transition-colors">
                                                                "{concept.hook_script}"
                                                            </p>
                                                        </div>
                                                        <p className="text-[9px] text-neutral-700 font-medium leading-relaxed line-clamp-2">{concept.visual_description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Widget 6: The Hook Sandbox (Integrated Bento Playground) */}
                                            <div className="col-span-12 pt-8 border-t border-white/[0.04]">
                                                <div className="flex flex-col items-center text-center gap-2 mb-6">
                                                    <div className="bg-[#3b82f6]/10 border border-[#3b82f6]/20 px-2 py-0.5 rounded">
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-[#3b82f6]">Beta Playground</span>
                                                    </div>
                                                    <h2 className="text-[16px] font-black text-white/90">The Hook Sandbox</h2>
                                                    <p className="text-neutral-600 max-w-sm text-[11px] leading-snug">Rapidly prototype ad hooks based on psychological triggers.</p>
                                                </div>

                                                <div className="bezel-card !p-6 space-y-6 bg-white/[0.01]">
                                                    <div className="space-y-4">
                                                        <p className="text-[9px] font-black text-neutral-700 uppercase tracking-widest">Select Emotional Levers</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {['Fear', 'Greed', 'Curiosity', 'Social Proof', 'Urgency', 'Altruism', 'Benefit-Led'].map(trigger => (
                                                                <button
                                                                    key={trigger}
                                                                    onClick={() => {
                                                                        if (selectedTriggers.includes(trigger)) {
                                                                            setSelectedTriggers(selectedTriggers.filter(t => t !== trigger));
                                                                        } else {
                                                                            setSelectedTriggers([...selectedTriggers, trigger]);
                                                                        }
                                                                    }}
                                                                    className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all border ${selectedTriggers.includes(trigger)
                                                                        ? 'bg-[#3b82f6] border-[#3b82f6] text-white'
                                                                        : 'bg-black/40 border-white/5 text-neutral-600 hover:border-white/20'
                                                                        }`}
                                                                >
                                                                    {trigger}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={generateHooks}
                                                        disabled={generatingHooks || selectedTriggers.length === 0}
                                                        className="btn-tactical btn-primary w-full h-10 rounded-[6px] text-[11px] uppercase tracking-widest font-black"
                                                    >
                                                        {generatingHooks ? (
                                                            <div className="flex items-center gap-3">
                                                                <Loader2 className="animate-spin icon-sm" />
                                                                <span>Simulating Market Response...</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-3">
                                                                <Sparkles className="icon-md" />
                                                                <span>Generate 20+ Hooks</span>
                                                            </div>
                                                        )}
                                                    </button>

                                                    {generatedHooks.length > 0 && (
                                                        <div className="space-y-6">
                                                            <div className="flex items-center justify-between pt-6 border-t border-white/[0.04]">
                                                                <div className="space-y-0.5">
                                                                    <p className="text-[9px] font-black text-neutral-700 uppercase tracking-widest">Market Concepts</p>
                                                                    <p className="text-[9px] text-neutral-600">{generatedHooks.length} iterations generated.</p>
                                                                </div>
                                                                <button
                                                                    onClick={copyAllHooks}
                                                                    className="btn-tactical bg-[#3b82f6]/10 border-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/20 px-4 h-8 text-[9px] uppercase font-black"
                                                                >
                                                                    <span>Export All</span>
                                                                </button>
                                                            </div>
                                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-slide-up">
                                                                {generatedHooks.map((hook, idx) => (
                                                                    <div key={idx} className="bezel-card !p-3.5 flex flex-col justify-between group h-full !bg-black/40">
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-[8px] font-black text-[#3b82f6] bg-[#3b82f6]/5 px-1.5 py-0.5 rounded border border-[#3b82f6]/10 uppercase tracking-tighter">{hook.trigger}</span>
                                                                            </div>
                                                                            <p className="text-[11px] font-bold text-neutral-300 leading-snug italic">
                                                                                "{hook.text}"
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
