"use client";

import React, { useState, useMemo } from "react";
import { BlockMath, InlineMath } from "react-katex";
import SlideContainer from "../components/SlideContainer";
import "katex/dist/katex.min.css";

// --- Constants ---
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 350;
const X_MIN = -200;
const X_MAX = 200;
const Y_MAX = 0.06;

// --- Helper Functions ---
const scaleX = (x: number) => ((x - X_MIN) / (X_MAX - X_MIN)) * CANVAS_WIDTH;
const scaleY = (y: number) => CANVAS_HEIGHT * (1 - y / Y_MAX);

// Box-Muller for generating normal samples
function generateNormalSamples(n: number, mean: number, std: number): number[] {
  const samples: number[] = [];
  for (let i = 0; i < n; i++) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    samples.push(mean + z * std);
  }
  return samples;
}

export default function VarianceStdDev() {
  const [sigma, setSigma] = useState(30);
  const [mu, setMu] = useState(0);
  const [showCurve, setShowCurve] = useState(true);
  const [highlightSigma, setHighlightSigma] = useState<1 | 2 | 3 | null>(null);
  const [sampleKey, setSampleKey] = useState(0); // Force regeneration

  // Generate samples - changes with mu, sigma, or manual resample
  const samples = useMemo(() => {
    return generateNormalSamples(200, mu, sigma);
  }, [mu, sigma, sampleKey]);

  // Build dot positions from samples
  const dots = useMemo(() => {
    const binWidth = 4;
    const bins: Record<number, number> = {};
    
    return samples.map(val => {
      // Clamp to visible range
      const clampedVal = Math.max(X_MIN, Math.min(X_MAX, val));
      const binIndex = Math.round(clampedVal / binWidth);
      const x = binIndex * binWidth;
      const stackHeight = bins[binIndex] || 0;
      bins[binIndex] = stackHeight + 1;
      
      return {
        x: scaleX(x),
        y: CANVAS_HEIGHT - 4 - stackHeight * 5
      };
    });
  }, [samples]);

  // PDF curve path
  const curvePath = useMemo(() => {
    let d = "";
    for (let px = 0; px <= CANVAS_WIDTH; px += 2) {
      const x = X_MIN + (px / CANVAS_WIDTH) * (X_MAX - X_MIN);
      const pdf = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
      const py = scaleY(pdf);
      d += (px === 0 ? "M" : "L") + `${px},${py} `;
    }
    return d;
  }, [mu, sigma]);

  // Sigma region bounds (in pixels)
  const getRegion = (n: number) => {
    const left = scaleX(mu - n * sigma);
    const right = scaleX(mu + n * sigma);
    return { left: Math.max(0, left), right: Math.min(CANVAS_WIDTH, right) };
  };

  return (
    <SlideContainer title="Variance & Standard Deviation">
      <div className="flex flex-col items-center h-full gap-3 w-full pt-2">

        {/* Header */}
        <div className="text-lg text-gray-600 text-center">
          <span className="text-teal-700 font-bold">Variance</span> (<InlineMath math="\sigma^2" />) measures spread.{" "}
          <span className="text-indigo-700 font-bold">Standard Deviation</span> (<InlineMath math="\sigma" />) is its square root.
        </div>

        <div className="flex gap-6 w-full max-w-6xl flex-1 px-6 pb-4">

          {/* --- LEFT PANEL --- */}
          <div className="w-64 flex flex-col gap-3 flex-shrink-0">
            
            {/* Controls */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow">
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-bold">Parameters</div>

              {/* Mean */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Mean (μ)</span>
                  <span className="font-mono font-bold text-gray-700">{mu}</span>
                </div>
                <input
                  type="range" min="-80" max="80" value={mu}
                  onChange={(e) => setMu(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                />
              </div>

              {/* Std Dev */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Std Dev (σ)</span>
                  <span className="font-mono font-bold text-indigo-600">{sigma}</span>
                </div>
                <input
                  type="range" min="10" max="60" value={sigma}
                  onChange={(e) => setSigma(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Resample */}
              <button
                onClick={() => setSampleKey(k => k + 1)}
                className="w-full py-2 text-xs font-bold bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Resample Data
              </button>
            </div>

            {/* Formulas */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Std Dev Definition</div>
              <div className="text-sm"><BlockMath math="\sigma = \sqrt{\frac{1}{N} \sum_{i=1}^{N} (x_i - \mu)^2}" /></div>
            </div>

            {/* Normal PDF */}
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
              <div className="text-[10px] text-indigo-600 uppercase tracking-widest mb-1 font-bold">Normal PDF</div>
              <div className="text-sm"><BlockMath math="f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}" /></div>
            </div>

            {/* 68-95-99.7 Buttons */}
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
              <div className="text-[10px] text-indigo-600 uppercase tracking-widest mb-2 font-bold">Empirical Rule</div>
              <div className="flex flex-col gap-1">
                {[1, 2, 3].map(n => (
                  <button
                    key={n}
                    onClick={() => setHighlightSigma(highlightSigma === n ? null : n as 1|2|3)}
                    className={`text-left px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                      highlightSigma === n 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-indigo-100 border border-gray-200'
                    }`}
                  >
                    <span className="font-bold">{n === 1 ? '68%' : n === 2 ? '95%' : '99.7%'}</span> within ±{n}σ
                  </button>
                ))}
              </div>
            </div>

            {/* Show curve toggle */}
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox" checked={showCurve}
                onChange={(e) => setShowCurve(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
              Show theoretical curve
            </label>
          </div>

          {/* --- RIGHT PANEL: Chart --- */}
          <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden flex flex-col">
            
            <svg viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} className="flex-1" preserveAspectRatio="xMidYMid meet">
              
              {/* Highlight region */}
              {highlightSigma && (() => {
                const r = getRegion(highlightSigma);
                return (
                  <rect
                    x={r.left}
                    y={0}
                    width={r.right - r.left}
                    height={CANVAS_HEIGHT}
                    fill={`rgba(79, 70, 229, ${0.3 - highlightSigma * 0.05})`}
                  />
                );
              })()}

              {/* Grid lines */}
              {[-150, -100, -50, 0, 50, 100, 150].map(x => (
                <line key={x} x1={scaleX(x)} y1={0} x2={scaleX(x)} y2={CANVAS_HEIGHT} stroke="#f0f0f0" strokeWidth="1" />
              ))}

              {/* Mean line */}
              <line x1={scaleX(mu)} y1={0} x2={scaleX(mu)} y2={CANVAS_HEIGHT} stroke="#374151" strokeWidth="2" strokeDasharray="6 4" />

              {/* ±σ lines */}
              <line x1={scaleX(mu - sigma)} y1={0} x2={scaleX(mu - sigma)} y2={CANVAS_HEIGHT} stroke="#4f46e5" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
              <line x1={scaleX(mu + sigma)} y1={0} x2={scaleX(mu + sigma)} y2={CANVAS_HEIGHT} stroke="#4f46e5" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />

              {/* PDF curve */}
              {showCurve && <path d={curvePath} fill="none" stroke="#4f46e5" strokeWidth="3" />}

              {/* Dots */}
              {dots.map((d, i) => (
                <circle key={i} cx={d.x} cy={d.y} r="3" fill="#0d9488" />
              ))}

              {/* μ label with white background */}
              <rect x={scaleX(mu) - 30} y={4} width="60" height="18" fill="white" rx="3" />
              <text x={scaleX(mu)} y={16} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#374151">μ = {mu}</text>

              {/* σ bracket with arrow - positioned below μ label */}
              {(() => {
                const yPos = 38; // Just below μ label
                return (
                  <g>
                    <line x1={scaleX(mu)} y1={yPos} x2={scaleX(mu + sigma)} y2={yPos} stroke="#4f46e5" strokeWidth="2" />
                    <circle cx={scaleX(mu + sigma)} cy={yPos} r="4" fill="#4f46e5" />
                    <rect x={scaleX(mu + sigma) + 8} y={yPos - 10} width="56" height="18" fill="white" rx="3" />
                    <text x={scaleX(mu + sigma) + 36} y={yPos + 4} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#4f46e5">σ = {sigma}</text>
                  </g>
                );
              })()}

              {/* Highlight percentage label - with white background for readability */}
              {highlightSigma && (
                <g>
                  <rect x={scaleX(mu) - 50} y={CANVAS_HEIGHT - 36} width="100" height="22" fill="white" rx="4" />
                  <text x={scaleX(mu)} y={CANVAS_HEIGHT - 20} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#4f46e5">
                    {highlightSigma === 1 ? '68%' : highlightSigma === 2 ? '95%' : '99.7%'} of data
                  </text>
                </g>
              )}

            </svg>

            {/* X-axis labels */}
            <div className="h-8 border-t border-gray-200 bg-gray-50 flex items-center justify-between px-8 text-xs text-gray-400 font-mono">
              <span>-200</span>
              <span>-100</span>
              <span>0</span>
              <span>100</span>
              <span>200</span>
            </div>
          </div>
        </div>
      </div>
    </SlideContainer>
  );
}
