"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SlideContainer from "../components/SlideContainer";

export default function HookSlide() {
  const [step, setStep] = useState(0);
  // Step 0: Just the means
  // Step 1: Reveal standard deviations
  // Step 2: Show the distribution curves
  // Step 3: Show late probabilities

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  // Helper to generate Gaussian path
  const generateGaussianPath = (mean: number, std: number, peakHeight: number) => {
    let path = `M 0 100`;
    for (let x = 0; x <= 100; x += 1) {
      const y = peakHeight * Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
      path += ` L ${x} ${100 - y}`;
    }
    path += ` L 100 100 Z`;
    return path;
  };

  return (
    <SlideContainer title="The Final Exam">
      <div className="flex flex-col items-center justify-start h-full w-full max-w-5xl mx-auto pt-4 gap-6">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-black">
            It is <span className="text-teal-700">8:30 AM</span>. The Exam starts at <span className="text-amber-700">9:00 AM</span>.
          </h2>
        </div>

        {/* The Two Options */}
        <div className="flex gap-8 w-full justify-center">
          
          {/* Bus */}
          <div className="flex-1 max-w-sm p-6 rounded-xl border-2 border-blue-200 bg-blue-50">
            <div className="text-center">
              <div className="text-5xl mb-3">🚌</div>
              <div className="text-xl font-bold text-black">The Bus</div>
              <div className="mt-3 text-lg">
                Average arrival: <span className="font-bold text-teal-700">8:50 AM</span>
              </div>
              <AnimatePresence>
                {step >= 1 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 text-lg"
                  >
                    Std dev: <span className="font-bold text-teal-700">σ = 10 min</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Train */}
          <div className="flex-1 max-w-sm p-6 rounded-xl border-2 border-purple-200 bg-purple-50">
            <div className="text-center">
              <div className="text-5xl mb-3">🚆</div>
              <div className="text-xl font-bold text-black">The Train</div>
              <div className="mt-3 text-lg">
                Average arrival: <span className="font-bold text-indigo-700">8:55 AM</span>
              </div>
              <AnimatePresence>
                {step >= 1 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 text-lg"
                  >
                    Std dev: <span className="font-bold text-indigo-700">σ = 3 min</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* Poll Prompts */}
        <div className="text-center text-xl text-gray-700 h-8">
          {step === 0 && "Which would you take? 🖐️ Bus? Train? Not enough info?"}
          {step === 1 && "Now who wants the bus? Who wants the train?"}
          {step >= 2 && "Let's see what the distributions look like..."}
        </div>

        {/* Distribution Visualization */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-white rounded-xl border border-gray-200 p-4 shadow-lg"
            >
              <div className="relative h-40 mx-8">
                
                {/* Deadline Line */}
                <div className="absolute top-0 bottom-6 left-[75%] w-0.5 bg-red-500 z-20">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-red-600 font-bold text-sm whitespace-nowrap">9:00</div>
                </div>

                {/* Late zone */}
                <div className="absolute top-0 bottom-6 left-[75%] right-0 bg-red-50 z-0"></div>

                {/* Curves */}
                <svg className="absolute inset-0 w-full h-[calc(100%-1.5rem)]" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Bus: mean at 50% (8:50), σ=10min → ~25% width */}
                  <path 
                    d={generateGaussianPath(50, 20, 50)} 
                    fill="rgba(37, 99, 235, 0.2)" 
                    stroke="#2563EB" 
                    strokeWidth="2" 
                  />
                  {/* Train: mean at 62.5% (8:55), σ=3min → ~7.5% width */}
                  <path 
                    d={generateGaussianPath(62.5, 6, 85)} 
                    fill="rgba(147, 51, 234, 0.3)" 
                    stroke="#9333EA" 
                    strokeWidth="2" 
                  />
                </svg>

                {/* Labels */}
                <div className="absolute bottom-12 left-[30%] text-teal-700 font-semibold text-xs bg-white px-2 py-0.5 rounded border border-teal-300 z-10">
                  Bus
                </div>
                <div className="absolute top-2 left-[62.5%] -translate-x-1/2 text-indigo-700 font-semibold text-xs bg-white px-2 py-0.5 rounded border border-indigo-300 z-10">
                  Train
                </div>

                {/* X-Axis */}
                <div className="absolute bottom-0 left-0 right-0 h-6 border-t border-gray-300">
                  <div className="flex justify-between text-xs text-gray-500 font-mono pt-1">
                    <span>8:30</span>
                    <span>8:40</span>
                    <span>8:50</span>
                    <span>9:00</span>
                    <span>9:10</span>
                  </div>
                </div>
              </div>

              {/* Late Probabilities */}
              <AnimatePresence>
                {step >= 3 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center gap-16 mt-4 pt-4 border-t border-gray-200"
                  >
                    <div className="text-center">
                      <div className="text-gray-500 text-sm">P(Bus arrives after 9:00)</div>
                      <div className="text-2xl font-bold text-red-600">≈ 16%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 text-sm">P(Train arrives after 9:00)</div>
                      <div className="text-2xl font-bold text-teal-700">&lt; 1%</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-4 mt-auto mb-4">
          {step > 0 && (
            <button 
              onClick={prevStep}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
            >
              Back
            </button>
          )}
          {step < 3 && (
            <button 
              onClick={nextStep}
              className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
            >
              {step === 0 ? "Reveal σ" : step === 1 ? "Show Distributions" : "Show Probabilities"}
            </button>
          )}
        </div>

      </div>
    </SlideContainer>
  );
}
