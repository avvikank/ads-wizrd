"use client";

import { useState, useEffect } from 'react';
import { Copy, Plus, Save } from 'lucide-react';

export default function AdCollector({ onAnalyze }: { onAnalyze: (ads: any[]) => void }) {
    const [ads, setAds] = useState<any[]>([]);
    const [currentAd, setCurrentAd] = useState({
        snapshot_url: '',
        primary_text: '',
        headline: '',
        cta: ''
    });

    const handleParseClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            // Simple heuristic: if it looks like a URL, put it in snapshot_url
            // If it looks like a block of text, maybe primary_text
            // This is where "Assisted Mode" shines - smart pasting
            if (text.startsWith('http')) {
                setCurrentAd(prev => ({ ...prev, snapshot_url: text }));
            } else {
                // Maybe parse lines?
                setCurrentAd(prev => ({ ...prev, primary_text: text }));
            }
        } catch (err) {
            console.error("Clipboard access failed", err);
        }
    };

    const handleAddAd = () => {
        if (!currentAd.snapshot_url) return;
        setAds([...ads, { ...currentAd, id: Date.now() }]);
        setCurrentAd({ snapshot_url: '', primary_text: '', headline: '', cta: '' });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Save className="w-5 h-5 text-purple-600" />
                Ad Collector
            </h2>

            <div className="flex-1 space-y-4 mb-6 overflow-y-auto max-h-[400px]">
                {ads.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-lg">
                        No ads collected yet. <br /> Open a search and paste details here.
                    </div>
                ) : (
                    ads.map((ad) => (
                        <div key={ad.id} className="p-3 bg-gray-50 rounded-lg border text-sm">
                            <div className="font-mono text-xs text-blue-600 truncate mb-1">{ad.snapshot_url}</div>
                            <div className="line-clamp-2 text-gray-600">{ad.primary_text}</div>
                        </div>
                    ))
                )}
            </div>

            <div className="space-y-3 pt-4 border-t">
                <div className="flex gap-2">
                    <input
                        value={currentAd.snapshot_url}
                        onChange={(e) => setCurrentAd(prev => ({ ...prev, snapshot_url: e.target.value }))}
                        placeholder="Paste Ad Snapshot URL..."
                        className="flex-1 p-2 border rounded text-sm"
                    />
                    <button
                        onClick={handleParseClipboard}
                        className="p-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-600"
                        title="Paste from Clipboard"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                </div>
                <textarea
                    value={currentAd.primary_text}
                    onChange={(e) => setCurrentAd(prev => ({ ...prev, primary_text: e.target.value }))}
                    placeholder="Paste Primary Text..."
                    className="w-full p-2 border rounded text-sm h-20 resize-none"
                />
                <button
                    onClick={handleAddAd}
                    className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add to Analysis Queue
                </button>

                {ads.length > 0 && (
                    <button
                        onClick={() => onAnalyze(ads)}
                        className="w-full py-2 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-2 font-semibold shadow-md"
                    >
                        Analyze {ads.length} Ads
                    </button>
                )}
            </div>
        </div>
    );
}
