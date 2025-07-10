/**
 * DAMP Smart Drinkware - Automated Lighthouse CI
 * Runs comprehensive performance audits
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

async function runLighthouseAudit() {
    const chrome = await chromeLauncher.launch({
        chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
    });
    
    const options = {
        logLevel: 'info',
        output: 'html',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        port: chrome.port,
    };
    
    const urls = [
        'http://localhost:3000',
        'http://localhost:3000/pages/cart.html',
        'http://localhost:3000/pages/damp-handle-v1.0.html',
        'http://localhost:3000/pages/pre-order.html'
    ];
    
    const results = [];
    
    // Create reports directory
    const reportsDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir);
    }
    
    for (const url of urls) {
        console.log(`🔍 Auditing: ${url}`);
        
        const runnerResult = await lighthouse(url, options);
        
        // Save individual report
        const filename = url.split('/').pop() || 'index';
        const reportPath = path.join(reportsDir, `lighthouse-${filename}.html`);
        fs.writeFileSync(reportPath, runnerResult.report);
        
        // Extract key metrics
        const { lhr } = runnerResult;
        const metrics = {
            url: url,
            performance: lhr.categories.performance.score * 100,
            accessibility: lhr.categories.accessibility.score * 100,
            bestPractices: lhr.categories['best-practices'].score * 100,
            seo: lhr.categories.seo.score * 100,
            firstContentfulPaint: lhr.audits['first-contentful-paint'].displayValue,
            speedIndex: lhr.audits['speed-index'].displayValue,
            largestContentfulPaint: lhr.audits['largest-contentful-paint'].displayValue,
            interactive: lhr.audits['interactive'].displayValue,
            cumulativeLayoutShift: lhr.audits['cumulative-layout-shift'].displayValue,
            totalBlockingTime: lhr.audits['total-blocking-time'].displayValue
        };
        
        results.push(metrics);
        
        console.log(`✅ Performance: ${metrics.performance}%`);
        console.log(`✅ Accessibility: ${metrics.accessibility}%`);
        console.log(`✅ Best Practices: ${metrics.bestPractices}%`);
        console.log(`✅ SEO: ${metrics.seo}%`);
        console.log(`📊 Report saved: ${reportPath}\n`);
    }
    
    await chrome.kill();
    
    // Generate summary report
    const summaryPath = path.join(reportsDir, 'lighthouse-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));
    
    console.log('🎉 Lighthouse audit completed!');
    console.log(`📊 Summary saved: ${summaryPath}`);
    
    return results;
}

// Run if called directly
if (require.main === module) {
    runLighthouseAudit().catch(console.error);
}

module.exports = { runLighthouseAudit }; 