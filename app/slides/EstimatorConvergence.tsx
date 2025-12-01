"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { InlineMath } from "react-katex";
import SlideContainer from "../components/SlideContainer";
import "katex/dist/katex.min.css";

interface StarData {
  stars: { x: number; y: number; mag: number }[];
  population: { n: number; mean: number; std: number };
}

// Convert magnitude to luminosity
function magToLuminosity(mag: number): number {
  return 100 - mag * 10;
}

// Sample sizes to test
const SAMPLE_SIZES = [5, 10, 15, 20, 30, 50, 75, 100, 150, 200, 300, 500];
const TRIALS_PER_SIZE = 500;

export default function EstimatorConvergence() {
  const [starData, setStarData] = useState<StarData | null>(null);
  const [starLuminosities, setStarLuminosities] = useState<Float64Array | null>(null);
  const [popStats, setPopStats] = useState<{ mean: number; std: number } | null>(null);
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<{ meanErrors: number[]; stdErrors: number[] }>({ 
    meanErrors: [], 
    stdErrors: [] 
  });

  // Load star data
  useEffect(() => {
    const basePath = process.env.NODE_ENV === 'production' ? '/mit61000-sampling-and-confidence' : '';
    fetch(`${basePath}/stars.json`)
      .then(res => res.json())
      .then((data: StarData) => {
        setStarData(data);
        const lums = new Float64Array(data.stars.length);
        let sum = 0;
        for (let i = 0; i < data.stars.length; i++) {
          lums[i] = magToLuminosity(data.stars[i].mag);
          sum += lums[i];
        }
        const mean = sum / lums.length;
        let sumSq = 0;
        for (let i = 0; i < lums.length; i++) {
          sumSq += (lums[i] - mean) ** 2;
        }
        const std = Math.sqrt(sumSq / lums.length);
        setStarLuminosities(lums);
        setPopStats({ mean, std });
      });
  }, []);

  // Run simulation for one sample size
  const runForSampleSize = useCallback((n: number): { meanError: number; stdError: number } => {
    if (!starLuminosities || !popStats) return { meanError: 0, stdError: 0 };
    
    const numStars = starLuminosities.length;
    let totalMeanError = 0;
    let totalStdError = 0;
    
    for (let t = 0; t < TRIALS_PER_SIZE; t++) {
      // Sample with replacement
      let sum = 0;
      const samples = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        const idx = Math.floor(Math.random() * numStars);
        samples[i] = starLuminosities[idx];
        sum += samples[i];
      }
      const sampleMean = sum / n;
      
      // Compute sample std (with Bessel's correction)
      let sumSq = 0;
      for (let i = 0; i < n; i++) {
        sumSq += (samples[i] - sampleMean) ** 2;
      }
      const sampleStd = Math.sqrt(sumSq / (n - 1));
      
      totalMeanError += Math.abs(sampleMean - popStats.mean);
      totalStdError += Math.abs(sampleStd - popStats.std);
    }
    
    // Return average % error
    return {
      meanError: (totalMeanError / TRIALS_PER_SIZE) / popStats.mean * 100,
      stdError: (totalStdError / TRIALS_PER_SIZE) / popStats.std * 100,
    };
  }, [starLuminosities, popStats]);

  // Animation loop
  const runSimulation = useCallback(() => {
    if (!starLuminosities || !popStats) return;
    
    setIsRunning(true);
    setCurrentStep(0);
    setResults({ meanErrors: [], stdErrors: [] });
    
    let step = 0;
    const newMeanErrors: number[] = [];
    const newStdErrors: number[] = [];
    
    const runStep = () => {
      if (step >= SAMPLE_SIZES.length) {
        setIsRunning(false);
        return;
      }
      
      const n = SAMPLE_SIZES[step];
      const { meanError, stdError } = runForSampleSize(n);
      newMeanErrors.push(meanError);
      newStdErrors.push(stdError);
      
      setResults({ meanErrors: [...newMeanErrors], stdErrors: [...newStdErrors] });
      setCurrentStep(step + 1);
      step++;
      
      requestAnimationFrame(() => setTimeout(runStep, 50));
    };
    
    runStep();
  }, [runForSampleSize, starLuminosities, popStats]);

  // Chart dimensions - wider chart for better proportions
  const chartWidth = 650;
  const chartHeight = 380;
  const padding = { top: 25, right: 100, bottom: 55, left: 65 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const maxX = 500;
  const maxY = 25; // % error

  const scaleX = (n: number) => padding.left + (n / maxX) * plotWidth;
  const scaleY = (pct: number) => padding.top + plotHeight - (Math.min(pct, maxY) / maxY) * plotHeight;

  const getPath = (data: number[]) => {
    if (data.length === 0) return "";
    return data.map((pct, i) => {
      const x = scaleX(SAMPLE_SIZES[i]);
      const y = scaleY(pct);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(" ");
  };

  // Colors
  const meanColor = "#dc2626"; // red
  const stdColor = "#7c3aed";  // purple

  if (!starData || !popStats) {
    return (
      <SlideContainer title="Estimator Convergence">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400">Loading star data...</div>
        </div>
      </SlideContainer>
    );
  }

  return (
    <SlideContainer title="Estimators Converge to Truth">
      <div className="flex flex-col h-full w-full pt-4 px-8">

        {/* Header */}
        <div className="text-center text-xl text-gray-600 mb-6">
          As sample size <InlineMath math="n" /> increases, both{" "}
          <span className="text-red-600 font-bold">sample mean (x̄)</span> and{" "}
          <span className="text-purple-600 font-bold">sample std (s)</span> converge to the true population values
        </div>

        <div className="flex gap-8 flex-1 min-h-0 items-start">

          {/* Left: Chart - takes most of the space */}
          <div className="flex-1 flex flex-col">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4" style={{ height: '420px' }}>
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                
                {/* Grid lines */}
                {[0, 5, 10, 15, 20, 25].map(pct => (
                  <g key={pct}>
                    <line
                      x1={padding.left}
                      y1={scaleY(pct)}
                      x2={chartWidth - padding.right}
                      y2={scaleY(pct)}
                      stroke={pct === 0 ? "#10b981" : "#e5e7eb"}
                      strokeWidth={pct === 0 ? 2 : 1}
                      strokeDasharray={pct === 0 ? "6 3" : "0"}
                    />
                    <text
                      x={padding.left - 12}
                      y={scaleY(pct)}
                      textAnchor="end"
                      alignmentBaseline="middle"
                      fontSize="13"
                      fill={pct === 0 ? "#10b981" : "#6b7280"}
                      fontWeight={pct === 0 ? "bold" : "normal"}
                    >
                      {pct}%
                    </text>
                  </g>
                ))}

                {/* "Perfect" label at right */}
                <text
                  x={chartWidth - padding.right + 8}
                  y={scaleY(0)}
                  fontSize="12"
                  fill="#10b981"
                  fontWeight="bold"
                  alignmentBaseline="middle"
                >
                  Perfect
                </text>

                {/* X-axis ticks */}
                {[0, 100, 200, 300, 400, 500].map(n => (
                  <g key={n}>
                    <line
                      x1={scaleX(n)}
                      y1={padding.top + plotHeight}
                      x2={scaleX(n)}
                      y2={padding.top + plotHeight + 6}
                      stroke="#374151"
                      strokeWidth="1.5"
                    />
                    <text
                      x={scaleX(n)}
                      y={padding.top + plotHeight + 24}
                      textAnchor="middle"
                      fontSize="14"
                      fill="#374151"
                      fontWeight="500"
                    >
                      {n}
                    </text>
                  </g>
                ))}

                {/* Axes */}
                <line
                  x1={padding.left}
                  y1={padding.top}
                  x2={padding.left}
                  y2={padding.top + plotHeight}
                  stroke="#374151"
                  strokeWidth="2"
                />
                <line
                  x1={padding.left}
                  y1={padding.top + plotHeight}
                  x2={chartWidth - padding.right}
                  y2={padding.top + plotHeight}
                  stroke="#374151"
                  strokeWidth="2"
                />

                {/* Axis labels */}
                <text
                  x={padding.left + plotWidth / 2}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  fontSize="16"
                  fill="#374151"
                  fontWeight="600"
                >
                  Sample Size (n)
                </text>
                <text
                  x={20}
                  y={padding.top + plotHeight / 2}
                  textAnchor="middle"
                  fontSize="14"
                  fill="#374151"
                  fontWeight="600"
                  transform={`rotate(-90, 20, ${padding.top + plotHeight / 2})`}
                >
                  Average % Error
                </text>

                {/* Data lines with smooth curves */}
                <path
                  d={getPath(results.meanErrors)}
                  fill="none"
                  stroke={meanColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={getPath(results.stdErrors)}
                  fill="none"
                  stroke={stdColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data points - slightly larger */}
                {results.meanErrors.map((err, i) => (
                  <circle
                    key={`mean-${i}`}
                    cx={scaleX(SAMPLE_SIZES[i])}
                    cy={scaleY(err)}
                    r="6"
                    fill={meanColor}
                    stroke="white"
                    strokeWidth="2"
                  />
                ))}
                {results.stdErrors.map((err, i) => (
                  <circle
                    key={`std-${i}`}
                    cx={scaleX(SAMPLE_SIZES[i])}
                    cy={scaleY(err)}
                    r="6"
                    fill={stdColor}
                    stroke="white"
                    strokeWidth="2"
                  />
                ))}

                {/* Legend - positioned in upper right of chart */}
                <g transform={`translate(${chartWidth - padding.right - 160}, ${padding.top + 15})`}>
                  <rect x="-10" y="-10" width="170" height="65" fill="white" opacity="0.95" rx="8" stroke="#e5e7eb" />
                  <line x1="0" y1="12" x2="35" y2="12" stroke={meanColor} strokeWidth="4" strokeLinecap="round" />
                  <circle cx="17" cy="12" r="5" fill={meanColor} stroke="white" strokeWidth="1.5" />
                  <text x="45" y="12" fontSize="14" fill={meanColor} fontWeight="700" alignmentBaseline="middle">
                    x̄ → μ (mean)
                  </text>
                  <line x1="0" y1="40" x2="35" y2="40" stroke={stdColor} strokeWidth="4" strokeLinecap="round" />
                  <circle cx="17" cy="40" r="5" fill={stdColor} stroke="white" strokeWidth="1.5" />
                  <text x="45" y="40" fontSize="14" fill={stdColor} fontWeight="700" alignmentBaseline="middle">
                    s → σ (std dev)
                  </text>
                </g>
              </svg>
            </div>
          </div>

          {/* Right: Controls & Info - narrower */}
          <div className="w-64 flex flex-col gap-5">
            
            <button
              onClick={runSimulation}
              disabled={isRunning}
              className={`py-4 rounded-xl font-bold text-white text-xl transition-all shadow-lg ${
                isRunning ? "bg-gray-400" : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              {isRunning ? `Running ${currentStep}/${SAMPLE_SIZES.length}...` : "▶ Run Simulation"}
            </button>

            {/* Law of Large Numbers - main content */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border-2 border-indigo-200 flex-1">
              <div className="text-lg font-bold text-gray-800 mb-4">
                📐 Law of Large Numbers
              </div>
              <div className="text-base text-gray-700 space-y-4">
                <p>
                  Both <span className="text-red-600 font-bold">x̄</span> and{" "}
                  <span className="text-purple-600 font-bold">s</span> are{" "}
                  <strong>consistent estimators</strong>.
                </p>
                <p>
                  As <InlineMath math="n \to \infty" />:
                </p>
                <div className="bg-white rounded-lg p-3 text-center space-y-1">
                  <div className="text-red-600 font-mono text-lg"><InlineMath math="\bar{X} \xrightarrow{P} \mu" /></div>
                  <div className="text-purple-600 font-mono text-lg"><InlineMath math="s \xrightarrow{P} \sigma" /></div>
                </div>
                <p className="text-sm text-gray-500 pt-3 border-t border-indigo-200">
                  Sample statistics <strong>converge in probability</strong> to population parameters.
                </p>
              </div>
            </div>

            {/* Population info - compact */}
            <div className="bg-gray-100 p-3 rounded-xl text-sm text-gray-600 text-center">
              <span className="font-semibold">Stars:</span> N = {starData.population.n.toLocaleString()} | 
              μ = {popStats.mean.toFixed(1)} | σ = {popStats.std.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </SlideContainer>
  );
}
