// DAMP Smart Drinkware - Google-Level Integration Manager
// Master Coordinator for All Advanced Systems
// Copyright 2025 WeCr8 Solutions LLC

class DAMPGoogleLevelIntegration {
    constructor() {
        this.systems = {
            performance: null,
            errorBoundary: null,
            criticalPath: null,
            serviceWorker: null
        };
        
        this.systemStatus = {
            performance: 'initializing',
            errorBoundary: 'initializing',
            criticalPath: 'initializing',
            serviceWorker: 'initializing'
        };
        
        this.integrationEvents = new Map();
        this.globalMetrics = {
            systemHealth: 'good',
            overallScore: null,
            lastUpdate: Date.now()
        };
        
        this.init();
    }

    async init() {
        console.log('[DAMP Integration] Initializing Google-level integration manager...');
        
        try {
            // Wait for core systems to be available
            await this.waitForCoreSystems();
            
            // Register systems
            this.registerSystems();
            
            // Setup system coordination
            this.setupSystemCoordination();
            
            // Initialize cross-system communication
            this.initializeCommunication();
            
            // Setup unified monitoring
            this.setupUnifiedMonitoring();
            
            // Start health monitoring
            this.startHealthMonitoring();
            
            console.log('[DAMP Integration] All Google-level systems integrated successfully');
            
            // Notify that integration is complete
            this.dispatchIntegrationEvent('systems-ready', {
                systems: Object.keys(this.systems),
                status: this.systemStatus
            });
            
        } catch (error) {
            console.error('[DAMP Integration] System integration failed:', error);
            this.handleIntegrationFailure(error);
        }
    }

    // === SYSTEM REGISTRATION ===
    async waitForCoreSystems() {
        const maxWaitTime = 10000; // 10 seconds
        const checkInterval = 100; // 100ms
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWaitTime) {
            if (this.areCorSystemsReady()) {
                console.log('[DAMP Integration] Core systems detected');
                return;
            }
            await this.delay(checkInterval);
        }
        
