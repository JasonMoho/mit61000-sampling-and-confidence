"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { BlockMath, InlineMath } from "react-katex";
import SlideContainer from "../components/SlideContainer";
import "katex/dist/katex.min.css";

// Helper function for factorial
function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

// Distribution configurations matching Act1
type DistKey = "uniform" | "bernoulli" | "binomial" | "poisson" | "normal" | "exponential" | "uniform_cont";

interface DistConfig {
  name: string;
  icon: string;
  type: "discrete" | "continuous";
  sample: () => number;
  getMean: () => number;
  getStd: () => number;
  // For visualization
  range: { xMin: number; xMax: number; yMax: number };
  // Discrete: points
  points?: { x: number; y: number }[];
  // Continuous: curve function
  curve?: (x: number) => number;
}

const distributions: Record<DistKey, DistConfig> = {
  // DISCRETE
  uniform: {
    name: "Discrete Uniform",
    icon: "🎲",
    type: "discrete",
    sample: () => Math.floor(Math.random() * 6) + 1,
    getMean: () => 3.5,
    getStd: () => Math.sqrt(35 / 12), // ~1.71
    range: { xMin: 0, xMax: 7, yMax: 0.25 },
    points: [1, 2, 3, 4, 5, 6].map(k => ({ x: k, y: 1 / 6 })),
  },
  bernoulli: {
    name: "Bernoulli",
    icon: "🪙",
    type: "discrete",
    sample: () => Math.random() < 0.6 ? 1 : 0,
    getMean: () => 0.6,
    getStd: () => Math.sqrt(0.6 * 0.4),
    range: { xMin: -0.5, xMax: 1.5, yMax: 0.8 },
    points: [{ x: 0, y: 0.4 }, { x: 1, y: 0.6 }],
  },
  binomial: {
    name: "Binomial",
    icon: "📊",
    type: "discrete",
    sample: () => {
      let successes = 0;
      for (let i = 0; i < 10; i++) {
        if (Math.random() < 0.5) successes++;
      }
      return successes;
    },
    getMean: () => 5, // n*p = 10*0.5
    getStd: () => Math.sqrt(10 * 0.5 * 0.5), // sqrt(n*p*(1-p))
    range: { xMin: -0.5, xMax: 10.5, yMax: 0.3 },
    points: Array.from({ length: 11 }, (_, k) => {
      const n = 10, p = 0.5;
      const coeff = factorial(n) / (factorial(k) * factorial(n - k));
      const prob = coeff * Math.pow(p, k) * Math.pow(1 - p, n - k);
      return { x: k, y: prob };
    }),
  },
  poisson: {
    name: "Poisson",
    icon: "📧",
    type: "discrete",
    sample: () => {
      // Knuth algorithm for Poisson sampling
      const lambda = 4;
      const L = Math.exp(-lambda);
      let k = 0, p = 1;
      do {
        k++;
        p *= Math.random();
      } while (p > L);
      return k - 1;
    },
    getMean: () => 4,
    getStd: () => 2, // sqrt(lambda)
    range: { xMin: -0.5, xMax: 12, yMax: 0.22 },
    points: Array.from({ length: 13 }, (_, k) => {
      const lambda = 4;
      const prob = (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
      return { x: k, y: prob };
    }),
  },
  // CONTINUOUS
  normal: {
    name: "Normal",
    icon: "📈",
    type: "continuous",
    sample: () => {
      // Box-Muller transform
      const u1 = Math.random();
      const u2 = Math.random();
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    },
    getMean: () => 0,
    getStd: () => 1,
    range: { xMin: -4, xMax: 4, yMax: 0.45 },
    curve: (x: number) => (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x),
  },
  exponential: {
    name: "Exponential",
    icon: "⏱️",
    type: "continuous",
    sample: () => -Math.log(1 - Math.random()), // lambda = 1
    getMean: () => 1,
    getStd: () => 1,
    range: { xMin: -0.5, xMax: 6, yMax: 1.1 },
    curve: (x: number) => x >= 0 ? Math.exp(-x) : 0,
  },
  uniform_cont: {
    name: "Uniform [0,1]",
    icon: "▬",
    type: "continuous",
    sample: () => Math.random(),
    getMean: () => 0.5,
    getStd: () => 1 / Math.sqrt(12),
    range: { xMin: -0.5, xMax: 1.5, yMax: 1.3 },
    curve: (x: number) => (x >= 0 && x <= 1) ? 1 : 0,
  },
};

const HIST_BINS = 50;

// Distribution groups
const discreteDists: DistKey[] = ["uniform", "bernoulli", "binomial", "poisson"];
const continuousDists: DistKey[] = ["normal", "exponential", "uniform_cont"];

export default function CentralLimitTheorem() {
  const [n, setN] = useState(5);
  const [selectedType, setSelectedType] = useState<"discrete" | "continuous">("discrete");
  const [dist, setDist] = useState<DistKey>("uniform");
  const [isRunning, setIsRunning] = useState(false);
  const [sampleMeans, setSampleMeans] = useState<number[]>([]);
  const [speed, setSpeed] = useState(50); // ms between samples
  const [showCI, setShowCI] = useState(false);
  const [showMisconception, setShowMisconception] = useState(false);
  const [showCaveats, setShowCaveats] = useState(false);
  const [showCLTDefinition, setShowCLTDefinition] = useState(false);

  const currentDist = distributions[dist];

  // Reset when distribution changes
  useEffect(() => {
    setSampleMeans([]);
  }, [dist]);

  // Take one sample of size n and record its mean
  const takeSample = useCallback(() => {
    const sample = Array.from({ length: n }, () => currentDist.sample());
    const mean = sample.reduce((a, b) => a + b, 0) / n;
    setSampleMeans(prev => [...prev, mean]);
  }, [n, currentDist]);

  // Animation loop
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(takeSample, speed);
    return () => clearInterval(interval);
  }, [isRunning, takeSample, speed]);

  // Compute histogram of sample means
  const { bins, maxBin, theoreticalMean, theoreticalSE, histRange } = useMemo(() => {
    const mu = currentDist.getMean();
    const sigma = currentDist.getStd();
    const se = sigma / Math.sqrt(n);
    
    // Set histogram range based on distribution (±4 SE from mean, but reasonable bounds)
    let minX = mu - 4 * sigma;
    let maxX = mu + 4 * sigma;
    
    // Clamp for specific distributions
    if (dist === "exponential") {
      minX = Math.max(0, minX);
      maxX = Math.min(6, maxX);
    } else if (dist === "uniform_cont") {
      minX = 0;
      maxX = 1;
    } else if (dist === "bernoulli") {
      minX = -0.1;
      maxX = 1.1;
    } else if (dist === "uniform") {
      minX = 0.5;
      maxX = 6.5;
    } else if (dist === "binomial") {
      minX = 0;
      maxX = 10;
    } else if (dist === "poisson") {
      minX = 0;
      maxX = 10;
    } else if (dist === "normal") {
      minX = -3;
      maxX = 3;
    }
    
    const binWidth = (maxX - minX) / HIST_BINS;
    const bins = new Array(HIST_BINS).fill(0);
    
    sampleMeans.forEach(m => {
      const clamped = Math.min(Math.max(m, minX), maxX - 0.001);
      const idx = Math.floor((clamped - minX) / binWidth);
      if (idx >= 0 && idx < HIST_BINS) bins[idx]++;
    });

    return {
      bins,
      maxBin: Math.max(...bins, 1),
      theoreticalMean: mu,
      theoreticalSE: se,
      histRange: { minX, maxX }
    };
  }, [sampleMeans, dist, n, currentDist]);

  // SVG dimensions for population distribution
  const popWidth = 300, popHeight = 200;
  const popPadding = { top: 10, right: 15, bottom: 25, left: 35 };
  const popPlotWidth = popWidth - popPadding.left - popPadding.right;
  const popPlotHeight = popHeight - popPadding.top - popPadding.bottom;

  const scalePopX = (x: number) => {
    const { xMin, xMax } = currentDist.range;
    return popPadding.left + ((x - xMin) / (xMax - xMin)) * popPlotWidth;
  };
  const scalePopY = (y: number) => {
    const { yMax } = currentDist.range;
    return popPadding.top + popPlotHeight - (y / yMax) * popPlotHeight;
  };

  // Generate population curve path
  const getPopulationPath = () => {
    if (!currentDist.curve) return "";
    const { xMin, xMax } = currentDist.range;
    const steps = 200;
    const stepSize = (xMax - xMin) / steps;
    let path = "";
    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * stepSize;
      const y = currentDist.curve(x);
      const px = scalePopX(x);
      const py = scalePopY(y);
      path += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
    }
    return path;
  };

  return (
    <SlideContainer title="The Central Limit Theorem">
      <div className="flex flex-col h-full gap-3 w-full pt-2 px-6">

        {/* Header */}
        <div className="text-center text-lg text-gray-600">
          Sample <InlineMath math="n" /> values, compute <InlineMath math="\bar{x}" />, repeat.{" "}
          <span className="text-teal-700 font-bold">The distribution of <InlineMath math="\bar{x}" /> becomes Normal.</span>
        </div>

        <div className="flex gap-5 flex-1 min-h-0">

          {/* LEFT: Controls */}
          <div className="w-60 flex flex-col gap-2 flex-shrink-0">
            
            {/* Distribution picker - matching Act1 style */}
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow">
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">Population</div>
              
              {/* Type toggle */}
              <div className="flex gap-1 mb-2">
                <button
                  onClick={() => { setSelectedType("discrete"); setDist("uniform"); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedType === "discrete"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Discrete
                </button>
                <button
                  onClick={() => { setSelectedType("continuous"); setDist("normal"); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedType === "continuous"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Continuous
                </button>
              </div>
              
              {/* Distribution list */}
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                {(selectedType === "discrete" ? discreteDists : continuousDists).map(d => {
                  const distInfo = distributions[d];
                  return (
                    <button
                      key={d}
                      onClick={() => setDist(d)}
                      className={`px-2 py-1.5 rounded-lg text-left text-xs font-medium transition-all flex items-center gap-2 ${
                        dist === d 
                          ? (selectedType === "discrete" ? "bg-teal-600 text-white" : "bg-indigo-600 text-white")
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span>{distInfo.icon}</span>
                      <span>{distInfo.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sample size */}
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow">
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-bold">Sample Size</div>
              <div className="text-2xl font-bold text-indigo-700 mb-1">n = {n}</div>
              <input
                type="range"
                min="2"
                max="50"
                value={n}
                onChange={(e) => { setN(parseInt(e.target.value)); setSampleMeans([]); }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="text-[10px] text-gray-400 mt-0.5">Larger n → narrower spread</div>
            </div>

            {/* Run controls */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex-1 py-2.5 rounded-lg font-bold text-white transition-all ${
                  isRunning ? "bg-amber-500 hover:bg-amber-600" : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                {isRunning ? "⏸ Pause" : "▶ Run"}
              </button>
              <button
                onClick={() => setSampleMeans([])}
                className="px-3 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-gray-700"
              >
                Reset
              </button>
            </div>

            {/* Sample count */}
            <div className="bg-gray-100 p-2 rounded-lg text-center">
              <span className="text-gray-500 text-sm">Samples: </span>
              <span className="text-xl font-mono font-bold">{sampleMeans.length}</span>
            </div>

            {/* CLT Definition button */}
            <button
              onClick={() => setShowCLTDefinition(!showCLTDefinition)}
              className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
                showCLTDefinition 
                  ? "bg-indigo-600 text-white" 
                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-2 border-indigo-300"
              }`}
            >
              {showCLTDefinition ? "✓ CLT Definition" : "📐 What is CLT?"}
            </button>

            {/* Show CI button */}
            <button
              onClick={() => setShowCI(!showCI)}
              disabled={sampleMeans.length < 10}
              className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
                showCI 
                  ? "bg-purple-600 text-white" 
                  : sampleMeans.length < 10
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-purple-100 text-purple-700 hover:bg-purple-200 border-2 border-purple-300"
              }`}
            >
              {showCI ? "✓ 95% CI Shown" : "Show 95% CI"}
            </button>

            {/* Misconception button */}
            <button
              onClick={() => setShowMisconception(!showMisconception)}
              className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
                showMisconception 
                  ? "bg-red-600 text-white" 
                  : "bg-red-50 text-red-700 hover:bg-red-100 border-2 border-red-300"
              }`}
            >
              {showMisconception ? "✗ Hide Misconception" : "⚠️ Common Misconception"}
            </button>

            {/* Caveats button */}
            <button
              onClick={() => setShowCaveats(!showCaveats)}
              className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
                showCaveats 
                  ? "bg-amber-600 text-white" 
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100 border-2 border-amber-300"
              }`}
            >
              {showCaveats ? "✗ Hide Caveats" : "⚡ When CLT Fails"}
            </button>

            {/* Speed control */}
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <span>Speed:</span>
              <input
                type="range"
                min="10"
                max="200"
                value={200 - speed}
                onChange={(e) => setSpeed(200 - parseInt(e.target.value))}
                className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-400"
              />
            </div>
          </div>

          {/* CENTER: Population Distribution */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="text-sm font-bold text-gray-600 mb-1 text-center flex items-center justify-center gap-2">
              <span>{currentDist.icon}</span>
              <span>Population: {currentDist.name}</span>
            </div>
            <div className="flex-1 bg-white border border-gray-200 rounded-xl p-3 relative">
              <svg viewBox={`0 0 ${popWidth} ${popHeight}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                {/* X-axis */}
                <line 
                  x1={popPadding.left} 
                  y1={scalePopY(0)} 
                  x2={popWidth - popPadding.right} 
                  y2={scalePopY(0)} 
                  stroke="#374151" 
                  strokeWidth="1.5" 
                />
                {/* Y-axis */}
                <line 
                  x1={popPadding.left} 
                  y1={popPadding.top} 
                  x2={popPadding.left} 
                  y2={scalePopY(0)} 
                  stroke="#374151" 
                  strokeWidth="1.5" 
                />
                
                {/* Discrete: bars */}
                {currentDist.points && currentDist.points.map((pt, i) => {
                  const barWidth = Math.min(20, popPlotWidth / currentDist.points!.length - 2);
                  const barHeight = Math.max(0, scalePopY(0) - scalePopY(pt.y));
                  const color = selectedType === "discrete" ? "#0d9488" : "#4f46e5";
                  return (
                    <g key={i}>
                      <rect
                        x={scalePopX(pt.x) - barWidth / 2}
                        y={scalePopY(pt.y)}
                        width={barWidth}
                        height={barHeight}
                        fill={color}
                        opacity={0.8}
                        rx={2}
                      />
                      <text 
                        x={scalePopX(pt.x)} 
                        y={scalePopY(0) + 12} 
                        textAnchor="middle" 
                        fontSize="9" 
                        fill="#4b5563"
                      >
                        {pt.x}
                      </text>
                    </g>
                  );
                })}

                {/* Continuous: curve */}
                {currentDist.curve && (
                  <>
                    <path
                      d={getPopulationPath() + ` L ${scalePopX(currentDist.range.xMax)} ${scalePopY(0)} L ${scalePopX(currentDist.range.xMin)} ${scalePopY(0)} Z`}
                      fill="#818cf8"
                      opacity={0.25}
                    />
                    <path
                      d={getPopulationPath()}
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="2.5"
                    />
                  </>
                )}

                {/* Mean line */}
                <line 
                  x1={scalePopX(theoreticalMean)} 
                  y1={popPadding.top} 
                  x2={scalePopX(theoreticalMean)} 
                  y2={scalePopY(0)} 
                  stroke="#dc2626" 
                  strokeWidth="2" 
                  strokeDasharray="5 3"
                />
                
                {/* Mean label */}
                <text 
                  x={scalePopX(theoreticalMean)} 
                  y={popPadding.top - 3} 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill="#dc2626"
                  fontWeight="bold"
                >
                  μ = {theoreticalMean.toFixed(2)}
                </text>
              </svg>
            </div>
          </div>

          {/* RIGHT: Sampling Distribution */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="text-sm font-bold text-teal-700 mb-1 text-center">
              Distribution of Sample Means (<InlineMath math="\bar{x}" />)
            </div>
            <div className="flex-1 bg-white border-2 border-teal-200 rounded-xl p-3 relative">
              <svg viewBox={`0 0 ${popWidth} ${popHeight}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                {/* X-axis */}
                <line 
                  x1={popPadding.left} 
                  y1={popHeight - popPadding.bottom} 
                  x2={popWidth - popPadding.right} 
                  y2={popHeight - popPadding.bottom} 
                  stroke="#374151" 
                  strokeWidth="1.5" 
                />

                {/* 95% CI shaded region */}
                {showCI && sampleMeans.length >= 10 && (() => {
                  const scaleHistX = (x: number) => 
                    popPadding.left + ((x - histRange.minX) / (histRange.maxX - histRange.minX)) * popPlotWidth;
                  const ciLow = theoreticalMean - 1.96 * theoreticalSE;
                  const ciHigh = theoreticalMean + 1.96 * theoreticalSE;
                  const ciLowX = scaleHistX(ciLow);
                  const ciHighX = scaleHistX(ciHigh);
                  
                  return (
                    <>
                      {/* Shaded CI region */}
                      <rect
                        x={ciLowX}
                        y={popPadding.top}
                        width={ciHighX - ciLowX}
                        height={popPlotHeight}
                        fill="#8b5cf6"
                        opacity={0.15}
                      />
                      {/* CI boundary lines */}
                      <line 
                        x1={ciLowX} 
                        y1={popPadding.top} 
                        x2={ciLowX} 
                        y2={popHeight - popPadding.bottom} 
                        stroke="#7c3aed" 
                        strokeWidth="2.5" 
                      />
                      <line 
                        x1={ciHighX} 
                        y1={popPadding.top} 
                        x2={ciHighX} 
                        y2={popHeight - popPadding.bottom} 
                        stroke="#7c3aed" 
                        strokeWidth="2.5" 
                      />
                      {/* CI labels */}
                      <text 
                        x={ciLowX} 
                        y={popHeight - popPadding.bottom + 12} 
                        textAnchor="middle" 
                        fontSize="8" 
                        fill="#7c3aed"
                        fontWeight="bold"
                      >
                        {ciLow.toFixed(2)}
                      </text>
                      <text 
                        x={ciHighX} 
                        y={popHeight - popPadding.bottom + 12} 
                        textAnchor="middle" 
                        fontSize="8" 
                        fill="#7c3aed"
                        fontWeight="bold"
                      >
                        {ciHigh.toFixed(2)}
                      </text>
                      {/* 95% label at top - outside the chart area */}
                      <text 
                        x={(ciLowX + ciHighX) / 2} 
                        y={popPadding.top - 3} 
                        textAnchor="middle" 
                        fontSize="10" 
                        fill="#7c3aed"
                        fontWeight="bold"
                      >
                        95% of x̄ values
                      </text>
                    </>
                  );
                })()}
                
                {/* Histogram bars */}
                {bins.map((count, i) => {
                  const barWidth = popPlotWidth / HIST_BINS;
                  const barHeight = (count / maxBin) * (popPlotHeight - 10);
                  return (
                    <rect
                      key={i}
                      x={popPadding.left + i * barWidth}
                      y={popHeight - popPadding.bottom - barHeight}
                      width={barWidth - 0.5}
                      height={barHeight}
                      fill="#0d9488"
                      opacity={0.85}
                    />
                  );
                })}

                {/* Theoretical normal curve overlay */}
                {sampleMeans.length > 20 && (() => {
                  const scaleHistX = (x: number) => 
                    popPadding.left + ((x - histRange.minX) / (histRange.maxX - histRange.minX)) * popPlotWidth;
                  
                  // Normal PDF scaled to match histogram
                  const binWidth = (histRange.maxX - histRange.minX) / HIST_BINS;
                  const totalArea = sampleMeans.length * binWidth;
                  const normalPDF = (x: number) => {
                    const z = (x - theoreticalMean) / theoreticalSE;
                    return (1 / (theoreticalSE * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
                  };
                  
                  // Scale to match histogram height
                  const peakPDF = normalPDF(theoreticalMean);
                  const scaleFactor = (maxBin / (peakPDF * totalArea)) * 0.95;
                  
                  // Generate curve path
                  const steps = 100;
                  let path = "";
                  for (let i = 0; i <= steps; i++) {
                    const x = histRange.minX + (i / steps) * (histRange.maxX - histRange.minX);
                    const pdfVal = normalPDF(x) * totalArea * scaleFactor;
                    const barHeight = (pdfVal / maxBin) * (popPlotHeight - 10);
                    const px = scaleHistX(x);
                    const py = popHeight - popPadding.bottom - barHeight;
                    path += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
                  }
                  
                  return (
                    <path
                      d={path}
                      fill="none"
                      stroke="#7c3aed"
                      strokeWidth="2.5"
                      opacity={0.9}
                    />
                  );
                })()}

                {/* ±1 SE lines - hide when CI is shown */}
                {sampleMeans.length > 20 && !showCI && (() => {
                  const scaleHistX = (x: number) => 
                    popPadding.left + ((x - histRange.minX) / (histRange.maxX - histRange.minX)) * popPlotWidth;
                  const minus1SE = scaleHistX(theoreticalMean - theoreticalSE);
                  const plus1SE = scaleHistX(theoreticalMean + theoreticalSE);
                  
                  return (
                    <>
                      <line 
                        x1={minus1SE} 
                        y1={popPadding.top} 
                        x2={minus1SE} 
                        y2={popHeight - popPadding.bottom} 
                        stroke="#7c3aed" 
                        strokeWidth="1.5" 
                        strokeDasharray="4 3"
                        opacity={0.7}
                      />
                      <line 
                        x1={plus1SE} 
                        y1={popPadding.top} 
                        x2={plus1SE} 
                        y2={popHeight - popPadding.bottom} 
                        stroke="#7c3aed" 
                        strokeWidth="1.5" 
                        strokeDasharray="4 3"
                        opacity={0.7}
                      />
                      <text 
                        x={minus1SE - 3} 
                        y={popPadding.top - 2} 
                        textAnchor="end" 
                        fontSize="9" 
                        fill="#7c3aed"
                        fontWeight="bold"
                      >
                        −1 SE
                      </text>
                      <text 
                        x={plus1SE + 3} 
                        y={popPadding.top - 2} 
                        textAnchor="start" 
                        fontSize="9" 
                        fill="#7c3aed"
                        fontWeight="bold"
                      >
                        +1 SE
                      </text>
                    </>
                  );
                })()}

                {/* Theoretical mean line */}
                {(() => {
                  const meanX = popPadding.left + ((theoreticalMean - histRange.minX) / (histRange.maxX - histRange.minX)) * popPlotWidth;
                  return (
                    <line 
                      x1={meanX} 
                      y1={popPadding.top + 15} 
                      x2={meanX} 
                      y2={popHeight - popPadding.bottom} 
                      stroke="#dc2626" 
                      strokeWidth="2" 
                      strokeDasharray="5 3"
                    />
                  );
                })()}

                {/* X-axis labels */}
                <text 
                  x={popPadding.left} 
                  y={popHeight - 5} 
                  textAnchor="middle" 
                  fontSize="9" 
                  fill="#6b7280"
                >
                  {histRange.minX.toFixed(1)}
                </text>
                <text 
                  x={popWidth - popPadding.right} 
                  y={popHeight - 5} 
                  textAnchor="middle" 
                  fontSize="9" 
                  fill="#6b7280"
                >
                  {histRange.maxX.toFixed(1)}
                </text>
              </svg>

              {/* Normal PDF formula - appears when curve shows */}
              {sampleMeans.length > 20 && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-purple-50 border border-purple-200 px-4 py-2 rounded-lg shadow-sm">
                  <span className="text-purple-700 text-lg font-medium"><InlineMath math={`f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}`} /></span>
                </div>
              )}

              {/* Waiting message */}
              {sampleMeans.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-lg">
                  Click Run to start
                </div>
              )}

              {/* SE definition - show when CI is not shown */}
              {sampleMeans.length > 10 && !showCI && (
                <div className="absolute bottom-3 right-3 left-3 bg-teal-50 border-2 border-teal-300 text-teal-800 px-4 py-3 rounded-xl shadow-md">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="text-sm font-bold text-teal-700 mb-1">What is Standard Error (SE)?</div>
                      <p className="text-xs text-teal-600 leading-relaxed">
                        The <strong>standard deviation of sample means</strong>. It measures how much x̄ typically 
                        varies from sample to sample. Larger n → smaller SE → more precise estimates.
                      </p>
                    </div>
                    <div className="text-right border-l-2 border-teal-200 pl-4">
                      <div className="text-lg font-mono font-bold text-teal-700">SE = σ / √n</div>
                      <div className="text-sm text-teal-600 font-mono">
                        ≈ {theoreticalSE.toFixed(3)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CI explanation - bottom right, larger with definition */}
              {showCI && sampleMeans.length >= 10 && (
                <div className="absolute bottom-3 right-3 left-3 bg-purple-50 border-2 border-purple-300 text-purple-800 px-4 py-3 rounded-xl shadow-md">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="text-sm font-bold text-purple-700 mb-1">What is a 95% Confidence Interval?</div>
                      <p className="text-xs text-purple-600 leading-relaxed">
                        If we repeated this sampling process many times, <strong>95% of the intervals</strong> we 
                        construct would contain the true population mean μ.
                      </p>
                    </div>
                    <div className="text-right border-l-2 border-purple-200 pl-4">
                      <div className="text-lg font-mono font-bold text-purple-700">μ ± 1.96 × SE</div>
                      <div className="text-sm text-purple-600 font-mono">
                        [{(theoreticalMean - 1.96 * theoreticalSE).toFixed(2)}, {(theoreticalMean + 1.96 * theoreticalSE).toFixed(2)}]
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Misconception Modal */}
      {showMisconception && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowMisconception(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-4 border-4 border-red-400"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <h3 className="text-2xl font-bold text-red-700 mb-4">Common CI Misconception</h3>
                
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-lg">
                <p className="text-red-800 font-semibold text-lg">
                  ✗ WRONG: "There's a 95% probability that μ is in this interval"
                </p>
              </div>
              
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-r-lg">
                <p className="text-green-800 font-semibold text-lg">
                  ✓ RIGHT: "95% of intervals constructed this way contain μ"
                </p>
              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                The population mean μ is a <strong>fixed value</strong>, not random. Once you calculate an interval, 
                μ is either inside it or it isn't—there's no probability about it. The 95% refers to the 
                <strong> procedure's long-run success rate</strong>, not the probability for any single interval.
              </p>
            </div>
            <button 
              onClick={() => setShowMisconception(false)}
              className="mt-6 w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* CLT Caveats Modal */}
      {showCaveats && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowCaveats(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-4 border-4 border-amber-400"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <h3 className="text-2xl font-bold text-amber-700 mb-4">When CLT Can Fail</h3>
                
              <div className="space-y-4">
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                  <p className="text-amber-800 font-semibold">Small Sample Size (n &lt; 30)</p>
                  <p className="text-amber-700 text-sm mt-1">
                    The approximation may be poor for small n, especially with skewed populations. 
                    Use n ≥ 30 as a rule of thumb, or larger for very skewed data.
                  </p>
                </div>
                
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                  <p className="text-amber-800 font-semibold">Heavy-Tailed Distributions</p>
                  <p className="text-amber-700 text-sm mt-1">
                    Distributions with extreme outliers (like Cauchy or Pareto) may need very large n. 
                    Some have undefined variance, so CLT doesn't apply at all!
                  </p>
                </div>
                
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                  <p className="text-amber-800 font-semibold">Non-Independent Samples</p>
                  <p className="text-amber-700 text-sm mt-1">
                    CLT assumes observations are independent. Time series, clustered data, or 
                    sampling without replacement from small populations violate this.
                  </p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowCaveats(false)}
              className="mt-6 w-full py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors"
            >
              Understood!
            </button>
          </div>
        </div>
      )}

      {/* CLT Definition Modal */}
      {showCLTDefinition && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowCLTDefinition(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl mx-4 border-4 border-indigo-400"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <h3 className="text-2xl font-bold text-indigo-700 mb-4">The Central Limit Theorem</h3>
                
              <div className="bg-indigo-50 border-2 border-indigo-200 p-5 rounded-xl mb-5">
                <p className="text-indigo-900 text-lg leading-relaxed">
                  If <InlineMath math="X_1, X_2, \ldots, X_n" /> are <strong>independent</strong> random variables 
                  from <strong>any distribution</strong> with mean <InlineMath math="\mu" /> and 
                  variance <InlineMath math="\sigma^2" />, then for large <InlineMath math="n" />:
                </p>
                <div className="mt-4 text-center text-xl">
                  <InlineMath math="\bar{X} \approx \text{Normal}\left(\mu, \frac{\sigma}{\sqrt{n}}\right)" />
                </div>
                <p className="text-center text-indigo-600 text-sm mt-2">
                  The sample mean is approximately Normal with mean μ and standard deviation σ/√n
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-bold text-gray-700 mb-2">In Plain English</div>
                  <p className="text-gray-600 text-sm">
                    The average of many samples becomes <strong>normally distributed</strong>, 
                    regardless of the original distribution's shape.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-bold text-gray-700 mb-2">Key Parameters</div>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• Mean of <InlineMath math="\bar{X}" />: same as <InlineMath math="\mu" /></li>
                    <li>• Std of <InlineMath math="\bar{X}" />: <InlineMath math="s / \sqrt{n}" /> (SE)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mb-3">
                <p className="text-green-800 font-semibold mb-2">The Key Implication</p>
                <p className="text-green-700 text-sm">
                  We can estimate SE using just <strong>one sample</strong>! Replace σ with s (sample std):
                </p>
                <div className="text-center mt-2 text-lg">
                  <InlineMath math="\text{SE} \approx \frac{s}{\sqrt{n}}" />
                </div>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                <p className="text-purple-800 font-semibold mb-2">Building Confidence Intervals</p>
                <p className="text-purple-700 text-sm">
                  With just one sample, we can build a CI for the unknown μ:
                </p>
                <div className="text-center mt-2 text-lg">
                  <InlineMath math="\bar{x} \pm 1.96 \times \frac{s}{\sqrt{n}}" />
                </div>
                <p className="text-purple-600 text-xs mt-2 text-center">
                  No need to sample repeatedly — one sample gives us everything!
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowCLTDefinition(false)}
              className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </SlideContainer>
  );
}
