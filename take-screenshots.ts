import { chromium, Page } from 'playwright';

// Slide order (0-indexed):
// 0: TitleSlide
// 1: Announcements
// 2: Overview
// 3: HookSlide
// 4: RandomVariable
// 5: DistributionZoo
// 6: PopulationSample
// 7: SamplingMethods
// 8: VarianceStdDev
// 9: EstimatorConvergence
// 10: DistributionShape
// 11: CentralLimitTheorem
// 12: SampleSizeEffect
// 13: ConfidenceIntervals
// 14: Conclusion

const TOTAL_SLIDES = 15;
let screenshotIndex = 1;

async function screenshot(page: Page, description: string) {
    const num = String(screenshotIndex).padStart(3, '0');
    await page.screenshot({ path: `screenshots/pdf-${num}-${description}.png`, fullPage: false });
    console.log(`📸 ${num}: ${description}`);
    screenshotIndex++;
}

async function goToSlide(page: Page, targetIndex: number, currentIndex: number): Promise<number> {
    while (currentIndex < targetIndex) {
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(300);
        currentIndex++;
    }
    while (currentIndex > targetIndex) {
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(300);
        currentIndex--;
    }
    // Wait longer for animations to complete
    await page.waitForTimeout(1500);
    return currentIndex;
}

