"use client";

import React from "react";
import SlideContainer from "../components/SlideContainer";
import { motion } from "framer-motion";

export default function Conclusion() {
  const points = [
    { title: "Samples Estimate Populations", desc: "We use samples (n) to learn about populations (N) we can't fully measure." },
    { title: "Standard Error", desc: "SE = s / √n tells us how much sample means typically vary." },
    { title: "Central Limit Theorem", desc: "Sample means are approximately Normal, regardless of the population shape." },
    { title: "The √n Trade-off", desc: "To halve your error, you need 4× the sample size." },
    { title: "95% Confidence Intervals", desc: "CI = x̄ ± 2 × SE. About 95% of intervals will contain the true mean." },
  ];

  return (
    <SlideContainer title="Conclusion: Sampling & Confidence">
      <div className="flex flex-col items-center justify-start h-full max-w-4xl mx-auto pt-4 pb-8 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4 w-full">
          {points.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.3, duration: 0.4 }}
              className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100">
                {i + 1}
              </div>
              <div>
                <h3 className="text-xl font-bold text-black mb-0.5">{point.title}</h3>
                <p className="text-gray-600 text-base">{point.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="mt-6 bg-gray-100 border border-gray-200 rounded-lg px-5 py-3 text-center max-w-xl"
        >
            <div className="text-gray-600 text-sm">Lab: Apply to real astronomical data (120k stars)</div>
        </motion.div>
        
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            className="mt-4 text-gray-400 font-mono text-xs"
        >
            6.1000
        </motion.div>
      </div>
    </SlideContainer>
  );
}