        throw new Error('Core systems failed to initialize within timeout');
    }

    areCorSystemsReady() {
        return (
            typeof window.dampPerformance !== 'undefined' &&
            typeof window.dampErrorBoundary !== 'undefined' &&
            typeof window.dampCriticalPath !== 'undefined' &&
            'serviceWorker' in navigator
        );
    }

    registerSystems() {
        // Register performance system
        if (window.dampPerformance) {
            this.systems.performance = window.dampPerformance;
            this.systemStatus.performance = 'active';
            console.log('[DAMP Integration] Performance system registered');
        }

        // Register error boundary system
        if (window.dampErrorBoundary) {
            this.systems.errorBoundary = window.dampErrorBoundary;
            this.systemStatus.errorBoundary = 'active';
            console.log('[DAMP Integration] Error boundary system registered');
        }

        // Register critical path optimizer
        if (window.dampCriticalPath) {
            this.systems.criticalPath = window.dampCriticalPath;
            this.systemStatus.criticalPath = 'active';
            console.log('[DAMP Integration] Critical path optimizer registered');
        }

        // Check service worker
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            this.systems.serviceWorker = navigator.serviceWorker;
            this.systemStatus.serviceWorker = 'active';
            console.log('[DAMP Integration] Service worker registered');
        }
    }

    // === SYSTEM COORDINATION ===
    setupSystemCoordination() {
        // Performance <-> Error Boundary coordination
        this.coordinatePerformanceErrorBoundary();
        
        // Critical Path <-> Performance coordination
        this.coordinateCriticalPathPerformance();
        
        // Service Worker <-> All systems coordination
        this.coordinateServiceWorkerSystems();
        
        // Error Boundary <-> All systems coordination
        this.coordinateErrorBoundaryAll();
    }

    coordinatePerformanceErrorBoundary() {
        // Listen for performance issues
        window.addEventListener('damp:performance:metric', (event) => {
            const { metricName, value, status } = event.detail;
            
            if (status === 'poor' && this.systems.errorBoundary) {
                // Notify error boundary of performance issues
                this.systems.errorBoundary.handleError({
                    type: 'performance-degradation',
                    message: `Poor ${metricName} performance detected: ${value}`,
                    metric: metricName,
                    value: value,
                    timestamp: Date.now()
                });
            }
        });

        // Listen for error patterns that might affect performance
        window.addEventListener('damp:error:reported', (event) => {
            const { errorInfo, severity } = event.detail;
            
            if (severity === 'critical' && this.systems.performance) {
                // Trigger performance re-measurement after errors
                setTimeout(() => {
                    this.systems.performance.remeasurePerformance();
                }, 2000);
            }
        });
    }

    coordinateCriticalPathPerformance() {
        // Share device capabilities between systems
        if (this.systems.criticalPath && this.systems.performance) {
            const deviceCapabilities = this.systems.criticalPath.deviceCapabilities;
            
            // Adjust performance monitoring based on device capabilities
            if (deviceCapabilities?.performanceTier === 'low') {
                console.log('[DAMP Integration] Adjusting monitoring for low-performance device');
                // Could adjust monitoring frequency, thresholds, etc.
            }
        }

        // Coordinate resource loading with performance measurement
        window.addEventListener('damp:criticalpath:resource-loaded', (event) => {
            if (this.systems.performance) {
                // Track resource loading impact on performance
                this.systems.performance.trackResourceImpact(event.detail);
            }
        });
    }

    coordinateServiceWorkerSystems() {
        if (!this.systems.serviceWorker) return;

        // Setup message passing between service worker and systems
        navigator.serviceWorker.addEventListener('message', (event) => {
            this.handleServiceWorkerMessage(event.data);
        });

        // Send system status to service worker
        this.sendToServiceWorker('SYSTEM_STATUS', {
            systems: this.systemStatus,
            timestamp: Date.now()
        });
    }

    coordinateErrorBoundaryAll() {
        // Enhanced error reporting with context from all systems
        const originalHandleError = this.systems.errorBoundary?.handleError;
        
        if (originalHandleError) {
            this.systems.errorBoundary.handleError = (errorInfo) => {
                // Enrich error with system context
                const enrichedError = {
                    ...errorInfo,
                    systemContext: {
                        performanceMetrics: this.systems.performance?.getMetrics(),
                        optimizationStats: this.systems.criticalPath?.getOptimizationStats(),
                        systemHealth: this.globalMetrics.systemHealth
                    }
                };
                
                return originalHandleError.call(this.systems.errorBoundary, enrichedError);
            };
        }
    }

    // === CROSS-SYSTEM COMMUNICATION ===
    initializeCommunication() {
        // Setup broadcast channels for cross-system communication
        if ('BroadcastChannel' in window) {
            this.setupBroadcastChannels();
        }
        
        // Setup custom event system
        this.setupCustomEvents();
        
        // Setup unified API
        this.setupUnifiedAPI();
    }

    setupBroadcastChannels() {
        // Performance channel
        this.performanceChannel = new BroadcastChannel('damp-performance');
        this.performanceChannel.onmessage = (event) => {
            this.handlePerformanceMessage(event.data);
        };

        // Integration channel for system coordination
        this.integrationChannel = new BroadcastChannel('damp-integration');
        this.integrationChannel.onmessage = (event) => {
            this.handleIntegrationMessage(event.data);
        };
    }

    setupCustomEvents() {
        // Listen for system-wide events
        const systemEvents = [
            'damp:performance:metric',
            'damp:error:reported',
            'damp:criticalpath:optimized',
            'damp:system:health-change'
        ];

        systemEvents.forEach(eventType => {
            window.addEventListener(eventType, (event) => {
                this.handleSystemEvent(eventType, event.detail);
            });
        });
    }

    setupUnifiedAPI() {
        // Create unified API on window object
        window.dampSystems = {
            // Get overall system status
            getSystemStatus: () => ({
                systems: this.systemStatus,
                metrics: this.globalMetrics,
                health: this.globalMetrics.systemHealth
            }),
            
            // Get combined metrics from all systems
            getAllMetrics: () => ({
                performance: this.systems.performance?.getMetrics(),
                errors: this.systems.errorBoundary?.getErrorStats(),
                optimization: this.systems.criticalPath?.getOptimizationStats(),
                overall: this.globalMetrics
            }),
            
            // Trigger manual optimization across all systems
            optimizeAll: async () => {
                console.log('[DAMP Integration] Triggering manual optimization across all systems...');
                
                const promises = [];
                
                if (this.systems.performance?.optimizeNow) {
                    promises.push(this.systems.performance.optimizeNow());
                }
                
                if (this.systems.criticalPath?.optimizeNow) {
                    promises.push(this.systems.criticalPath.optimizeNow());
                }
                
                await Promise.allSettled(promises);
                
                // Recalculate overall score
                this.updateGlobalMetrics();
                
                console.log('[DAMP Integration] System-wide optimization complete');
            },
            
            // Reset all systems
            resetAll: () => {
                if (this.systems.errorBoundary?.clearErrorHistory) {
                    this.systems.errorBoundary.clearErrorHistory();
                }
                
                // Clear caches
                if ('caches' in window) {
                    caches.keys().then(names => {
                        names.forEach(name => caches.delete(name));
                    });
                }
                
                console.log('[DAMP Integration] All systems reset');
            },
            
            // Get performance score
            getPerformanceScore: () => {
                return this.globalMetrics.overallScore;
            },
            
            // Manual health check
            checkHealth: () => {
                return this.performHealthCheck();
            }
        };
    }

    // === UNIFIED MONITORING ===
    setupUnifiedMonitoring() {
        // Create unified dashboard data
        this.dashboardData = {
            coreWebVitals: null,
            errorRate: 0,
            optimizationLevel: 0,
            systemHealth: 'good',
            lastUpdated: Date.now()
        };

        // Update dashboard every 30 seconds
        setInterval(() => {
            this.updateDashboardData();
        }, 30000);

        // Initial update
        this.updateDashboardData();
    }

    updateDashboardData() {
        try {
            // Collect data from all systems
            const performanceData = this.systems.performance?.getMetrics();
            const errorData = this.systems.errorBoundary?.getErrorStats();
            const optimizationData = this.systems.criticalPath?.getOptimizationStats();

            // Update dashboard
            this.dashboardData = {
                coreWebVitals: performanceData?.coreWebVitals || null,
                errorRate: this.calculateErrorRate(errorData),
                optimizationLevel: this.calculateOptimizationLevel(optimizationData),
                systemHealth: this.determineSystemHealth(),
                lastUpdated: Date.now(),
                
                // Additional context
                performance: {
                    score: this.systems.performance?.getPerformanceScore(),
                    optimizations: performanceData?.optimizations?.appliedOptimizations?.length || 0
                },
                
                errors: {
                    total: errorData?.totalErrors || 0,
                    recent: errorData?.recentErrors || 0,
                    critical: errorData?.criticalErrors || 0
                },
                
                resources: {
                    critical: optimizationData?.criticalResources || 0,
                    preloaded: optimizationData?.preloadedResources || 0,
                    strategy: optimizationData?.loadingStrategy || 'unknown'
                }
            };

            // Dispatch dashboard update event
            this.dispatchIntegrationEvent('dashboard-updated', this.dashboardData);
            
        } catch (error) {
            console.error('[DAMP Integration] Dashboard update failed:', error);
        }
    }

    // === HEALTH MONITORING ===
    startHealthMonitoring() {
        // Check system health every minute
        setInterval(() => {
            this.performHealthCheck();
        }, 60000);

        // Initial health check
        setTimeout(() => {
            this.performHealthCheck();
        }, 5000); // After 5 seconds of initialization
    }

    performHealthCheck() {
        const health = {
            overall: 'good',
            systems: {},
            issues: [],
            recommendations: []
        };

        // Check each system
        Object.entries(this.systems).forEach(([systemName, system]) => {
            health.systems[systemName] = this.checkSystemHealth(systemName, system);
        });

        // Determine overall health
        const systemHealthValues = Object.values(health.systems);
        if (systemHealthValues.includes('critical')) {
            health.overall = 'critical';
        } else if (systemHealthValues.includes('warning')) {
            health.overall = 'warning';
        }

        // Check for specific issues
        this.checkForCommonIssues(health);

        // Update global metrics
        if (health.overall !== this.globalMetrics.systemHealth) {
            const previousHealth = this.globalMetrics.systemHealth;
            this.globalMetrics.systemHealth = health.overall;
            
            console.log(`[DAMP Integration] System health changed: ${previousHealth} → ${health.overall}`);
            
            this.dispatchIntegrationEvent('health-changed', {
                previous: previousHealth,
                current: health.overall,
                details: health
            });
        }

        return health;
    }

    checkSystemHealth(systemName, system) {
        switch (systemName) {
            case 'performance':
                const perfScore = system?.getPerformanceScore();
                if (perfScore === null) return 'unknown';
                if (perfScore < 50) return 'critical';
                if (perfScore < 75) return 'warning';
                return 'good';

            case 'errorBoundary':
                const errorStats = system?.getErrorStats();
                if (!errorStats) return 'unknown';
                if (errorStats.criticalErrors > 0) return 'critical';
                if (errorStats.recentErrors > 10) return 'warning';
                return 'good';

            case 'criticalPath':
                const optStats = system?.getOptimizationStats();
                if (!optStats) return 'unknown';
                if (optStats.loadingStrategy === 'conservative') return 'warning';
                return 'good';

            case 'serviceWorker':
                if (!navigator.serviceWorker.controller) return 'warning';
                return 'good';

            default:
                return 'unknown';
        }
    }

    checkForCommonIssues(health) {
        // Check for memory issues
        if (performance.memory && performance.memory.usedJSHeapSize > performance.memory.jsHeapSizeLimit * 0.9) {
            health.issues.push({
                type: 'memory',
                severity: 'warning',
                message: 'High memory usage detected'
            });
            health.recommendations.push('Consider implementing memory cleanup or reducing resource usage');
        }

        // Check for slow loading
        const perfData = this.systems.performance?.getMetrics();
        if (perfData?.coreWebVitals?.LCP > 4000) {
            health.issues.push({
                type: 'performance',
                severity: 'critical',
                message: 'Poor Largest Contentful Paint performance'
            });
            health.recommendations.push('Optimize critical resource loading and image sizes');
        }

        // Check for high error rate
        const errorData = this.systems.errorBoundary?.getErrorStats();
        if (errorData?.recentErrors > 5) {
            health.issues.push({
                type: 'errors',
                severity: 'warning',
                message: 'High error rate detected'
            });
            health.recommendations.push('Review error logs and implement additional error handling');
        }
    }

    // === UTILITY METHODS ===
    updateGlobalMetrics() {
        const performanceScore = this.systems.performance?.getPerformanceScore();
        const errorStats = this.systems.errorBoundary?.getErrorStats();
        
        // Calculate overall score (weighted average)
        let overallScore = null;
        if (performanceScore !== null) {
            let score = performanceScore;
            
            // Adjust for errors
            if (errorStats?.criticalErrors > 0) {
                score = Math.max(0, score - 20); // -20 for critical errors
            } else if (errorStats?.recentErrors > 5) {
                score = Math.max(0, score - 10); // -10 for high error rate
            }
            
            overallScore = Math.round(score);
        }
        
        this.globalMetrics.overallScore = overallScore;
        this.globalMetrics.lastUpdate = Date.now();
    }

    calculateErrorRate(errorData) {
        if (!errorData) return 0;
        
        const totalErrors = errorData.totalErrors || 0;
        const timespan = Date.now() - (Date.now() - 3600000); // 1 hour
        
        return Math.round((totalErrors / timespan) * 3600000); // Errors per hour
    }

    calculateOptimizationLevel(optimizationData) {
        if (!optimizationData) return 0;
        
        const factors = [
            optimizationData.criticalResources > 0 ? 25 : 0,
            optimizationData.preloadedResources > 0 ? 25 : 0,
            optimizationData.loadingStrategy === 'aggressive' ? 25 : 
            optimizationData.loadingStrategy === 'adaptive' ? 15 : 5,
            optimizationData.networkState?.effectiveType === '4g' ? 25 : 10
        ];
        
        return Math.round(factors.reduce((sum, factor) => sum + factor, 0));
    }

    determineSystemHealth() {
        const systemHealthValues = Object.values(this.systemStatus);
        
        if (systemHealthValues.includes('failed')) return 'critical';
        if (systemHealthValues.includes('warning')) return 'warning';
        if (systemHealthValues.every(status => status === 'active')) return 'good';
        
        return 'initializing';
    }

    // === EVENT HANDLING ===
    handleServiceWorkerMessage(data) {
        const { type, payload } = data;
        
        switch (type) {
            case 'SW_PERFORMANCE':
                this.integrateSWPerformanceData(payload);
                break;
            case 'SW_ERROR':
                this.handleSWError(payload);
                break;
            default:
                console.log('[DAMP Integration] Unknown SW message:', type);
        }
    }

    handleSystemEvent(eventType, detail) {
        // Log important system events
        if (eventType.includes('error') || eventType.includes('health-change')) {
            console.log(`[DAMP Integration] System event: ${eventType}`, detail);
        }
        
        // Update global metrics when systems change
        this.updateGlobalMetrics();
    }

    dispatchIntegrationEvent(eventName, data) {
        window.dispatchEvent(new CustomEvent(`damp:integration:${eventName}`, {
            detail: data
        }));
        
        // Also broadcast if available
        if (this.integrationChannel) {
            this.integrationChannel.postMessage({
                type: eventName,
                data: data,
                timestamp: Date.now()
            });
        }
    }

    sendToServiceWorker(type, payload) {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: type,
                payload: payload
            });
        }
    }

    handleIntegrationFailure(error) {
        console.error('[DAMP Integration] Critical integration failure:', error);
        
        // Attempt graceful degradation
        this.systemStatus = Object.fromEntries(
            Object.keys(this.systemStatus).map(key => [key, 'failed'])
        );
        
        this.globalMetrics.systemHealth = 'critical';
        
        // Dispatch failure event
        this.dispatchIntegrationEvent('integration-failure', {
            error: error.message,
            timestamp: Date.now()
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // === PUBLIC API ===
    getIntegrationStatus() {
        return {
            systems: this.systemStatus,
            metrics: this.globalMetrics,
            dashboardData: this.dashboardData,
            lastHealthCheck: this.lastHealthCheck
        };
    }
}

// Initialize the integration manager
const dampGoogleLevel = new DAMPGoogleLevelIntegration();

// Export for global access
window.dampGoogleLevel = dampGoogleLevel;

// Global developer tools
window.getDampSystemStatus = () => dampGoogleLevel.getIntegrationStatus();
window.optimizeAllDampSystems = () => window.dampSystems?.optimizeAll();
window.checkDampHealth = () => window.dampSystems?.checkHealth();

// Enhanced console logging for development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log(`
🚀 DAMP Google-Level Systems Active!

🔧 Developer Tools Available:
• window.dampSystems.getSystemStatus() - Get system status
• window.dampSystems.getAllMetrics() - Get all metrics
• window.dampSystems.optimizeAll() - Trigger optimization
• window.dampSystems.checkHealth() - Manual health check

📊 Individual System Access:
• window.dampPerformance - Performance monitoring
• window.dampErrorBoundary - Error boundary system  
• window.dampCriticalPath - Critical path optimizer
• window.dampGoogleLevel - Integration manager

💡 Quick Commands:
• getDampSystemStatus() - Overall status
• optimizeAllDampSystems() - Optimize everything
• checkDampHealth() - Health check
    `);
}

console.log('[DAMP Integration] Google-level integration manager initialized successfully'); 