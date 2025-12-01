"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface SlideContainerProps {
  children: React.ReactNode;
  title?: string;
  theme?: "light" | "dark";
}

export default function SlideContainer({ children, title, theme = "light" }: SlideContainerProps) {
  const isLight = theme === "light";
  
  return (
    <div className={`w-screen h-screen overflow-hidden flex flex-col relative ${isLight ? "bg-white text-black" : "bg-black text-white"}`}>
      {/* Header */}
      <div className={`absolute top-0 left-0 w-full p-8 flex justify-between items-center z-10 ${isLight ? "opacity-100" : "opacity-50"}`}>
        <h1 className={`text-xl font-mono ${isLight ? "text-gray-500" : "text-gray-400"}`}>MIT 6.1000: Sampling & Confidence</h1>
        {title && <h2 className={`text-xl font-bold ${isLight ? "text-black" : "text-white"}`}>{title}</h2>}
      </div>

      {/* Main Content Area - Added flex-1 and min-h-0 to ensure children can scroll/shrink properly */}
      <div className="flex-1 w-full h-full min-h-0 pt-20">
        {children}
      </div>

      {/* Footer / Progress */}
      <div className={`absolute bottom-0 left-0 w-full h-1 ${isLight ? "bg-gray-200" : "bg-gray-800"}`}>
        {/* Progress bar could go here */}
      </div>
    </div>
  );
}
