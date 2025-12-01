"use client";

import React, { useState, useEffect } from "react";
import TitleSlide from "./slides/TitleSlide";
import Announcements from "./slides/Announcements";
import Overview from "./slides/Overview";
import HookSlide from "./slides/Hook";
import PopulationSample from "./slides/PopulationSample";
import SamplingMethods from "./slides/SamplingMethods";
import RandomVariable from "./slides/RandomVariable";
import DistributionZoo from "./slides/DistributionZoo";
import VarianceStdDev from "./slides/VarianceStdDev";
import EstimatorConvergence from "./slides/EstimatorConvergence";
import DistributionShape from "./slides/DistributionShape";
import CentralLimitTheorem from "./slides/CentralLimitTheorem";
import SampleSizeEffect from "./slides/SampleSizeEffect";
import ConfidenceIntervals from "./slides/ConfidenceIntervals";
import Conclusion from "./slides/Conclusion";

const SLIDES = [
  TitleSlide,            // 1. Title
  Announcements,         // 2. Announcements
  Overview,              // 3. Agenda
  HookSlide,             // 4. Hook: Bus vs Train
  RandomVariable,        // 5. What is a Random Variable?
  DistributionZoo,       // 6. Distribution Zoo (Normal, Uniform, etc.)
  PopulationSample,      // 7. Why Sample?
  SamplingMethods,       // 8. With vs Without Replacement
  VarianceStdDev,        // 9. Variance & Standard Deviation
  EstimatorConvergence,  // 9. Estimators Converge (x̄→μ, s→σ)
  DistributionShape,     // 10. Does Distribution Shape Matter?
  CentralLimitTheorem,   // 11. Central Limit Theorem
  SampleSizeEffect,      // 12. Sample Size & CI Width
  ConfidenceIntervals,   // 13. Confidence Intervals
  Conclusion,            // 14. Wrap up
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setCurrentSlide((prev) => Math.min(prev + 1, SLIDES.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const CurrentSlideComponent = SLIDES[currentSlide];

  return (
    <main className="w-screen h-screen bg-black text-white overflow-hidden">
      <CurrentSlideComponent />

      <div className="fixed bottom-4 right-4 text-gray-600 text-xs">
        Slide {currentSlide + 1} / {SLIDES.length}
      </div>
    </main>
  );
}
