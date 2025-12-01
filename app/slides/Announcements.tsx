"use client";

import React from "react";
import SlideContainer from "../components/SlideContainer";
import { motion } from "framer-motion";

export default function Announcements() {
  const announcements = [
    { icon: "📝", text: "Pset 6 is due tonight at 10 pm" },
    { icon: "✅", text: "Checkoffs begin tomorrow and are due next Tuesday at 9 pm" },
    { icon: "📝", text: "Pset 7 is due Friday at 10 pm", sub: "No checkoff — the multiple choice questions on the pset page will be graded as your checkoff score" },
    { icon: "🏋️", text: "All finger exercises are due Friday at 11:59 pm", sub: "No exceptions" },
    { icon: "📊", text: "Course evaluations are open until Monday, Dec 15 at 9 am", link: "https://eduapps.mit.edu/subjeval/studenthome.htm" },
    { icon: "🚫", text: "Andrew won't have instructor office hours this Thursday" },
  ];

  return (
    <SlideContainer title="Announcements" theme="light">
      <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-8">
        <div className="flex flex-col gap-4 w-full">
          {announcements.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
              className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm"
            >
              <div className="text-2xl flex-shrink-0">{item.icon}</div>
              <div className="flex-1">
                <div className="text-lg text-gray-800 font-medium">{item.text}</div>
                {item.sub && (
                  <div className="text-sm text-gray-500 mt-1">{item.sub}</div>
                )}
                {item.link && (
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                  >
                    {item.link}
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideContainer>
  );
}
