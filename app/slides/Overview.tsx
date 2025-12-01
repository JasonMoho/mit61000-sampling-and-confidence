"use client";

import React from "react";
import SlideContainer from "../components/SlideContainer";
import { motion } from "framer-motion";

export default function Overview() {
  const concepts = [
    "Distributions & Random Variables",
    "Populations vs. Samples",
    "Variance & Standard Deviation",
    "The Central Limit Theorem",
    "Confidence Intervals"
  ];

  return (
    <SlideContainer title="Lecture Overview">
      <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto">
        <div className="flex flex-col gap-5 w-full">
          {concepts.map((concept, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex items-center gap-6 p-5 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-mono font-bold text-lg border border-teal-200">0{i + 1}</div>
              <div className="text-xl text-gray-800 font-medium tracking-wide">
                {concept}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideContainer>
  );
}
