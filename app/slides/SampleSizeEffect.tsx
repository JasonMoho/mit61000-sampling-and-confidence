"use client";

import React, { useState } from "react";
import { InlineMath } from "react-katex";
import SlideContainer from "../components/SlideContainer";
import { motion, AnimatePresence } from "framer-motion";
import "katex/dist/katex.min.css";

// Clinical trial parameters
const TRUE_EFFECT = 5; // Drug reduces BP by 5 mmHg
const PATIENT_STD = 15; // Patient-to-patient variation
const COST_PER_PATIENT = 50000; // $50k per patient

export default function SampleSizeEffect() {
  const [n, setN] = useState(9); // Start inconclusive!
  const [showCI, setShowCI] = useState(false);

  // Calculate CI
  const se = PATIENT_STD / Math.sqrt(n);
  const ciLow = TRUE_EFFECT - 1.96 * se;
  const ciHigh = TRUE_EFFECT + 1.96 * se;
  const budget = n * COST_PER_PATIENT;
  const isSignificant = ciLow > 0;

  // Format budget
  const formatBudget = (b: number) => {
    if (b >= 1000000) return `$${(b / 1000000).toFixed(1)}M`;
    return `$${(b / 1000).toFixed(0)}k`;
  };

  // Scale for visualization (-15 to 25)
  const xMin = -15, xMax = 25;
  const scaleX = (val: number) => ((val - xMin) / (xMax - xMin)) * 100;

  return (
    <SlideContainer title="How Many Patients Do We Need?">
      <div className="flex flex-col h-full w-full px-12 py-4">

        {/* Scenario - one line */}
        <div className="text-center text-xl text-gray-600 mb-6">
          💊 A drug claims to lower blood pressure by <strong className="text-blue-700">5 mmHg</strong>. 
          Each patient costs <strong className="text-green-700">$50k</strong>. 
          How many to prove it works?
        </div>

        {/* Main visualization area */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full">

          {/* The CI visualization */}
          <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-lg p-8 mb-6">
            
            {/* Title with result */}
            <div className="text-center mb-6">
              <span className="text-lg text-gray-600">95% Confidence Interval: </span>
              {!showCI ? (
                <span className="text-xl font-bold text-gray-400">—</span>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isSignificant ? 'sig' : 'insig'}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`text-xl font-bold ${isSignificant ? 'text-green-600' : 'text-amber-600'}`}
                  >
                    {isSignificant ? '✓ Drug Works!' : '? Inconclusive'}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>

            {/* CI bar area */}
            <div className="relative h-32 mx-8">
              
              {/* Danger zone - left of zero (drug might not work) */}
              <div 
                className="absolute top-0 bottom-0 bg-red-50 border-r-4 border-red-400"
                style={{ left: 0, width: `${scaleX(0)}%` }}
              />
              
              {/* Safe zone - right of zero */}
              <div 
                className="absolute top-0 bottom-0 bg-green-50"
                style={{ left: `${scaleX(0)}%`, right: 0 }}
              />

              {/* Zero line label */}
              <div 
                className="absolute top-2 text-sm font-bold text-red-600 bg-white px-2 rounded"
                style={{ left: `${scaleX(0)}%`, transform: 'translateX(-50%)' }}
              >
                No Effect (0)
              </div>

              {/* CI bar with whiskers - only show when showCI is true */}
              {showCI && (
                <motion.div
                  className="absolute top-1/2 flex items-center"
                  style={{ left: `${scaleX(Math.max(ciLow, xMin))}%` }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                >
                  {/* Left whisker */}
                  <div className={`w-1 h-20 rounded-l ${isSignificant ? 'bg-green-500' : 'bg-amber-500'}`} 
                       style={{ marginTop: '-40px' }} />
                  
                  {/* Bar body */}
                  <motion.div
                    className={`h-14 flex items-center justify-center rounded-lg border-4 ${
                      isSignificant 
                        ? 'bg-green-100 border-green-500' 
                        : 'bg-amber-100 border-amber-500'
                    }`}
                    style={{ 
                      width: `${(scaleX(ciHigh) - scaleX(Math.max(ciLow, xMin))) / 100 * (document?.querySelector?.('.relative.h-32')?.clientWidth || 800)}px`,
                      minWidth: '120px',
                      marginTop: '-28px'
                    }}
                    layout
                  >
                    <span className={`font-bold text-lg ${isSignificant ? 'text-green-700' : 'text-amber-700'}`}>
                      [{ciLow.toFixed(1)}, {ciHigh.toFixed(1)}]
                    </span>
                  </motion.div>
                  
                  {/* Right whisker */}
                  <div className={`w-1 h-20 rounded-r ${isSignificant ? 'bg-green-500' : 'bg-amber-500'}`}
                       style={{ marginTop: '-40px' }} />
                </motion.div>
              )}

              {/* Effect estimate marker */}
              <div 
                className="absolute top-1/2 flex flex-col items-center"
                style={{ left: `${scaleX(TRUE_EFFECT)}%`, transform: 'translateX(-50%)', marginTop: '24px' }}
              >
                <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-blue-600" />
                <div className="text-xs font-bold text-blue-600 mt-1">x̄ = 5</div>
              </div>
            </div>

            {/* X-axis */}
            <div className="relative h-10 mx-8 border-t-2 border-gray-400">
              {[-10, -5, 0, 5, 10, 15, 20].map(val => (
                <div 
                  key={val} 
                  className="absolute flex flex-col items-center"
                  style={{ left: `${scaleX(val)}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="w-0.5 h-2 bg-gray-400" />
                  <span className={`text-sm mt-1 ${val === 0 ? 'font-bold text-red-600' : 'text-gray-500'}`}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-400 mt-1">
              Blood Pressure Reduction (mmHg)
            </div>
          </div>

          {/* Slider with labels */}
          <div className="w-full max-w-2xl mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Fewer patients</span>
              <span className="font-bold text-gray-700">Drag or type number of patients</span>
              <span>More patients</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="4"
                max="150"
                value={n}
                onChange={(e) => { setN(Number(e.target.value)); setShowCI(false); }}
                className="flex-1 h-4 bg-gradient-to-r from-amber-200 via-yellow-200 to-green-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #fde68a 0%, #fde68a ${(n-4)/(150-4)*100}%, #e5e7eb ${(n-4)/(150-4)*100}%, #e5e7eb 100%)`
                }}
              />
              <input
                type="number"
                min="4"
                max="500"
                value={n}
                onChange={(e) => { setN(Math.max(4, Math.min(500, Number(e.target.value) || 4))); setShowCI(false); }}
                className="w-20 h-10 text-center text-lg font-mono font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={() => setShowCI(true)}
                className={`px-4 h-10 rounded-lg font-bold text-sm transition-all ${
                  showCI 
                    ? "bg-green-100 text-green-700 border-2 border-green-300"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {showCI ? "✓ CI Shown" : "Calculate CI"}
              </button>
            </div>
          </div>

          {/* Key numbers - larger and clearer */}
          <div className="flex items-center justify-center gap-16 text-center">
            <div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Patients</div>
              <div className="text-4xl font-bold text-blue-700 font-mono">{n}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Budget</div>
              <div className="text-4xl font-bold text-green-700 font-mono">{formatBudget(budget)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">CI Width</div>
              <div className="text-4xl font-bold text-purple-700 font-mono">±{(1.96 * se).toFixed(1)}</div>
            </div>
          </div>

          {/* The insight */}
          <div className="mt-6 text-center text-gray-600 text-lg">
            <InlineMath math="SE = \sigma / \sqrt{n}" /> — to halve the CI width, you need 4× the patients
          </div>
        </div>
      </div>
    </SlideContainer>
  );
}