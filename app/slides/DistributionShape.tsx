"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import SlideContainer from "../components/SlideContainer";
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
function magToLuminosity(mag: number): number {
  return 100 - mag * 10;
}

// Sample sizes
const SAMPLE_SIZES = [5, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 75, 90, 100, 125, 150, 175, 200, 250, 300, 400, 500];

// Keep total work roughly constant: trials * n ≈ 1,000,000
const getTrials = (n: number) => Math.max(1000, Math.min(100000, Math.floor(1000000 / n)));

// Skewness modal component
function SkewnessModal({ onClose }: { onClose: () => void }) {
  // Mini distribution shapes for examples
  const ExampleDistribution = ({ 
    shape, 
    label, 
    skewValue, 
    color 
  }: { 
    shape: 'symmetric' | 'left' | 'right';
    label: string;
    skewValue: string;
    color: string;
  }) => {
    const width = 140;
    const height = 60;
    const points = 20;
    
    // Generate distribution shape
    const getY = (x: number) => {
      const normalizedX = x / points;
      if (shape === 'symmetric') {
        // Normal distribution - symmetric
        const center = 0.5;
        return Math.exp(-Math.pow((normalizedX - center) * 4, 2));
      } else if (shape === 'right') {
        // Right skewed (long tail to right) - like star brightness
        return Math.pow(1 - normalizedX, 2) * Math.exp(-normalizedX * 0.5);
      } else {
        // Left skewed (long tail to left)
        return Math.pow(normalizedX, 2) * Math.exp(-(1 - normalizedX) * 0.5);
      }
    };
    
    const bars = Array.from({ length: points }, (_, i) => getY(i));
    const maxBar = Math.max(...bars);
    const barWidth = width / points;
    
    // Mean position
    const meanPos = shape === 'symmetric' ? 0.5 : shape === 'right' ? 0.3 : 0.7;
    
    return (
      <div className="text-center">
        <svg width={width} height={height} className="rounded bg-gray-50 border border-gray-200">
          {bars.map((h, i) => (
            <rect
              key={i}
              x={i * barWidth}
              y={height - (h / maxBar) * (height - 15) - 5}
              width={barWidth - 1}
              height={(h / maxBar) * (height - 15)}
              fill={color}
              opacity={0.6}
              stroke={color}
              strokeWidth="0.5"
            />
          ))}
          {/* Mean line */}
          <line
            x1={meanPos * width}
            y1={5}
            x2={meanPos * width}
            y2={height - 5}
            stroke="#dc2626"
            strokeWidth="2"
          />
          {/* Baseline */}
          <line x1="0" y1={height - 5} x2={width} y2={height - 5} stroke="#9ca3af" strokeWidth="1" />
        </svg>
        <div className="text-sm font-semibold mt-1" style={{ color }}>{label}</div>
        <div className="text-xs text-gray-600">Skewness: <span className="font-mono font-bold">{skewValue}</span></div>
      </div>
    );
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">What is Skewness?</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        {/* Definition */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
          <p className="text-gray-700">
            <strong>Skewness</strong> measures the <em>asymmetry</em> of a distribution. 
            It tells us whether the data is spread more to one side of the mean.
          </p>
        </div>
        
        {/* Three examples */}
        <div className="flex justify-around gap-4 mb-5">
          <ExampleDistribution 
            shape="left" 
            label="Left Skewed" 
            skewValue="−0.8" 
            color="#8b5cf6" 
          />
          <ExampleDistribution 
            shape="symmetric" 
            label="No Skew" 
            skewValue="0.0" 
            color="#10b981" 
          />
          <ExampleDistribution 
            shape="right" 
            label="Right Skewed" 
            skewValue="+0.8" 
            color="#f59e0b" 
          />
        </div>
        
        {/* Interpretation */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="font-semibold text-purple-700 mb-1">Left (Negative)</div>
            <p className="text-gray-600">
              Long tail stretches left. Most values are high, but some extreme low values pull the mean down.
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="font-semibold text-green-700 mb-1">Symmetric (Zero)</div>
            <p className="text-gray-600">
              Data is balanced around the mean. Normal and uniform distributions have zero skewness.
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="font-semibold text-amber-700 mb-1">Right (Positive)</div>
            <p className="text-gray-600">
              Long tail stretches right. Most values are low, but some extreme high values pull the mean up.
            </p>
          </div>
        </div>
        
        {/* Note about star data */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <em>Star brightness has positive skewness: many dim stars, few very bright ones.</em>
        </div>
      </div>
    </div>
  );
}

// Mini histogram component for distribution display
function MiniHistogram({ 
  bins, 
  color, 
  fillColor,
  label,
  skewness,
  meanPosition, // 0-1 relative position of mean
  onSkewnessClick,
}: { 
  bins: number[];
  color: string;
  fillColor: string;
  label: string;
  skewness: string;
  meanPosition?: number;
  onSkewnessClick?: () => void;
}) {
  const maxCount = Math.max(...bins);
  const width = 180;
  const height = 70;
  const barWidth = width / bins.length;
  
  return (
    <div className="text-center">
      <svg width={width} height={height} className="rounded-lg bg-white border border-gray-200">
        {bins.map((count, i) => {
          const barHeight = (count / maxCount) * (height - 10);
          return (
            <rect
              key={i}
              x={i * barWidth}
              y={height - barHeight - 5}
              width={barWidth - 1}
              height={barHeight}
              fill={fillColor}
              stroke={color}
              strokeWidth="0.5"
            />
          );
        })}
        {/* Mean line */}
        {meanPosition !== undefined && (
          <line
            x1={meanPosition * width}
            y1={5}
            x2={meanPosition * width}
            y2={height - 5}
            stroke="#dc2626"
            strokeWidth="2"
          />
        )}
        {/* Baseline */}
        <line x1="0" y1={height - 5} x2={width} y2={height - 5} stroke="#9ca3af" strokeWidth="1" />
      </svg>
      <div className="text-lg font-bold mt-1" style={{ color }}>{label}</div>
      <div className="text-sm text-gray-600">
        <button
          onClick={onSkewnessClick}
          className="hover:bg-blue-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer underline decoration-dotted underline-offset-2"
          title="Click to learn about skewness"
        >
          Skewness: <span className="font-mono font-bold">{skewness}</span>
        </button>
      </div>
    </div>
  );
}

export default function DistributionShape() {
  const [starData, setStarData] = useState<StarData | null>(null);
  const [starLuminosities, setStarLuminosities] = useState<Float64Array | null>(null);
  const [starStats, setStarStats] = useState<{ mean: number; std: number; skewness: number } | null>(null);
  
  const [isRunning, setIsRunning] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [results, setResults] = useState<{ uniform: number[]; stars: number[] }>({ uniform: [], stars: [] });
  const [showSkewnessModal, setShowSkewnessModal] = useState(false);
  const abortRef = useRef(false);

  // Load star data
  useEffect(() => {
    const basePath = process.env.NODE_ENV === 'production' ? '/mit61000-sampling-and-confidence' : '';
    fetch(`${basePath}/stars.json`)
      .then(res => res.json())
      .then((data: StarData) => {
        setStarData(data);
        // Pre-compute luminosities, filtering to 0-80 range to match histogram
        const allLums: number[] = [];
        for (let i = 0; i < data.stars.length; i++) {
          const lum = magToLuminosity(data.stars[i].mag);
          if (lum > 0 && lum < 80) {
            allLums.push(lum);
          }
        }
        const lums = new Float64Array(allLums);
        const count = lums.length;
        
        let sum = 0;
        for (let i = 0; i < count; i++) {
          sum += lums[i];
        }
        const mean = sum / count;
        
        let sumSq = 0;
        let sumCube = 0;
        for (let i = 0; i < count; i++) {
          const diff = lums[i] - mean;
          sumSq += diff ** 2;
          sumCube += diff ** 3;
        }
        const std = Math.sqrt(sumSq / count);
        const skewness = (sumCube / count) / (std ** 3);
        setStarLuminosities(lums);
        setStarStats({ mean, std, skewness });
      })
      .catch(err => console.error('Failed to load star data:', err));
  }, []);

  // Compute histogram bins for star luminosities (only 0-80 range, like PopulationSample)
  const starHistogramBins = useMemo(() => {
    if (!starLuminosities) return [];
    const numBins = 20;
    const minVal = 0;
    const maxVal = 80;
    const binWidth = (maxVal - minVal) / numBins;
    const bins = new Array(numBins).fill(0);
    for (let i = 0; i < starLuminosities.length; i++) {
      const lum = starLuminosities[i];
      if (lum >= minVal && lum < maxVal) {
        const binIdx = Math.floor((lum - minVal) / binWidth);
        bins[Math.min(numBins - 1, binIdx)]++;
      }
    }
    return bins;
  }, [starLuminosities]);

  // Uniform distribution histogram (flat)
  const uniformHistogramBins = useMemo(() => {
    // Uniform is flat - all bins equal
    return new Array(20).fill(100);
  }, []);

  // Simulation for uniform distribution
  const runUniformSim = useCallback((n: number): number => {
    const popStd = 1 / Math.sqrt(12); // Uniform[0,1] std
    const trials = getTrials(n);
    
    let totalError = 0;
    for (let t = 0; t < trials; t++) {
      let sum = 0;
      const samples = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        const v = Math.random();
        samples[i] = v;
        sum += v;
      }
      const mean = sum / n;
      let sumSq = 0;
      for (let i = 0; i < n; i++) {
        sumSq += (samples[i] - mean) ** 2;
      }
      const sampleStd = Math.sqrt(sumSq / (n - 1));
      totalError += Math.abs(sampleStd - popStd);
    }
    return (totalError / trials) / popStd * 100;
  }, []);

  // Simulation for star distribution (sampling WITH replacement from real data)
  const runStarsSim = useCallback((n: number): number => {
    if (!starLuminosities || !starStats) return 0;
    
    const popStd = starStats.std;
    const trials = getTrials(n);
    const numStars = starLuminosities.length;
    
    let totalError = 0;
    for (let t = 0; t < trials; t++) {
      let sum = 0;
      const samples = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        const idx = Math.floor(Math.random() * numStars);
        const v = starLuminosities[idx];
        samples[i] = v;
        sum += v;
      }
      const mean = sum / n;
      let sumSq = 0;
      for (let i = 0; i < n; i++) {
        sumSq += (samples[i] - mean) ** 2;
      }
      const sampleStd = Math.sqrt(sumSq / (n - 1));
      totalError += Math.abs(sampleStd - popStd);
    }
    return (totalError / trials) / popStd * 100;
  }, [starLuminosities, starStats]);

  const runSimulation = useCallback(() => {
    if (!starLuminosities || !starStats) return;
    
    setIsRunning(true);
    setAnimationStep(0);
    setResults({ uniform: [], stars: [] });
    abortRef.current = false;

    const newResults = { uniform: [] as number[], stars: [] as number[] };
    let step = 0;

    const runStep = () => {
      if (abortRef.current || step >= SAMPLE_SIZES.length) {
        setIsRunning(false);
        return;
      }

      const n = SAMPLE_SIZES[step];
      newResults.uniform.push(runUniformSim(n));
      newResults.stars.push(runStarsSim(n));

      setResults({ ...newResults });
      setAnimationStep(step + 1);
      step++;

      requestAnimationFrame(() => setTimeout(runStep, 15));
    };

    runStep();
  }, [runUniformSim, runStarsSim, starLuminosities, starStats]);

  useEffect(() => {
    return () => { abortRef.current = true; };
  }, []);

  // Chart dimensions
  const chartWidth = 700;
  const chartHeight = 360;
  const padding = { top: 30, right: 30, bottom: 55, left: 80 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Linear scale for Y axis (0% to 25%)
  const maxY = 25;
  const maxX = 500;

  const scaleX = (n: number) => padding.left + (n / maxX) * plotWidth;
  const scaleY = (pct: number) => {
    const clamped = Math.max(0, Math.min(pct, maxY));
    return padding.top + plotHeight - (clamped / maxY) * plotHeight;
  };

  const getPath = (data: number[]) => {
    if (data.length === 0) return "";
    let path = "";
    data.forEach((pct, i) => {
      const x = scaleX(SAMPLE_SIZES[i]);
      const y = scaleY(pct);
      path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    return path;
  };

  const yTicks = [0, 5, 10, 15, 20, 25];

  // Colors for the two distributions
  const uniformColor = "#3b82f6";
  const uniformFill = "#bfdbfe";
  const starsColor = "#f59e0b";
  const starsFill = "#fef3c7";

  if (!starData || !starStats) {
    return (
      <SlideContainer title="Does Distribution Shape Matter?">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400">Loading star data...</div>
        </div>
      </SlideContainer>
    );
  }

  return (
    <SlideContainer title="Does Distribution Shape Matter?">
      {showSkewnessModal && <SkewnessModal onClose={() => setShowSkewnessModal(false)} />}
      <div className="flex flex-col h-full w-full pt-2 px-4">

        {/* TOP: Two actual distribution histograms */}
        <div className="flex items-center justify-center gap-16 mb-4">
          <MiniHistogram
            bins={uniformHistogramBins}
            color={uniformColor}
            fillColor={uniformFill}
            label="Uniform"
            skewness="Symmetric"
            meanPosition={0.5}
            onSkewnessClick={() => setShowSkewnessModal(true)}
          />
          <MiniHistogram
            bins={starHistogramBins}
            color={starsColor}
            fillColor={starsFill}
            label="Star Brightness"
            skewness="Right Skewed"
            meanPosition={starStats.mean / 80}
            onSkewnessClick={() => setShowSkewnessModal(true)}
          />
        </div>

        <div className="flex gap-4" style={{ height: '420px' }}>

          {/* Chart */}
          <div className="flex-1 flex flex-col" style={{ minWidth: 0 }}>
            <div className="text-center mb-1">
              <div className="text-base font-bold text-gray-700">% Error in Sample Standard Deviation</div>
              <div className="text-xs text-gray-500">For each n: draw n values → compute sample std (s) → compare to true σ</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-2" style={{ height: '350px' }}>
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
                
                {/* Grid lines */}
                {yTicks.map(pct => (
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
                      x={padding.left - 10}
                      y={scaleY(pct)}
                      textAnchor="end"
                      alignmentBaseline="middle"
                      fontSize="12"
                      fill={pct === 0 ? "#10b981" : "#6b7280"}
                      fontWeight={pct === 0 ? "bold" : "500"}
                    >
                      {pct}%
                    </text>
                  </g>
                ))}

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
                      fontWeight="600"
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
                  x={chartWidth / 2}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  fontSize="16"
                  fill="#374151"
                  fontWeight="700"
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

                {/* Data lines */}
                <path
                  d={getPath(results.uniform)}
                  fill="none"
                  stroke={uniformColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={getPath(results.stars)}
                  fill="none"
                  stroke={starsColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Right panel */}
          <div className="w-72 flex flex-col gap-3">
            
            <button
              onClick={runSimulation}
              disabled={isRunning || !starData}
              className={`py-4 rounded-xl font-bold text-white text-xl transition-all ${
                isRunning ? "bg-gray-400" : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              {isRunning ? `${animationStep}/${SAMPLE_SIZES.length}` : "▶ Run Simulation"}
            </button>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-200 flex-1 flex flex-col justify-center">
              <div className="text-lg font-bold text-gray-800 mb-3">
                Real Data vs Theory
              </div>
              
              <div className="space-y-3 text-base text-gray-700">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded mt-0.5" style={{ backgroundColor: uniformColor }}></div>
                  <div><strong>Uniform:</strong> Textbook distribution, perfectly symmetric</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded mt-0.5" style={{ backgroundColor: starsColor }}></div>
                  <div><strong>Stars:</strong> Real astronomical data with natural skew</div>
                </div>
              </div>

              <div className="mt-4 bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-base font-bold text-orange-600">
                  The gap shows the cost of skewness
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Skewed data needs more samples to estimate σ accurately
                </div>
              </div>
            </div>

            {/* Star data info */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm text-gray-600">
              <div className="font-bold text-gray-700 mb-1">Star Dataset</div>
              <div>N = {starData.population.n.toLocaleString()} stars</div>
              <div>μ = {starStats.mean.toFixed(1)}, σ = {starStats.std.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </div>
    </SlideContainer>
  );
}
