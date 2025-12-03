import { test, expect } from '@playwright/test';
import fs from 'fs';

test('audit slides', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes
  
  // Ensure screenshots dir exists
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  await page.goto('/');

  const slideCount = 11; // Title, Overview, Hook, RV, PopSample, Act1, Act3, Act2, Act4, ConfidenceIntervals, Conclusion

  for (let i = 0; i < slideCount; i++) {
    console.log(`Capturing Slide ${i + 1}...`);

    // Wait for stability
    await page.waitForTimeout(1000);

    // Check for overflow
    const overflow = await page.evaluate(() => {
      // Check if any element is overflowing the viewport
      // This is a simple check, might need refinement
      return {
        vertical: document.documentElement.scrollHeight > window.innerHeight,
        horizontal: document.documentElement.scrollWidth > window.innerWidth
      };
    });

    if (overflow.vertical || overflow.horizontal) {
      console.warn(`⚠️ Slide ${i + 1} has overflow:`, overflow);
    }

    // Screenshot Base State
    await page.screenshot({ path: `screenshots/slide-${String(i + 1).padStart(2, '0')}.png` });

    // Interaction Logic

    // Slide 3: Hook (Index 2)
    if (i === 2) {
      const nextBtn = page.getByRole('button', { name: /Next Step/i });
      if (await nextBtn.isVisible()) {
        for (let step = 1; step <= 3; step++) {
          await nextBtn.click();
          await page.waitForTimeout(500);
          await page.screenshot({ path: `screenshots/slide-${i + 1}-02-step-${step}.png` });
        }
      }
    }

    // Slide 4: PopulationSample (Index 3)
    if (i === 3) {
      const sampleBtn = page.getByRole('button', { name: /Poll 20 People/i });
      if (await sampleBtn.isVisible()) {
        await sampleBtn.click();
        await page.waitForTimeout(1000); // Wait for animation
        await page.screenshot({ path: `screenshots/slide-${i + 1}-02-sampled.png` });

        // Optional: Click God Mode to verify it works visually
        const godBtn = page.getByRole('button', { name: /Reveal The Truth/i });
        if (await godBtn.isVisible()) {
          await godBtn.click();
          await page.waitForTimeout(500);
          await page.screenshot({ path: `screenshots/slide-${i + 1}-03-godmode.png` });
        }
      }
    }

    // Slide 5: RandomVariable (Index 4)
    if (i === 4) {
      const rollBtn = page.getByRole('button', { name: /Run Experiment/i });
      if (await rollBtn.isVisible()) {
        await rollBtn.click();
        await page.waitForTimeout(1000); // Wait for roll animation
        await page.screenshot({ path: `screenshots/slide-${i + 1}-02-rolled.png` });
      }
    }

    // Slide 6: Act1 - Distributions (Index 5)
    if (i === 5) {
      // Capture all discrete distributions
      const discreteDists = ['Bernoulli', 'Binomial', 'Poisson'];
      for (const dist of discreteDists) {
        const btn = page.getByRole('button', { name: new RegExp(dist, 'i') });
        if (await btn.isVisible()) {
          await btn.click();
          await page.waitForTimeout(500);
          await page.screenshot({ path: `screenshots/slide-${i + 1}-02-${dist.toLowerCase()}.png` });
        }
      }
      
      // Switch to continuous and capture those
      const contBtn = page.getByRole('button', { name: /Continuous/i });
      if (await contBtn.isVisible()) {
        await contBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `screenshots/slide-${i + 1}-03-normal.png` });
        
        const contDists = ['Exponential', 'Uniform'];
        for (const dist of contDists) {
          const btn = page.getByRole('button', { name: new RegExp(dist, 'i') });
          if (await btn.isVisible()) {
            await btn.click();
            await page.waitForTimeout(500);
            await page.screenshot({ path: `screenshots/slide-${i + 1}-04-${dist.toLowerCase()}.png` });
          }
        }
      }
    }

    // Slide 7: Act3 - Variance (Index 6)
    if (i === 6) {
      // Train preset
      const trainBtn = page.getByRole('button', { name: /Train/i });
      if (await trainBtn.isVisible()) {
        await trainBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `screenshots/slide-${i + 1}-02-train.png` });
      }
      
      // Bus preset (high variance)
      const busBtn = page.getByRole('button', { name: /Bus/i });
      if (await busBtn.isVisible()) {
        await busBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `screenshots/slide-${i + 1}-03-bus.png` });
      }
    }

    // Slide 8: Act2 - CLT (Index 7)
    if (i === 7) {
      // Run with uniform
      const runBtn = page.getByRole('button', { name: /Run/i });
      if (await runBtn.isVisible()) {
        await runBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `screenshots/slide-${i + 1}-02-uniform-running.png` });
        
        // Stop
        const stopBtn = page.getByRole('button', { name: /Pause/i });
        if (await stopBtn.isVisible()) {
          await stopBtn.click();
        }
      }
      
      // Switch to exponential
      const expBtn = page.getByRole('button', { name: /Exponential/i });
      if (await expBtn.isVisible()) {
        await expBtn.click();
        await page.waitForTimeout(500);
        
        const runBtn2 = page.getByRole('button', { name: /Run/i });
        if (await runBtn2.isVisible()) {
          await runBtn2.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: `screenshots/slide-${i + 1}-03-exponential-running.png` });
        }
      }
    }

    // Slide 9: Act4 - Sample Size & SE (Index 8)
    if (i === 8) {
      // Run with small n
      const startBtn = page.getByRole('button', { name: /Start Sampling/i });
      if (await startBtn.isVisible()) {
        await startBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `screenshots/slide-${i + 1}-02-small-n.png` });
        
        // Stop
        const stopBtn = page.getByRole('button', { name: /Stop/i });
        if (await stopBtn.isVisible()) {
          await stopBtn.click();
        }
      }
      
      // Move slider to large n and run again
      const slider = page.locator('input[type="range"]');
      if (await slider.isVisible()) {
        await slider.fill('50');
        await page.waitForTimeout(500);
        
        const resetBtn = page.getByRole('button', { name: /Reset/i });
        if (await resetBtn.isVisible()) {
          await resetBtn.click();
        }
        
        const startBtn2 = page.getByRole('button', { name: /Start Sampling/i });
        if (await startBtn2.isVisible()) {
          await startBtn2.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: `screenshots/slide-${i + 1}-03-large-n.png` });
        }
      }
    }

    // Slide 10: Confidence Intervals (Index 9)
    if (i === 9) {
      const runBtn = page.getByRole('button', { name: /Run Studies/i });
      if (await runBtn.isVisible()) {
        await runBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `screenshots/slide-${i + 1}-02-running.png` });
      }
    }

    // Navigate to next slide
    await page.keyboard.press('ArrowRight');
  }
});
