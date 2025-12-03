# Slide Refinement Plan

This plan outlines the steps to polish the "Geometry of Uncertainty" slide deck for a freshman statistics lecture. We will proceed slide by slide.

## 1. Title Slide (`TitleSlide.tsx`)
**Goal:** Visually establish the theme "From Chaos to Order".
- [ ] **Animation:** Add a background particle effect where random chaotic dots slowly drift into an ordered structure (like a grid or a normal distribution).
- [ ] **Polish:** Ensure the gradient text pops against the dark background.

## 2. The Hook (`Hook.tsx`)
**Goal:** Make the "Final Exam" stakes feel real and personal.
- [ ] **Interaction:** Add a "Run Simulation" button. Instead of just showing the result, let the user click to simulate *one* morning. Will they make it?
- [ ] **Visuals:** Show a "Pass/Fail" indicator for that single run.
- [ ] **Transition:** Only reveal the full distribution curves *after* the user has tried a few single runs.

## 3. Act I: Population Distributions (`Act1.tsx`)
**Goal:** Show that raw data comes in many shapes.
- [ ] **Controls:** Add a "Clear/Reset" button to restart the simulation without changing the mode.
- [ ] **Visuals:** Ensure the "Exponential" distribution (Waiting for Bus) looks distinctively different from the Uniform one.
- [ ] **Labels:** Add a dynamic "Sample Count" counter that is clearly visible.

## 4. Act II: The Central Limit Theorem (`Act2.tsx`)
**Goal:** The "Aha!" moment. Chaos becomes Order.
- [ ] **Speed:** Add a "Fast Forward" / "Fill" button to instantly generate 2000 samples. Watching it build is good, but waiting is bad.
- [ ] **Accuracy:** Ensure the "Theoretical Normal Curve" (dashed line) scales perfectly with the histogram height.
- [ ] **Clarity:** Add a label pointing to the curve saying "The Math Predicts This".

## 5. Act III: Variance & Standard Deviation (`Act3.tsx`)
**Goal:** Explain *why* spread matters (Risk).
- [ ] **Visuals:** Improve the "dropping dots" animation. Maybe make them land on a timeline to represent "Minutes Late".
- [ ] **Context:** Explicitly label the "Train" preset as "Low Risk" and "Bus" as "High Risk".
- [ ] **Feedback:** Show the calculated Variance/SD in real-time as the dots accumulate.

## 6. Act IV: The Cost of Certainty (`Act4.tsx`)
**Goal:** The "Square Root Law" - Precision is expensive.
- [ ] **Gamification:** Add a "Target Precision" zone (e.g., "Must be within ±2").
- [ ] **Feedback:** Show a "Success Rate" based on the current sample size.
- [ ] **Visuals:** Make the "Budget" bar even more prominent. Maybe add a "$$$" counter that goes up exponentially.

## 7. Conclusion (`Conclusion.tsx`)
**Goal:** Cement the takeaways.
- [ ] **Visuals:** Add a subtle background animation that recalls the "Chaos to Order" theme.
- [ ] **Content:** Ensure the 4 points are punchy and memorable.

---

## Execution Strategy
We will tackle these one by one.
1. **Title Slide**: Implement particle system.
2. **Hook**: Add single-run simulation.
3. **Act 1**: Add Reset button.
4. **Act 2**: Add Fast Forward.
5. **Act 3**: Enhance visualization.
6. **Act 4**: Add Target Zone.
7. **Conclusion**: Final polish.
