"use client";

import SlideContainer from "../components/SlideContainer";

export default function SamplingMethods() {
  return (
    <SlideContainer title="Sampling: With vs Without Replacement">
      <div className="flex flex-col h-full px-16 py-8 gap-8">
        
        {/* Two columns */}
        <div className="flex-1 flex gap-12">
          
          {/* With Replacement */}
          <div className="flex-1 bg-emerald-50 rounded-2xl p-8 border-2 border-emerald-300">
            <h2 className="text-2xl font-bold text-emerald-700 mb-4 flex items-center gap-3">
              <span className="text-3xl">🔄</span> With Replacement
            </h2>
            
            <p className="text-lg text-emerald-800 mb-6">
              After selecting an item, <strong>put it back</strong> before the next draw.
            </p>
            
            <div className="bg-white rounded-xl p-5 border border-emerald-200 mb-6">
              <div className="text-sm text-emerald-600 uppercase tracking-wide mb-2 font-semibold">Examples</div>
              <ul className="text-emerald-800 space-y-2">
                <li>• Rolling a die multiple times</li>
                <li>• Slot machine spins</li>
                <li>• Flipping a coin repeatedly</li>
              </ul>
            </div>
            
            <div className="bg-emerald-100 rounded-xl p-4">
              <div className="text-sm font-bold text-emerald-700">Key property:</div>
              <div className="text-emerald-800">Each draw is <strong>independent</strong></div>
            </div>
          </div>

          {/* Without Replacement */}
          <div className="flex-1 bg-blue-50 rounded-2xl p-8 border-2 border-blue-300">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-3">
              <span className="text-3xl">❌</span> Without Replacement
            </h2>
            
            <p className="text-lg text-blue-800 mb-6">
              After selecting an item, <strong>remove it</strong> from the pool.
            </p>
            
            <div className="bg-white rounded-xl p-5 border border-blue-200 mb-6">
              <div className="text-sm text-blue-600 uppercase tracking-wide mb-2 font-semibold">Examples</div>
              <ul className="text-blue-800 space-y-2">
                <li>• Drawing cards from a deck</li>
                <li>• Lottery number drawings</li>
                <li>• Picking team members</li>
              </ul>
            </div>
            
            <div className="bg-blue-100 rounded-xl p-4">
              <div className="text-sm font-bold text-blue-700">Key property:</div>
              <div className="text-blue-800">Draws are <strong>dependent</strong></div>
            </div>
          </div>
        </div>

        {/* Bottom insight */}
        <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-300">
          <h3 className="text-xl font-bold text-purple-800 mb-1">In Practice</h3>
          <p className="text-lg text-purple-700">
            When the population is <strong>much larger</strong> than the sample (n ≪ N), 
            sampling without replacement behaves like sampling with replacement. 
            <span className="text-purple-600"> Our star catalog has N = 119,626 — sampling 50 stars is only 0.04% of the population!</span>
          </p>
        </div>
      </div>
    </SlideContainer>
  );
}
