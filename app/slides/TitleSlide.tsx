"use client";

import React from "react";
import SlideContainer from "../components/SlideContainer";
import { motion } from "framer-motion";

export default function TitleSlide() {
  return (
    <SlideContainer title="" theme="light">
      <div className="flex flex-col items-center justify-center h-full w-full max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* MIT Branding */}
          <div className="text-sm font-mono text-gray-500 mb-6 tracking-widest uppercase">
            MIT 6.1000 • Introduction to Computer Science
          </div>
          
          <h1 className="text-8xl font-bold text-black mb-6 tracking-tighter">
            Sampling & <span className="text-[#A31F34]">Confidence</span>
          </h1>
          
          <p className="text-2xl text-gray-500 mt-8">
            How do we learn about populations from samples?
          </p>
        </motion.div>
      </div>
    </SlideContainer>
  );
}
