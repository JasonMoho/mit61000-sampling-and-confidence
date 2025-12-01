"use client";

import React from "react";
import { BlockMath, InlineMath } from "react-katex";
import SlideContainer from "../components/SlideContainer";
import { motion, AnimatePresence } from "framer-motion";
import "katex/dist/katex.min.css";

// Helper function for factorial
function factorial(n: number): number {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

// Real-world examples for each distribution with detailed explanations
const realWorldExamples: Record<string, { title: string; description: string; detail: string; iconType: string }[]> = {
    uniform: [
        { 
            title: "Rolling a Fair Die", 
            description: "Each face (1-6) has exactly 1/6 probability", 
            detail: "Casino games rely on this property. If any outcome were more likely, the house edge calculations would fail. Quality control tests dice by rolling thousands of times.",
            iconType: "dice"
        },
        { 
            title: "Lottery Number Selection", 
            description: "Each number is equally likely to be drawn", 
            detail: "State lotteries use mechanical mixing or certified random number generators to ensure uniformity. Any bias would be exploited by players and invite lawsuits.",
            iconType: "ticket"
        },
        { 
            title: "Random Sampling", 
            description: "Selecting subjects for a clinical trial", 
            detail: "When researchers randomly assign patients to treatment vs control groups, each patient has equal probability of assignment. This eliminates selection bias.",
            iconType: "users"
        },
    ],
    bernoulli: [
        { 
            title: "Medical Diagnostic Tests", 
            description: "Positive or negative result with known accuracy", 
            detail: "A COVID test returns positive (1) with probability equal to sensitivity if infected, or false positive rate if not. Understanding these Bernoulli probabilities is critical for interpreting results.",
            iconType: "medical"
        },
        { 
            title: "A/B Testing in Tech", 
            description: "User clicks (1) or doesn't click (0) a button", 
            detail: "When Google tests a new search layout, each user's click is a Bernoulli trial. Millions of trials reveal tiny differences in click-through probability.",
            iconType: "cursor"
        },
        { 
            title: "Manufacturing Quality", 
            description: "Each item passes (1) or fails (0) inspection", 
            detail: "In semiconductor fabrication, each chip either works or doesn't. A fab yielding 95% working chips has p=0.95 per Bernoulli trial.",
            iconType: "chip"
        },
    ],
    binomial: [
        { 
            title: "Quality Control Sampling", 
            description: "Number of defective items in a batch of 100", 
            detail: "A factory samples 100 items from each production run. If the defect rate is 2%, the number of defects follows Binomial(100, 0.02). Seeing 5+ defects might trigger a line shutdown.",
            iconType: "clipboard"
        },
        { 
            title: "Election Polling", 
            description: "Number of supporters in a sample of n voters", 
            detail: "If 52% of the population supports a candidate, polling 1000 voters gives Binomial(1000, 0.52). This determines margin of error and confidence intervals.",
            iconType: "vote"
        },
        { 
            title: "Clinical Trial Success", 
            description: "Number of patients who respond to treatment", 
            detail: "In a drug trial with 200 patients, if the true response rate is 40%, we expect Binomial(200, 0.4) responders. The FDA uses this to determine if the drug works.",
            iconType: "pill"
        },
    ],
    poisson: [
        { 
            title: "Call Center Staffing", 
            description: "Number of customer calls per hour", 
            detail: "If a call center averages λ=50 calls/hour, actual counts vary as Poisson(50). Staffing models use this to ensure 95% of calls are answered within 30 seconds.",
            iconType: "phone"
        },
        { 
            title: "Network Packet Arrivals", 
            description: "Data packets arriving at a router per millisecond", 
            detail: "Internet traffic is well-modeled by Poisson processes. Router buffer sizes are designed to handle the variance: too small causes packet loss, too large wastes memory.",
            iconType: "network"
        },
        { 
            title: "Rare Disease Clusters", 
            description: "Cancer cases per county per year", 
            detail: "Epidemiologists use Poisson to detect disease clusters. If a county has 15 cases when Poisson(λ=3) predicts only 3, this triggers investigation for environmental causes.",
            iconType: "activity"
        },
    ],
    normal: [
        { 
            title: "Human Biometrics", 
            description: "Heights, weights, blood pressure in populations", 
            detail: "Adult male height in the US: μ=5'9\", σ=3\". This means 68% of men are between 5'6\" and 6'0\", and 95% between 5'3\" and 6'3\". Clothing sizes are designed around this.",
            iconType: "ruler"
        },
        { 
            title: "Measurement Error", 
            description: "Repeated measurements of the same quantity", 
            detail: "When a lab measures the same sample 100 times, results scatter normally around the true value. The standard deviation quantifies instrument precision.",
            iconType: "target"
        },
        { 
            title: "Standardized Testing", 
            description: "SAT, IQ, and other test scores", 
            detail: "IQ is defined to be Normal(100, 15). This means 68% score 85-115, and only 2.5% score above 130. Test questions are calibrated to produce this distribution.",
            iconType: "graduation"
        },
    ],
    exponential: [
        { 
            title: "Wait Time Between Events", 
            description: "Time until the next bus arrives", 
            detail: "If buses arrive as a Poisson process with rate λ=6/hour, wait time is Exponential with mean 10 minutes. The memoryless property means waiting 5 minutes doesn't reduce expected remaining wait.",
            iconType: "clock"
        },
        { 
            title: "Component Reliability", 
            description: "Time until a light bulb burns out", 
            detail: "Electronic components often have exponentially distributed lifetimes. A server with 1000 hard drives (each with mean lifetime 5 years) expects ~200 failures per year.",
            iconType: "lightbulb"
        },
        { 
            title: "Radioactive Decay", 
            description: "Time until a single atom decays", 
            detail: "Each uranium atom has a constant decay probability per second. The time until decay is exponential. Carbon-14's half-life of 5,730 years enables radiocarbon dating.",
            iconType: "atom"
        },
    ],
    uniform_cont: [
        { 
            title: "Random Number Generation", 
            description: "Math.random() produces values in [0,1]", 
            detail: "All other random distributions are built from uniform randoms. To generate Normal(0,1), we use Box-Muller transform on two Uniform(0,1) samples.",
            iconType: "code"
        },
        { 
            title: "Arrival Time Uncertainty", 
            description: "A delivery arrives 'sometime between 2-4pm'", 
            detail: "If you have no information about when within a window an event occurs, uniform is the maximum entropy (least assumptive) distribution.",
            iconType: "truck"
        },
        { 
            title: "Quantization Error", 
            description: "Rounding error when digitizing audio", 
            detail: "When converting analog audio to 16-bit digital, the fractional part lost is Uniform(-Δ/2, Δ/2). This adds 'quantization noise' to the signal.",
            iconType: "waveform"
        },
    ],
};

// SVG Icon components
function Icon({ type, className = "w-8 h-8" }: { type: string; className?: string }) {
    const icons: Record<string, React.ReactNode> = {
        dice: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                <circle cx="16" cy="8" r="1.5" fill="currentColor" />
                <circle cx="8" cy="16" r="1.5" fill="currentColor" />
                <circle cx="16" cy="16" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
        ),
        ticket: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 9V6a2 2 0 012-2h16a2 2 0 012 2v3m-20 0a3 3 0 100 6m0-6v6m20-6a3 3 0 110 6m0-6v6m0 0v3a2 2 0 01-2 2H4a2 2 0 01-2-2v-3" />
                <path d="M9 4v16m6-16v16" strokeDasharray="2 2" />
            </svg>
        ),
        users: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="7" r="3" />
                <circle cx="17" cy="7" r="2.5" />
                <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                <path d="M17 14a3 3 0 013 3v4" />
            </svg>
        ),
        medical: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12h6m-3-3v6" />
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 10h18" />
            </svg>
        ),
        cursor: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4l7.07 17 2.51-7.39L21 11.07 4 4z" />
                <path d="M13 13l6 6" />
            </svg>
        ),
        chip: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="6" y="6" width="12" height="12" rx="1" />
                <path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4" />
            </svg>
        ),
        clipboard: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="5" y="3" width="14" height="18" rx="2" />
                <path d="M9 7h6M9 11h6M9 15h4" />
            </svg>
        ),
        vote: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                <path d="M9 12l2 2 4-4" />
            </svg>
        ),
        pill: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8.5 8.5l7 7M5 12l7-7a4.95 4.95 0 017 7l-7 7a4.95 4.95 0 01-7-7z" />
            </svg>
        ),
        phone: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.02 3.07a1 1 0 01-.45 1.1l-1.48.88a11 11 0 005.93 5.93l.88-1.48a1 1 0 011.1-.45l3.07 1.02a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z" />
            </svg>
        ),
        network: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="5" r="2" />
                <circle cx="5" cy="19" r="2" />
                <circle cx="19" cy="19" r="2" />
                <path d="M12 7v4m0 0l-5.5 6M12 11l5.5 6" />
            </svg>
        ),
        activity: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 12h4l3-9 4 18 3-9h4" />
            </svg>
        ),
        ruler: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="8" width="20" height="8" rx="1" />
                <path d="M6 8v3m4-3v5m4-5v3m4-3v5" />
            </svg>
        ),
        target: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="12" cy="12" r="1" fill="currentColor" />
            </svg>
        ),
        graduation: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 3L1 9l11 6 9-4.91V17M5 13.18v4.45a2 2 0 001.17 1.83L12 22l5.83-2.54A2 2 0 0019 17.63v-4.45" />
            </svg>
        ),
        clock: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 6v6l4 2" />
            </svg>
        ),
        lightbulb: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 21h6M12 3a6 6 0 00-4 10.47V17a1 1 0 001 1h6a1 1 0 001-1v-3.53A6 6 0 0012 3z" />
            </svg>
        ),
        atom: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="2" fill="currentColor" />
                <ellipse cx="12" cy="12" rx="9" ry="4" />
                <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)" />
                <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-60 12 12)" />
            </svg>
        ),
        code: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
            </svg>
        ),
        truck: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
        ),
        waveform: (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 12h2l2-6 3 12 3-8 2 4 2-2h6" />
            </svg>
        ),
    };
    return icons[type] || <div className={className} />;
}

