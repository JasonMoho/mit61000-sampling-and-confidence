"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import SlideContainer from "../components/SlideContainer";
import { motion, AnimatePresence } from "framer-motion";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

interface Star {
    x: number;
    y: number;
    mag: number;
}

interface StarData {
    stars: Star[];
    population: {
        n: number;
        mean: number;
        std: number;
    };
}

// Convert magnitude to luminosity (matching notebook: higher = brighter)
// Formula: luminosity = 100 - mag * 10
function magToLuminosity(mag: number): number {
    return 100 - mag * 10;
}

// Histogram component
function Histogram({ 
    data, 
    bins, 
    color, 
    label,
    mean,
    showMean = true 
}: { 
    data: number[]; 
    bins: { min: number; max: number; count: number }[];
    color: string;
    label: string;
    mean?: number;
    showMean?: boolean;
}) {
    const maxCount = Math.max(...bins.map(b => b.count), 1);
    const minVal = bins[0]?.min ?? 0;
    const maxVal = bins[bins.length - 1]?.max ?? 100;
    
    return (
        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">{label}</div>
            <div className="h-20 flex items-end gap-px relative">
                {bins.map((bin, i) => {
                    const height = (bin.count / maxCount) * 100;
                    return (
                        <div 
                            key={i} 
                            className="flex-1 rounded-t transition-all"
                            style={{ 
                                height: `${height}%`, 
                                backgroundColor: color,
                                minHeight: bin.count > 0 ? 2 : 0,
                                opacity: bin.count > 0 ? 0.7 : 0.2
                            }}
                        />
                    );
                })}
                {/* Mean line */}
                {showMean && mean !== undefined && (
                    <div 
                        className="absolute bottom-0 top-0 w-0.5 bg-red-500"
                        style={{ left: `${((mean - minVal) / (maxVal - minVal)) * 100}%` }}
                    />
                )}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>{minVal.toFixed(0)}</span>
                <span className="text-gray-600">Luminosity (higher = brighter)</span>
                <span>{maxVal.toFixed(0)}</span>
            </div>
            {showMean && mean !== undefined && (
                <div className="text-center text-xs mt-1">
                    <span className="text-red-600 font-mono font-bold">{mean.toFixed(2)}</span>
                </div>
            )}
        </div>
    );
}

