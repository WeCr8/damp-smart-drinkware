// Google's Core Web Vitals monitoring
class DAMPPerformanceMonitor {
    constructor() {
        this.vitals = {};
        this.init();
    }

    init() {
        this.observeLCP();
        this.observeFID();
        this.observeCLS();
        this.observeNavigation();
    }

    observeLCP() {
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.vitals.lcp = lastEntry.startTime;
            this.reportVital('LCP', lastEntry.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
    }

    // ... other vital observations
} 