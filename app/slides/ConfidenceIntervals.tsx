"use client";

import React, { useState, useEffect } from "react";
import { BlockMath, InlineMath } from "react-katex";
import SlideContainer from "../components/SlideContainer";
import { motion } from "framer-motion";
import "katex/dist/katex.min.css";

export default function ConfidenceIntervals() {
    const [intervals, setIntervals] = useState<{ mean: number; lower: number; upper: number; captured: boolean }[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [sampleSize, setSampleSize] = useState(30);

    // True population parameters (unknown in practice)
    const TRUE_MEAN = 100;
    const POP_STD = 20;

    // Calculate standard error and margin of error
    const SE = POP_STD / Math.sqrt(sampleSize);
    const marginOfError = 2 * SE; // 95% CI (using 2 instead of 1.96 for simplicity)

    // Take a sample and compute CI
    const takeSample = () => {
        const sample = Array.from({ length: sampleSize }, () => {
            const u = 1 - Math.random();
            const v = Math.random();
            const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            return TRUE_MEAN + z * POP_STD;
        });

        const sampleMean = sample.reduce((a, b) => a + b, 0) / sampleSize;
        const lower = sampleMean - marginOfError;
        const upper = sampleMean + marginOfError;
        const captured = lower <= TRUE_MEAN && upper >= TRUE_MEAN;

        setIntervals(prev => [...prev.slice(-50), { mean: sampleMean, lower, upper, captured }]);
    };

    // Animation loop
    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(takeSample, 300);
        return () => clearInterval(interval);
    }, [isRunning, sampleSize, marginOfError]);

    const capturedCount = intervals.filter(i => i.captured).length;
    const captureRate = intervals.length > 0 ? (capturedCount / intervals.length * 100).toFixed(1) : "0.0";

    return (
        <SlideContainer title="Confidence Intervals">
            <div className="flex flex-col items-center justify-start h-full gap-6 w-full pt-4 px-8">

                <div className="text-xl text-gray-600 max-w-4xl text-center font-light">
                    A <span className="text-teal-700 font-bold">95% Confidence Interval</span> means: if we repeated this study many times, <br />
                    <span className="text-indigo-700 font-bold">95% of the intervals</span> would contain the true population mean.
                </div>

                <div className="flex items-stretch gap-8 w-full max-w-7xl flex-1 min-h-0">

                    {/* Left: Controls & Formula */}
                    <div className="w-80 flex flex-col gap-5 flex-shrink-0">

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
                            <div className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-bold">Parameters</div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">True Mean <InlineMath math="\mu" /></span>
                                    <span className="font-mono font-bold text-gray-800">{TRUE_MEAN}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Population <InlineMath math="\sigma" /></span>
                                    <span className="font-mono font-bold text-gray-800">{POP_STD}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Sample Size <InlineMath math="n" /></span>
                                    <span className="font-mono font-bold text-gray-800">{sampleSize}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <input
                                    type="range"
                                    min="5"
                                    max="100"
                                    value={sampleSize}
                                    onChange={(e) => {
                                        setSampleSize(Number(e.target.value));
                                        setIntervals([]);
                                    }}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                                />
                                <div className="text-xs text-gray-400 mt-1 text-center">Adjust sample size</div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-5 rounded-lg border border-blue-200 space-y-3">
                            <div className="text-[10px] text-blue-800 uppercase tracking-widest font-bold">95% Confidence Interval Formula</div>
                            <div className="text-sm text-blue-900">
                                <BlockMath math="\bar{x} \pm 2 \times \frac{\sigma}{\sqrt{n}}" />
                            </div>
                            <div className="text-xs text-blue-700 space-y-1">
                                <div className="flex justify-between">
                                    <span>Standard Error (SE)</span>
                                    <span className="font-mono font-bold">{SE.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Margin of Error</span>
                                    <span className="font-mono font-bold">±{marginOfError.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsRunning(!isRunning)}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all shadow-lg ${
                                    isRunning ? "bg-red-500 text-white" : "bg-black text-white hover:bg-gray-800"
                                }`}
                            >
                                {isRunning ? "⏸ Pause" : "▶ Run Studies"}
                            </button>
                            <button
                                onClick={() => setIntervals([])}
                                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 transition-all"
                            >
                                Reset
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-widest">Studies Run</div>
                                    <div className="text-2xl font-mono font-bold text-black">{intervals.length}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 uppercase tracking-widest">Capture Rate</div>
                                    <div className={`text-2xl font-mono font-bold ${
                                        parseFloat(captureRate) >= 90 ? "text-green-600" : parseFloat(captureRate) >= 80 ? "text-yellow-600" : "text-red-600"
                                    }`}>
                                        {captureRate}%
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right: CI Visualization */}
                    <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-xl flex flex-col overflow-hidden relative">

                        {/* True Mean Line Indicator */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-100 px-3 py-1 rounded-full border border-red-200 text-xs text-red-700 font-bold z-10">
                            True μ = {TRUE_MEAN}
                        </div>

                        {/* Legend */}
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-2 rounded-lg border border-gray-200 text-xs z-10 space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-1.5 bg-green-400 rounded-full" />
                                <span className="text-gray-600">Captured μ</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-1.5 bg-red-400 rounded-full" />
                                <span className="text-gray-600">Missed μ</span>
                            </div>
                        </div>

                        {/* CI Plot Area */}
                        <div className="flex-1 relative p-4 pt-12">
                            {/* True mean vertical line */}
                            <div className="absolute left-1/2 top-12 bottom-12 w-0.5 bg-red-400 z-0" />

                            {/* Confidence Intervals */}
                            <div className="absolute inset-x-8 top-12 bottom-12 flex flex-col justify-end gap-1 overflow-hidden">
                                {intervals.slice(-40).map((ci, i) => {
                                    // Scale: center at TRUE_MEAN, show ±40 range
                                    const range = 40;
                                    const leftPercent = ((ci.lower - (TRUE_MEAN - range)) / (2 * range)) * 100;
                                    const widthPercent = ((ci.upper - ci.lower) / (2 * range)) * 100;

                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="relative h-2 flex-shrink-0"
                                        >
                                            {/* CI Bar */}
                                            <div
                                                className={`absolute h-full rounded-full ${
                                                    ci.captured ? "bg-green-400" : "bg-red-400"
                                                }`}
                                                style={{
                                                    left: `${Math.max(0, leftPercent)}%`,
                                                    width: `${Math.min(100 - leftPercent, widthPercent)}%`,
                                                }}
                                            />
                                            {/* Sample mean dot */}
                                            <div
                                                className={`absolute w-2 h-2 rounded-full ${
                                                    ci.captured ? "bg-green-700" : "bg-red-700"
                                                }`}
                                                style={{
                                                    left: `${((ci.mean - (TRUE_MEAN - range)) / (2 * range)) * 100}%`,
                                                    transform: "translateX(-50%)",
                                                }}
                                            />
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Empty state */}
                            {intervals.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm italic">
                                    Click "Run Studies" to simulate repeated sampling
                                </div>
                            )}
                        </div>

                        {/* Legend */}
                        <div className="h-16 border-t border-gray-200 bg-gray-50 flex items-center justify-center gap-8 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-2 bg-green-400 rounded-full" />
                                <span className="text-gray-600">Captured μ ({capturedCount})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-2 bg-red-400 rounded-full" />
                                <span className="text-gray-600">Missed μ ({intervals.length - capturedCount})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-0.5 h-4 bg-red-400" />
                                <span className="text-gray-600">True Population Mean</span>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </SlideContainer>
    );
}