// Distribution definitions
const distributions = {
    // DISCRETE
    uniform: {
        type: "discrete" as const,
        name: "Discrete Uniform",
        icon: "🎲",
        example: "Rolling a fair die",
        formula: "P(X=k) = \\frac{1}{n}",
        description: "Each of the n outcomes has equal probability 1/n.",
        xLabel: "Outcome k",
        yLabel: "P(X=k)",
        points: [1, 2, 3, 4, 5, 6].map(k => ({ x: k, y: 1 / 6, label: k.toString() })),
        range: { xMin: 0, xMax: 7, yMax: 0.25 },
    },
    bernoulli: {
        type: "discrete" as const,
        name: "Bernoulli",
        icon: "🪙",
        example: "Coin flip (Heads=1, Tails=0)",
        formula: "P(X=1)=p, \\quad P(X=0)=1-p",
        description: "Binary outcome: success (1) with probability p, failure (0) with probability 1-p.",
        xLabel: "Outcome",
        yLabel: "P(X=k)",
        points: [{ x: 0, y: 0.4, label: "0" }, { x: 1, y: 0.6, label: "1" }],
        range: { xMin: -0.5, xMax: 1.5, yMax: 0.8 },
    },
    binomial: {
        type: "discrete" as const,
        name: "Binomial",
        icon: "📊",
        example: "# of heads in 10 coin flips",
        formula: "P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k}",
        description: "Number of successes in n independent Bernoulli trials.",
        xLabel: "Number of successes k",
        yLabel: "P(X=k)",
        points: Array.from({ length: 11 }, (_, k) => {
            const n = 10, p = 0.5;
            const coeff = factorial(n) / (factorial(k) * factorial(n - k));
            const prob = coeff * Math.pow(p, k) * Math.pow(1 - p, n - k);
            return { x: k, y: prob, label: k.toString() };
        }),
        range: { xMin: -0.5, xMax: 10.5, yMax: 0.3 },
    },
    poisson: {
        type: "discrete" as const,
        name: "Poisson",
        icon: "📧",
        example: "# of emails per hour",
        formula: "P(X=k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}",
        description: "Count of events in a fixed interval when events occur at constant average rate λ.",
        xLabel: "Count k",
        yLabel: "P(X=k)",
        points: Array.from({ length: 15 }, (_, k) => {
            const lambda = 4;
            const prob = (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
            return { x: k, y: prob, label: k.toString() };
        }),
        range: { xMin: -0.5, xMax: 14.5, yMax: 0.22 },
    },
    // CONTINUOUS
    normal: {
        type: "continuous" as const,
        name: "Normal (Gaussian)",
        icon: "📈",
        example: "Human heights, measurement errors",
        formula: "f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}",
        description: "The bell curve. Most values cluster around the mean μ, with spread controlled by σ.",
        xLabel: "Value x",
        yLabel: "f(x)",
        curve: (x: number) => {
            const mu = 0, sigma = 1;
            return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
        },
        range: { xMin: -4, xMax: 4, yMax: 0.45 },
    },
    exponential: {
        type: "continuous" as const,
        name: "Exponential",
        icon: "⏱️",
        example: "Wait time until next bus",
        formula: "f(x) = \\lambda e^{-\\lambda x}, \\quad x \\geq 0",
        description: "Time until next event in a Poisson process. Memoryless property.",
        xLabel: "Time x",
        yLabel: "f(x)",
        curve: (x: number) => {
            const lambda = 1;
            return x >= 0 ? lambda * Math.exp(-lambda * x) : 0;
        },
        range: { xMin: -0.5, xMax: 5, yMax: 1.1 },
    },
    uniform_cont: {
        type: "continuous" as const,
        name: "Continuous Uniform",
        icon: "▬",
        example: "Random point on a line segment",
        formula: "f(x) = \\frac{1}{b-a}, \\quad a \\leq x \\leq b",
        description: "Every value in the interval [a, b] is equally likely. Flat density.",
        xLabel: "Value x",
        yLabel: "f(x)",
        curve: (x: number) => {
            const a = 0, b = 1;
            return (x >= a && x <= b) ? 1 / (b - a) : 0;
        },
        range: { xMin: -0.5, xMax: 1.5, yMax: 1.3 },
    },
};

type DistKey = keyof typeof distributions;

// Accessible color palette (colorblind-safe: teal + indigo, high contrast)
// Tested for deuteranopia, protanopia, and tritanopia
const colors = {
    discrete: {
        primary: "bg-teal-600",
        primaryHover: "hover:bg-teal-700",
        gradient: "bg-gradient-to-r from-teal-600 to-teal-700",
        light: "bg-teal-50",
        lightHover: "hover:bg-teal-100",
        border: "border-teal-300",
        text: "text-teal-800",
        textDark: "text-teal-900",
        accent: "bg-teal-100 text-teal-700",
        bar: "#0d9488", // teal-600
    },
    continuous: {
        primary: "bg-indigo-600",
        primaryHover: "hover:bg-indigo-700",
        gradient: "bg-gradient-to-r from-indigo-600 to-indigo-700",
        light: "bg-indigo-50",
        lightHover: "hover:bg-indigo-100",
        border: "border-indigo-300",
        text: "text-indigo-800",
        textDark: "text-indigo-900",
        accent: "bg-indigo-100 text-indigo-700",
        curve: "#4f46e5", // indigo-600
        fill: "#818cf8", // indigo-400
    },
};

// Examples Modal Component
function ExamplesModal({ 
    isOpen, 
    onClose, 
    distKey, 
    distName,
    distIcon,
    colorScheme 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    distKey: string;
    distName: string;
    distIcon: string;
    colorScheme: "discrete" | "continuous";
}) {
    const examples = realWorldExamples[distKey] || [];
    const c = colors[colorScheme];
    
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                    />
                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl max-h-[85vh] overflow-hidden"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                            {/* Header */}
                            <div className={`px-8 py-5 ${c.gradient}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{distName} Distribution</h2>
                                        <p className="text-white/80 text-sm mt-1">Real-World Applications</p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="text-white/80 hover:text-white text-3xl font-light w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                            
                            {/* Examples */}
                            <div className="p-8 overflow-y-auto flex-1">
                                <div className="space-y-6">
                                    {examples.map((ex, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className={`flex gap-6 p-6 rounded-2xl border-2 ${c.light} ${c.border}`}
                                        >
                                            <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center ${c.accent}`}>
                                                <Icon type={ex.iconType} className="w-8 h-8" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`font-bold text-xl mb-1 ${c.textDark}`}>
                                                    {ex.title}
                                                </h3>
                                                <p className={`text-sm font-medium mb-3 ${c.text}`}>
                                                    {ex.description}
                                                </p>
                                                <p className="text-gray-600 text-sm leading-relaxed">
                                                    {ex.detail}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Footer */}
                            <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
                                <button
                                    onClick={onClose}
                                    className={`w-full py-3 rounded-xl font-bold text-white transition-all ${c.primary} ${c.primaryHover}`}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default function DistributionZoo() {
    const [selectedType, setSelectedType] = React.useState<"discrete" | "continuous">("discrete");
    const [selectedDist, setSelectedDist] = React.useState<DistKey>("uniform");
    const [showExamples, setShowExamples] = React.useState(false);

    const discreteDists: DistKey[] = ["uniform", "bernoulli", "binomial", "poisson"];
    const continuousDists: DistKey[] = ["normal", "exponential", "uniform_cont"];

    const currentDist = distributions[selectedDist];

    // SVG dimensions
    const width = 500, height = 280;
    const padding = { top: 20, right: 30, bottom: 50, left: 60 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const scaleX = (x: number) => {
        const { xMin, xMax } = currentDist.range;
        return padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth;
    };
    const scaleY = (y: number) => {
        const { yMax } = currentDist.range;
        return padding.top + plotHeight - (y / yMax) * plotHeight;
    };

    // Generate continuous curve path
    const getCurvePath = () => {
        if (!('curve' in currentDist)) return "";
        const { xMin, xMax } = currentDist.range;
        const steps = 200;
        const stepSize = (xMax - xMin) / steps;
        let path = "";
        for (let i = 0; i <= steps; i++) {
            const x = xMin + i * stepSize;
            const y = currentDist.curve(x);
            const px = scaleX(x);
            const py = scaleY(y);
            path += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
        }
        return path;
    };

    return (
        <SlideContainer title="Types of Distributions">
            <div className="flex flex-col items-center justify-start h-full gap-4 w-full pt-2">

                {/* Key Concept Header */}
                <div className="max-w-4xl text-center px-8">
                    <div className="text-xl text-gray-700 font-light mb-2">
                        A <span className="font-bold text-gray-900">random variable</span> can be{" "}
                        <span className="font-bold text-teal-700">Discrete</span> or{" "}
                        <span className="font-bold text-indigo-700">Continuous</span>
                    </div>
                </div>

                <div className="flex gap-6 w-full max-w-7xl flex-1 min-h-0 px-8 pb-4">

                    {/* Left: Type Selection & Distribution List */}
                    <div className="w-72 flex flex-col gap-4 flex-shrink-0">

                        {/* Type Toggle */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-lg">
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => { setSelectedType("discrete"); setSelectedDist("uniform"); }}
                                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${selectedType === "discrete"
                                        ? "bg-teal-600 text-white shadow-md"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                >
                                    Discrete
                                </button>
                                <button
                                    onClick={() => { setSelectedType("continuous"); setSelectedDist("normal"); }}
                                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${selectedType === "continuous"
                                        ? "bg-indigo-600 text-white shadow-md"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                >
                                    Continuous
                                </button>
                            </div>

                            {/* Key Difference */}
                            <div className={`p-3 rounded-lg text-sm ${selectedType === "discrete" ? "bg-teal-50 border border-teal-300" : "bg-indigo-50 border border-indigo-300"}`}>
                                {selectedType === "discrete" ? (
                                    <div className="text-teal-900">
                                        <strong>Discrete:</strong> X takes values you can <em>list</em>. We compute <InlineMath math="P(X=k)" />.
                                    </div>
                                ) : (
                                    <div className="text-indigo-900">
                                        <strong>Continuous:</strong> X takes <em>any</em> value in a range. <InlineMath math="P(X=x) = 0" /> always!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Distribution List */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-lg flex-1 overflow-y-auto">
                            <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">
                                {selectedType === "discrete" ? "Discrete Distributions" : "Continuous Distributions"}
                            </div>
                            <div className="flex flex-col gap-2">
                                {(selectedType === "discrete" ? discreteDists : continuousDists).map(key => {
                                    const dist = distributions[key];
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedDist(key)}
                                            className={`px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all flex items-center gap-3 ${selectedDist === key
                                                ? (selectedType === "discrete" ? "bg-teal-600 text-white shadow-md" : "bg-indigo-600 text-white shadow-md")
                                                : "bg-gray-50 hover:bg-gray-100 text-gray-700"}`}
                                        >
                                            <span className="text-lg">{dist.icon}</span>
                                            <div>
                                                <div className="font-bold text-sm">{dist.name}</div>
                                                <div className={`text-xs ${selectedDist === key ? "opacity-80" : "text-gray-500"}`}>{dist.example}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Visualization */}
                    <div className="flex-1 flex flex-col gap-3">

                        {/* Distribution Info */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-lg">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">{currentDist.icon}</span>
                                        <h3 className="text-xl font-bold text-gray-900">{currentDist.name}</h3>
                                        <span className={`text-xs px-2 py-1 rounded font-bold ${selectedType === "discrete" ? "bg-teal-100 text-teal-800" : "bg-indigo-100 text-indigo-800"}`}>
                                            {selectedType.toUpperCase()}
                                        </span>
                                        <button
                                            onClick={() => setShowExamples(true)}
                                            className={`ml-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                selectedType === "discrete"
                                                    ? "bg-teal-100 text-teal-800 hover:bg-teal-200"
                                                    : "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                                            }`}
                                        >
                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 6v6l4 2" />
                                                <circle cx="12" cy="12" r="9" />
                                            </svg>
                                            Real-World Examples
                                        </button>
                                    </div>
                                    <p className="text-gray-600 text-sm">{currentDist.description}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex-shrink-0">
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">
                                        {selectedType === "discrete" ? "PMF" : "PDF"}
                                    </div>
                                    <div className="text-sm"><BlockMath math={currentDist.formula} /></div>
                                </div>
                            </div>
                        </div>

                        {/* Graph */}
                        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 flex flex-col min-h-0">
                            <svg viewBox={`0 0 ${width} ${height}`} className="flex-1 w-full" style={{ overflow: 'visible' }}>
                                {/* Grid lines */}
                                {[0.25, 0.5, 0.75, 1].map(frac => {
                                    const y = scaleY(frac * currentDist.range.yMax);
                                    return (
                                        <line key={frac} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                                    );
                                })}

                                {/* X-axis */}
                                <line x1={padding.left} y1={scaleY(0)} x2={width - padding.right} y2={scaleY(0)} stroke="#374151" strokeWidth="2" />
                                {/* Y-axis */}
                                <line x1={padding.left} y1={padding.top} x2={padding.left} y2={scaleY(0)} stroke="#374151" strokeWidth="2" />

                                {/* Axis labels */}
                                <text x={width / 2} y={height - 8} textAnchor="middle" fontSize="12" fill="#4b5563" fontWeight="500">{currentDist.xLabel}</text>
                                <text x={15} y={height / 2} textAnchor="middle" transform={`rotate(-90, 15, ${height / 2})`} fontSize="12" fill="#4b5563" fontWeight="500">{currentDist.yLabel}</text>

                                {/* Discrete: bars */}
                                {'points' in currentDist && currentDist.points.map((pt, i) => {
                                    const barWidth = Math.min(30, plotWidth / currentDist.points.length - 4);
                                    const barHeight = Math.max(0, scaleY(0) - scaleY(pt.y));
                                    return (
                                        <g key={i}>
                                            <motion.rect
                                                x={scaleX(pt.x) - barWidth / 2}
                                                width={barWidth}
                                                fill="#0d9488"
                                                opacity={0.85}
                                                rx={3}
                                                initial={{ height: 0, y: scaleY(0) }}
                                                animate={{ height: barHeight, y: scaleY(pt.y) }}
                                                transition={{ delay: i * 0.03, type: "spring", stiffness: 200, damping: 20 }}
                                            />
                                            <text 
                                                x={scaleX(pt.x)} 
                                                y={scaleY(0) + 16} 
                                                textAnchor="middle" 
                                                fontSize="10" 
                                                fill="#4b5563"
                                                fontFamily="monospace"
                                            >
                                                {pt.label}
                                            </text>
                                        </g>
                                    );
                                })}

                                {/* Continuous: filled curve */}
                                {'curve' in currentDist && (
                                    <>
                                        <motion.path
                                            d={getCurvePath() + ` L ${scaleX(currentDist.range.xMax)} ${scaleY(0)} L ${scaleX(currentDist.range.xMin)} ${scaleY(0)} Z`}
                                            fill="#818cf8"
                                            opacity={0.3}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.3 }}
                                        />
                                        <motion.path
                                            d={getCurvePath()}
                                            fill="none"
                                            stroke="#4f46e5"
                                            strokeWidth="3"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                        />
                                    </>
                                )}
                            </svg>

                            {/* Key insight */}
                            <div className={`mt-2 p-3 rounded-lg text-sm ${selectedType === "discrete" ? "bg-teal-50 text-teal-900" : "bg-indigo-50 text-indigo-900"}`}>
                                {selectedType === "discrete" ? (
                                    <span>📊 <strong>Bar heights</strong> = exact probabilities. Sum of all bars = 1.</span>
                                ) : (
                                    <span>📈 <strong>Area under curve</strong> = probability. <InlineMath math="P(a < X < b) = \int_a^b f(x)\,dx" />. Total area = 1.</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Examples Modal */}
                <ExamplesModal
                    isOpen={showExamples}
                    onClose={() => setShowExamples(false)}
                    distKey={selectedDist}
                    distName={currentDist.name}
                    distIcon={currentDist.icon}
                    colorScheme={selectedType}
                />
            </div>
        </SlideContainer>
    );
}
