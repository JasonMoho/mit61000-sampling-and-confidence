"use client";

import React, { useState } from "react";
import SlideContainer from "../components/SlideContainer";
import { motion, AnimatePresence } from "framer-motion";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

export default function RandomVariable() {
    const [arrivalTime, setArrivalTime] = useState<string | null>(null);
    const [isWaiting, setIsWaiting] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    const simulateBus = () => {
        if (isWaiting) return;
        setIsWaiting(true);
        setArrivalTime(null);

        setTimeout(() => {
            // Generate arrival time: normal distribution, μ=8:50, σ=10 min
            // Box-Muller transform for normal distribution
            const u1 = Math.random();
            const u2 = Math.random();
            const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            const minutesPast8 = Math.round(50 + z * 10); // mean 50, std 10
            
            // Convert to time string
            let time: string;
            if (minutesPast8 < 60) {
                time = `8:${minutesPast8.toString().padStart(2, '0')}`;
            } else {
                const mins = minutesPast8 - 60;
                time = `9:${mins.toString().padStart(2, '0')}`;
            }
            
            setArrivalTime(time);
            setHistory(prev => [time, ...prev].slice(0, 8));
            setIsWaiting(false);
        }, 1000);
    };

    return (
        <SlideContainer title="Random Variables">
            <div className="flex items-center justify-center h-full gap-16 w-full max-w-6xl mx-auto">

                {/* Left: Definitions */}
                <div className="flex-1 space-y-8">
                    
                    {/* Random Variable X */}
                    <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
                        <h3 className="text-2xl font-bold text-purple-700 mb-2">
                            Random Variable <InlineMath math="X" />
                        </h3>
                        <p className="text-gray-700 text-lg mb-4">
                            A quantity whose value is <strong>uncertain</strong> until we observe it.
                        </p>
                        <div className="bg-white p-4 rounded-lg border border-purple-100 text-center">
                            <span className="text-indigo-700 font-mono text-xl">
                                <InlineMath math="X" /> = "What time will the bus arrive?"
                            </span>
                        </div>
                    </div>

                    {/* Realization x */}
                    <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                        <h3 className="text-2xl font-bold text-green-700 mb-2">
                            Realization <InlineMath math="x" />
                        </h3>
                        <p className="text-gray-700 text-lg mb-4">
                            The <strong>actual value</strong> we observe.
                        </p>
                        <div className="bg-white p-4 rounded-lg border border-green-100 text-center">
                            <span className="text-teal-700 font-mono text-xl">
                                <InlineMath math="x" /> = 8:47 AM
                            </span>
                        </div>
                    </div>

                    {/* Key insight */}
                    <div className="text-center text-gray-600 text-lg italic">
                        Before: <InlineMath math="X" /> is uncertain. After: <InlineMath math="x" /> is known.
                    </div>
                </div>

                {/* Right: Interactive Demo */}
                <div className="flex-1 flex flex-col items-center">
                    
                    {/* The "uncertain" box */}
                    <div className="w-80 h-64 bg-white rounded-2xl border-2 border-gray-200 shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
                        
                        <div className="absolute top-3 text-sm font-bold text-gray-400 uppercase tracking-wider">
                            Bus Arrival Time
                        </div>

                        <AnimatePresence mode="wait">
                            {isWaiting ? (
                                <motion.div
                                    key="waiting"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-6xl"
                                >
                                    🚌
                                </motion.div>
                            ) : arrivalTime ? (
                                <motion.div
                                    key="result"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center"
                                >
                                    <div className="text-5xl font-bold text-teal-700 font-mono">
                                        {arrivalTime}
                                    </div>
                                    <div className="text-teal-700 mt-2 font-mono">
                                        <InlineMath math={`x = \\text{${arrivalTime}}`} />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="uncertain"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="text-center"
                                >
                                    <div className="text-6xl font-bold text-purple-300 font-mono mb-2">
                                        ?:??
                                    </div>
                                    <div className="text-purple-400 font-mono">
                                        <InlineMath math="X" /> = uncertain
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Button */}
                    <button
                        onClick={simulateBus}
                        disabled={isWaiting}
                        className={`mt-6 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all ${isWaiting ? 'opacity-50' : ''}`}
                    >
                        {isWaiting ? "Bus arriving..." : "Simulate Bus Arrival"}
                    </button>

                    {/* History */}
                    {history.length > 0 && (
                        <div className="mt-6 text-center">
                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                                Previous arrivals (<InlineMath math="x_1, x_2, \ldots" />)
                            </div>
                            <div className="flex gap-2 justify-center flex-wrap">
                                {history.map((time, i) => (
                                    <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-600">
                                        {time}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </SlideContainer>
    );
}