export default function PopulationSample() {
    const SAMPLE_SIZE = 30;
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [starData, setStarData] = useState<StarData | null>(null);
    const [highlightedStars, setHighlightedStars] = useState<number[]>([]);
    const [sampleLuminosities, setSampleLuminosities] = useState<number[]>([]);
    const [allMeans, setAllMeans] = useState<number[]>([]); // All sample means for accurate average
    const [history, setHistory] = useState<{ id: number; mean: number }[]>([]); // Last 8 for display

    // Bin configuration for histograms (luminosity: 0-80 range like notebook)
    const BIN_MIN = 0;
    const BIN_MAX = 80;
    const NUM_BINS = 20;

    // Population stats in luminosity units
    const populationLuminosityStats = React.useMemo(() => {
        if (!starData) return null;
        const lums = starData.stars.map(s => magToLuminosity(s.mag));
        const mean = lums.reduce((a, b) => a + b, 0) / lums.length;
        const std = Math.sqrt(lums.reduce((a, l) => a + (l - mean) ** 2, 0) / lums.length);
        return { mean, std };
    }, [starData]);

    // Load real star data
    useEffect(() => {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
        fetch(`${basePath}/stars.json`)
            .then(res => res.json())
            .then(data => setStarData(data))
            .catch(err => console.error('Failed to load star data:', err));
    }, []);

    // Compute population histogram bins (in luminosity)
    const populationBins = React.useMemo(() => {
        if (!starData) return [];
        const binWidth = (BIN_MAX - BIN_MIN) / NUM_BINS;
        const bins = Array.from({ length: NUM_BINS }, (_, i) => ({
            min: BIN_MIN + i * binWidth,
            max: BIN_MIN + (i + 1) * binWidth,
            count: 0
        }));
        for (const star of starData.stars) {
            const lum = magToLuminosity(star.mag);
            const binIndex = Math.floor((lum - BIN_MIN) / binWidth);
            if (binIndex >= 0 && binIndex < NUM_BINS) {
                bins[binIndex].count++;
            }
        }
        return bins;
    }, [starData]);

    // Compute sample histogram bins (in luminosity)
    const sampleBins = React.useMemo(() => {
        const binWidth = (BIN_MAX - BIN_MIN) / NUM_BINS;
        const bins = Array.from({ length: NUM_BINS }, (_, i) => ({
            min: BIN_MIN + i * binWidth,
            max: BIN_MIN + (i + 1) * binWidth,
            count: 0
        }));
        for (const lum of sampleLuminosities) {
            const binIndex = Math.floor((lum - BIN_MIN) / binWidth);
            if (binIndex >= 0 && binIndex < NUM_BINS) {
                bins[binIndex].count++;
            }
        }
        return bins;
    }, [sampleLuminosities]);

    // Draw stars on canvas
    const drawStars = useCallback(() => {
        if (!starData || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        // Dark sky background
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, rect.width, rect.height);

        const { stars } = starData;
        const highlightSet = new Set(highlightedStars);

        // Draw stars - mimic real night sky photography
        // Key insight: stars are point sources, brightness = how much light spreads
        for (let i = 0; i < stars.length; i++) {
            const star = stars[i];
            const x = (star.x / 100) * rect.width;
            const y = ((100 - star.y) / 100) * rect.height;
            
            const mag = star.mag;
            if (mag > 10) continue;

            if (highlightSet.has(i)) {
                // Sampled star - yellow circle marker
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = '#fbbf24';
                ctx.fill();
            } else {
                // Real stars: single white pixel, alpha = brightness
                // Magnitude scale: mag 0 = brightest, mag 10 = faintest visible
                // Each magnitude step = 2.512x dimmer
                const alpha = Math.pow(10, (4 - mag) / 2.5);  // mag 4 = alpha 1
                const clampedAlpha = Math.max(0.03, Math.min(1, alpha));
                
                // All stars are 1px points - just vary brightness
                ctx.fillStyle = `rgba(255, 255, 255, ${clampedAlpha})`;
                ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
                
                // Only the very brightest stars (mag < 2) get a tiny bloom
                if (mag < 2) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${clampedAlpha * 0.3})`;
                    ctx.fillRect(Math.round(x) - 1, Math.round(y), 1, 1);
                    ctx.fillRect(Math.round(x) + 1, Math.round(y), 1, 1);
                    ctx.fillRect(Math.round(x), Math.round(y) - 1, 1, 1);
                    ctx.fillRect(Math.round(x), Math.round(y) + 1, 1, 1);
                }
            }
        }
    }, [starData, highlightedStars]);

    useEffect(() => {
        drawStars();
    }, [drawStars]);

    useEffect(() => {
        const handleResize = () => drawStars();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [drawStars]);

    const takeSample = () => {
        if (!starData) return;

        const indices: number[] = [];
        while (indices.length < SAMPLE_SIZE) {
            const idx = Math.floor(Math.random() * starData.stars.length);
            if (!indices.includes(idx)) indices.push(idx);
        }
        setHighlightedStars(indices);

        const lums = indices.map(i => magToLuminosity(starData.stars[i].mag));
        setSampleLuminosities(lums);

        const mean = lums.reduce((a, b) => a + b, 0) / lums.length;
        setAllMeans(prev => [...prev, mean]); // Track all means for accurate average
        setHistory(prev => [{ id: Date.now(), mean }, ...prev].slice(0, 8)); // Display last 8
    };

    if (!starData || !populationLuminosityStats) {
        return (
            <SlideContainer title="Population vs. Sample">
                <div className="flex items-center justify-center h-full">
                    <div className="text-gray-400">Loading stars...</div>
                </div>
            </SlideContainer>
        );
    }

    const { population } = starData;
    const sampleMean = sampleLuminosities.length > 0 
        ? sampleLuminosities.reduce((a, b) => a + b, 0) / sampleLuminosities.length 
        : null;
    const error = sampleMean !== null ? sampleMean - populationLuminosityStats.mean : null;

    return (
        <SlideContainer title="Population vs. Sample">
            <div className="flex h-full gap-6 w-full max-w-7xl mx-auto px-6 pt-2">

                {/* Left: Star field + distributions */}
                <div className="flex-1 flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex justify-between items-end">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">The Population</h3>
                            <p className="text-xs text-gray-500">
                                <InlineMath math={`N = ${population.n.toLocaleString()}`} /> stars in HYG catalog
                            </p>
                        </div>
                        <div className="text-right text-xs text-gray-400">
                            True mean: <span className="font-mono font-bold text-gray-600"><InlineMath math={`\\mu = ${populationLuminosityStats.mean.toFixed(1)}`} /></span>
                        </div>
                    </div>

                    {/* Rectangular star field */}
                    <div className="h-64 rounded-xl overflow-hidden shadow-xl border border-gray-800 relative">
                        <canvas
                            ref={canvasRef}
                            className="w-full h-full"
                            style={{ display: 'block' }}
                        />
                        {highlightedStars.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-black/70 px-4 py-2 rounded-full text-gray-300 text-xs font-medium">
                                    We cannot measure all {population.n.toLocaleString()} stars
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Distribution charts */}
                    <div className="flex gap-4">
                        <Histogram
                            data={starData.stars.map(s => magToLuminosity(s.mag))}
                            bins={populationBins}
                            color="#0d9488"
                            label="Population Distribution"
                            mean={populationLuminosityStats.mean}
                        />
                        <Histogram
                            data={sampleLuminosities}
                            bins={sampleBins}
                            color="#d97706"
                            label={`Sample Distribution (n=${SAMPLE_SIZE})`}
                            mean={sampleMean ?? undefined}
                            showMean={sampleLuminosities.length > 0}
                        />
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="w-80 flex flex-col gap-3">

                    {/* Sample Card */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-lg">
                        <div className="text-center mb-3">
                            <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">
                                Sample Mean (<InlineMath math={`n = ${SAMPLE_SIZE}`} />)
                            </div>
                            <div className="text-3xl font-bold font-mono text-amber-600">
                                {sampleMean !== null ? sampleMean.toFixed(1) : "—"}
                            </div>
                        </div>

                        <button
                            onClick={takeSample}
                            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-base shadow-md transition-all"
                        >
                            Measure 30 Stars
                        </button>
                    </div>

                    {/* Sampling Error */}
                    <div className={`p-4 rounded-xl border-2 transition-all ${
                        error === null 
                            ? 'bg-gray-50 border-gray-200' 
                            : Math.abs(error) < 2 
                                ? 'bg-green-50 border-green-300' 
                                : Math.abs(error) < 5 
                                    ? 'bg-yellow-50 border-yellow-300' 
                                    : 'bg-red-50 border-red-300'
                    }`}>
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wide">Sampling Error</h4>
                            {error !== null && (
                                <span className={`font-mono font-bold text-lg ${
                                    error >= 0 ? 'text-red-600' : 'text-blue-600'
                                }`}>
                                    {error >= 0 ? '+' : ''}{error.toFixed(1)}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-600">
                            {error === null 
                                ? "Take a sample to see the error."
                                : `Your estimate is ${Math.abs(error).toFixed(1)} ${error >= 0 ? 'above' : 'below'} the true mean.`
                            }
                        </p>
                    </div>

                    {/* History */}
                    <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-3 py-2 border-b border-gray-100 flex justify-between items-center">
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">History</span>
                            {allMeans.length > 0 && (
                                <span className="text-xs text-gray-400">
                                    Avg ({allMeans.length}): <span className="font-mono font-bold text-gray-600">
                                        {(allMeans.reduce((a, m) => a + m, 0) / allMeans.length).toFixed(2)}
                                    </span>
                                </span>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            <AnimatePresence initial={false}>
                                {history.map((h, idx) => {
                                    const err = h.mean - populationLuminosityStats.mean;
                                    const sampleNumber = allMeans.length - idx; // Correct numbering based on total
                                    return (
                                        <motion.div
                                            key={h.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs"
                                        >
                                            <span className="text-gray-400 font-mono">#{sampleNumber}</span>
                                            <span className="font-mono font-bold">{h.mean.toFixed(1)}</span>
                                            <span className={`font-mono ${err >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                                {err >= 0 ? '+' : ''}{err.toFixed(1)}
                                            </span>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            {history.length === 0 && (
                                <div className="text-center text-gray-300 text-xs italic py-4">
                                    No samples yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Key Insight */}
                    {history.length >= 3 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-center"
                        >
                            <p className="text-purple-800 text-xs font-medium">
                                Each sample gives a <strong>different</strong> answer.
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </SlideContainer>
    );
}