async function takeScreenshots() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    // Slightly zoomed out (1440x900 - good balance)
    await page.setViewportSize({ width: 1440, height: 900 });
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    let currentSlide = 0;

    // ========== SLIDE 0: Title ==========
    await screenshot(page, 'title');

    // ========== SLIDE 1: Announcements ==========
    currentSlide = await goToSlide(page, 1, currentSlide);
    await page.waitForTimeout(1000); // Extra wait for animations
    await screenshot(page, 'announcements');

    // ========== SLIDE 2: Overview ==========
    currentSlide = await goToSlide(page, 2, currentSlide);
    await screenshot(page, 'overview');

    // ========== SLIDE 3: Hook - with steps ==========
    currentSlide = await goToSlide(page, 3, currentSlide);
    await screenshot(page, 'hook-step0-initial');
    
    // Step 1: Reveal σ
    const revealBtn = page.locator('button:has-text("Reveal")');
    if (await revealBtn.isVisible()) {
        await revealBtn.click();
        await page.waitForTimeout(800);
        await screenshot(page, 'hook-step1-sigma');
    }
    
    // Step 2: Show Distributions
    const showDistBtn = page.locator('button:has-text("Show Distributions")');
    if (await showDistBtn.isVisible()) {
        await showDistBtn.click();
        await page.waitForTimeout(800);
        await screenshot(page, 'hook-step2-distributions');
    }
    
    // Step 3: Show Probabilities
    const showProbBtn = page.locator('button:has-text("Show Probabilities")');
    if (await showProbBtn.isVisible()) {
        await showProbBtn.click();
        await page.waitForTimeout(800);
        await screenshot(page, 'hook-step3-probabilities');
    }

    // ========== SLIDE 4: RandomVariable ==========
    currentSlide = await goToSlide(page, 4, currentSlide);
    await screenshot(page, 'random-variable');

    // ========== SLIDE 5: DistributionZoo - all distributions ==========
    currentSlide = await goToSlide(page, 5, currentSlide);
    await screenshot(page, 'distribution-zoo-uniform');
    
    // Discrete distributions
    const discreteDists = ['Bernoulli', 'Binomial', 'Poisson'];
    for (const dist of discreteDists) {
        const distBtn = page.locator(`text="${dist}"`).first();
        if (await distBtn.isVisible()) {
            await distBtn.click();
            await page.waitForTimeout(400);
            await screenshot(page, `distribution-zoo-${dist.toLowerCase()}`);
        }
    }
    
    // Continuous distributions - click Continuous tab first
    const contTab = page.locator('button:has-text("Continuous")');
    if (await contTab.isVisible()) {
        await contTab.click();
        await page.waitForTimeout(400);
        await screenshot(page, 'distribution-zoo-normal');
        
        const continuousDists = ['Exponential', 'Continuous Uniform'];
        for (const dist of continuousDists) {
            const distBtn = page.locator(`text="${dist}"`).first();
            if (await distBtn.isVisible()) {
                await distBtn.click();
                await page.waitForTimeout(400);
                const safeName = dist.replace(/\s+/g, '-').toLowerCase();
                await screenshot(page, `distribution-zoo-${safeName}`);
            }
        }
    }

    // ========== SLIDE 6: PopulationSample ==========
    currentSlide = await goToSlide(page, 6, currentSlide);
    await screenshot(page, 'population-sample-initial');
    
    // Draw multiple samples - try different button texts
    let drawBtn = page.locator('button:has-text("Draw Sample")').first();
    if (!(await drawBtn.isVisible())) {
        drawBtn = page.locator('button:has-text("Draw")').first();
    }
    if (await drawBtn.isVisible()) {
        // Take several samples to show the process
        for (let i = 0; i < 5; i++) {
            await drawBtn.click();
            await page.waitForTimeout(600);
        }
        await screenshot(page, 'population-sample-5-draws');
        
        // Take more samples
        for (let i = 0; i < 5; i++) {
            await drawBtn.click();
            await page.waitForTimeout(600);
        }
        await screenshot(page, 'population-sample-10-draws');
    }

    // ========== SLIDE 7: SamplingMethods ==========
    currentSlide = await goToSlide(page, 7, currentSlide);
    await screenshot(page, 'sampling-methods');

    // ========== SLIDE 8: VarianceStdDev ==========
    currentSlide = await goToSlide(page, 8, currentSlide);
    await screenshot(page, 'variance-stddev');

    // ========== SLIDE 9: EstimatorConvergence ==========
    currentSlide = await goToSlide(page, 9, currentSlide);
    await screenshot(page, 'estimator-convergence-initial');
    
    const runSimBtn = page.locator('button:has-text("Run Simulation")');
    if (await runSimBtn.isVisible()) {
        await runSimBtn.click();
        await page.waitForTimeout(4000);
        await screenshot(page, 'estimator-convergence-complete');
    }

    // ========== SLIDE 10: DistributionShape ==========
    currentSlide = await goToSlide(page, 10, currentSlide);
    await screenshot(page, 'distribution-shape-initial');
    
    const runShapeBtn = page.locator('button:has-text("Run")').first();
    if (await runShapeBtn.isVisible()) {
        await runShapeBtn.click();
        await page.waitForTimeout(3000);
        await screenshot(page, 'distribution-shape-running');
    }
    
    // Skewness modal (click the first one)
    const skewBtn = page.locator('button:has-text("Skewness")').first();
    if (await skewBtn.isVisible()) {
        await skewBtn.click();
        await page.waitForTimeout(400);
        await screenshot(page, 'modal-skewness');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
    }

    // ========== SLIDE 11: CLT ==========
    currentSlide = await goToSlide(page, 11, currentSlide);
    
    // Switch to Exponential distribution
    const contTabCLT = page.locator('button:has-text("Continuous")');
    if (await contTabCLT.isVisible()) {
        await contTabCLT.click();
        await page.waitForTimeout(400);
    }
    const expBtn = page.locator('button:has-text("Exponential")');
    if (await expBtn.isVisible()) {
        await expBtn.click();
        await page.waitForTimeout(400);
    }
    
    // Set sample size to 25
    const nInput = page.locator('input[type="number"]').first();
    if (await nInput.isVisible()) {
        await nInput.fill('25');
        await page.waitForTimeout(200);
    }
    
    await screenshot(page, 'clt-initial-exp');
    
    const runCLTBtn = page.locator('button:has-text("Run")').first();
    if (await runCLTBtn.isVisible()) {
        await runCLTBtn.click();
        await page.waitForTimeout(4000);
        
        const stopBtn = page.locator('button:has-text("Stop")');
        if (await stopBtn.isVisible()) {
            await stopBtn.click();
            await page.waitForTimeout(300);
        }
        await screenshot(page, 'clt-simulation');
    }
    
    // Show CI
    const showCIBtn = page.locator('button:has-text("Show 95% CI")');
    if (await showCIBtn.isVisible()) {
        await showCIBtn.click();
        await page.waitForTimeout(400);
        await screenshot(page, 'clt-with-ci');
    }
    
    // CLT Definition modal
    const cltDefBtn = page.locator('button:has-text("What is CLT")');
    if (await cltDefBtn.isVisible()) {
        await cltDefBtn.click();
        await page.waitForTimeout(400);
        await screenshot(page, 'modal-clt-definition');
        const gotItBtn = page.locator('button:has-text("Got it")').first();
        if (await gotItBtn.isVisible()) await gotItBtn.click();
        await page.waitForTimeout(300);
    }
    
    // Misconception modal
    const misconBtn = page.locator('button:has-text("Common Misconception")');
    if (await misconBtn.isVisible()) {
        await misconBtn.click();
        await page.waitForTimeout(400);
        await screenshot(page, 'modal-clt-misconception');
        const gotItBtn = page.locator('button:has-text("Got it")').first();
        if (await gotItBtn.isVisible()) await gotItBtn.click();
        await page.waitForTimeout(300);
    }
    
    // Caveats modal
    const caveatsBtn = page.locator('button:has-text("When CLT Fails")');
    if (await caveatsBtn.isVisible()) {
        await caveatsBtn.click();
        await page.waitForTimeout(400);
        await screenshot(page, 'modal-clt-caveats');
        const understoodBtn = page.locator('button:has-text("Understood")');
        if (await understoodBtn.isVisible()) await understoodBtn.click();
        await page.waitForTimeout(300);
    }

    // ========== SLIDE 12: SampleSizeEffect ==========
    currentSlide = await goToSlide(page, 12, currentSlide);
    await screenshot(page, 'sample-size-initial');
    
    const calcCIBtn = page.locator('button:has-text("Calculate CI")');
    if (await calcCIBtn.isVisible()) {
        await calcCIBtn.click();
        await page.waitForTimeout(400);
        await screenshot(page, 'sample-size-with-ci');
    }
    
    // Different sample sizes
    const nInputSampleSize = page.locator('input[type="number"]').first();
    if (await nInputSampleSize.isVisible()) {
        await nInputSampleSize.fill('50');
        await page.waitForTimeout(200);
        const calcBtn2 = page.locator('button:has-text("Calculate CI")');
        if (await calcBtn2.isVisible()) {
            await calcBtn2.click();
            await page.waitForTimeout(400);
        }
        await screenshot(page, 'sample-size-n50');
        
        await nInputSampleSize.fill('150');
        await page.waitForTimeout(200);
        const calcBtn3 = page.locator('button:has-text("Calculate CI")');
        if (await calcBtn3.isVisible()) {
            await calcBtn3.click();
            await page.waitForTimeout(400);
        }
        await screenshot(page, 'sample-size-n150');
    }

    // ========== SLIDE 13: ConfidenceIntervals ==========
    currentSlide = await goToSlide(page, 13, currentSlide);
    await screenshot(page, 'confidence-intervals-initial');
    
    const genBtn = page.locator('button:has-text("Generate"), button:has-text("Run"), button:has-text("Start")').first();
    if (await genBtn.isVisible()) {
        await genBtn.click();
        // Wait longer for more studies (8 seconds)
        await page.waitForTimeout(8000);
        await screenshot(page, 'confidence-intervals-running');
    }

    // ========== SLIDE 14: Conclusion ==========
    currentSlide = await goToSlide(page, 14, currentSlide);
    await page.waitForTimeout(1500); // Extra wait for animation
    await screenshot(page, 'conclusion');

    await browser.close();
    
    console.log(`\n✅ Complete! ${screenshotIndex - 1} screenshots saved to screenshots/`);
    console.log('   Files are named pdf-001-*, pdf-002-*, etc. for easy PDF ordering.');
}

takeScreenshots().catch(console.error);
