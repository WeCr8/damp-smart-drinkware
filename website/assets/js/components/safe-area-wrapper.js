/**
 * DAMP SafeAreaWrapper - Global Safe Area Management System
 * Handles device detection, orientation, and safe area calculations
 * Google Engineering Standards with comprehensive device support
 * Copyright 2025 WeCr8 Solutions LLC
 */

class DAMPSafeAreaWrapper {
    constructor() {
        this.deviceInfo = {
            isIOS: false,
            isAndroid: false,
            isDesktop: false,
            hasNotch: false,
            hasDynamicIsland: false,
            deviceType: 'unknown',
            orientation: 'portrait',
            screenSize: 'medium'
        };
        
        this.safeAreaValues = {
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px'
        };
        
        this.eventListeners = new Map();
        this.orientationChangeTimer = null;
        this.resizeDebounceTimer = null;
        
        // Initialize immediately
        this.init();
    }

    init() {
        console.log('🛡️  Initializing DAMP SafeAreaWrapper...');
        
        // Detect device and capabilities
        this.detectDevice();
        this.detectOrientation();
        this.calculateSafeAreas();
        this.applyGlobalStyles();
        this.setupEventListeners();
        this.addUtilityClasses();
        
        // Apply initial safe area values
        this.updateSafeAreaProperties();
        
        console.log('✅ SafeAreaWrapper initialized:', this.deviceInfo);
    }

    detectDevice() {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        const vendor = navigator.vendor;
        
        // iOS Detection (iPhone, iPad, iPod)
        this.deviceInfo.isIOS = /iPad|iPhone|iPod/.test(userAgent) || 
                                (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        // Android Detection
        this.deviceInfo.isAndroid = /Android/.test(userAgent);
        
        // Desktop Detection
        this.deviceInfo.isDesktop = !this.deviceInfo.isIOS && !this.deviceInfo.isAndroid;
        
        // Notch Detection (iPhone X and newer)
        this.deviceInfo.hasNotch = this.deviceInfo.isIOS && (
            window.screen.height >= 812 && window.devicePixelRatio >= 2 ||
            window.screen.width >= 812 && window.devicePixelRatio >= 2
        );
        
        // Dynamic Island Detection (iPhone 14 Pro and newer)
        this.deviceInfo.hasDynamicIsland = this.deviceInfo.isIOS && 
            window.screen.height >= 932 && window.devicePixelRatio >= 3;
        
        // Device Type Classification
        if (this.deviceInfo.isIOS) {
            if (this.deviceInfo.hasDynamicIsland) {
                this.deviceInfo.deviceType = 'ios-dynamic-island';
            } else if (this.deviceInfo.hasNotch) {
                this.deviceInfo.deviceType = 'ios-notch';
            } else {
                this.deviceInfo.deviceType = 'ios-classic';
            }
        } else if (this.deviceInfo.isAndroid) {
            this.deviceInfo.deviceType = 'android';
        } else {
            this.deviceInfo.deviceType = 'desktop';
        }
        
        // Screen Size Classification
        const width = window.innerWidth;
        if (width < 480) {
            this.deviceInfo.screenSize = 'small';
        } else if (width < 768) {
            this.deviceInfo.screenSize = 'medium';
        } else if (width < 1024) {
            this.deviceInfo.screenSize = 'large';
        } else {
            this.deviceInfo.screenSize = 'xlarge';
        }
    }

    detectOrientation() {
        // Multiple methods for orientation detection
        const screenOrientation = screen.orientation?.angle ?? 0;
        const windowRatio = window.innerWidth / window.innerHeight;
        const mediaQueryPortrait = window.matchMedia('(orientation: portrait)').matches;
        
        // Primary detection method
        if (screenOrientation === 0 || screenOrientation === 180) {
            this.deviceInfo.orientation = 'portrait';
        } else if (screenOrientation === 90 || screenOrientation === 270) {
            this.deviceInfo.orientation = 'landscape';
        } else {
            // Fallback to window dimensions
            this.deviceInfo.orientation = windowRatio < 1 ? 'portrait' : 'landscape';
        }
        
        // Cross-verify with media query
        if (mediaQueryPortrait !== (this.deviceInfo.orientation === 'portrait')) {
            console.warn('⚠️  Orientation detection mismatch, using media query result');
            this.deviceInfo.orientation = mediaQueryPortrait ? 'portrait' : 'landscape';
        }
    }

    calculateSafeAreas() {
        // Test for CSS env() support
        const testEl = document.createElement('div');
        testEl.style.cssText = 'position: absolute; top: -9999px; padding-top: env(safe-area-inset-top);';
        document.body.appendChild(testEl);
        
        const computedStyle = window.getComputedStyle(testEl);
        const hasEnvSupport = computedStyle.paddingTop !== '0px';
        
        document.body.removeChild(testEl);
        
        if (hasEnvSupport) {
            // Use CSS env() values
            this.safeAreaValues = {
                top: 'env(safe-area-inset-top)',
                right: 'env(safe-area-inset-right)',
                bottom: 'env(safe-area-inset-bottom)',
                left: 'env(safe-area-inset-left)'
            };
        } else {
            // Fallback calculations based on device type
            this.calculateFallbackSafeAreas();
        }
    }

    calculateFallbackSafeAreas() {
        let top = '0px', right = '0px', bottom = '0px', left = '0px';
        
        if (this.deviceInfo.isIOS) {
            if (this.deviceInfo.hasDynamicIsland) {
                // iPhone 14 Pro and newer
                if (this.deviceInfo.orientation === 'portrait') {
                    top = '47px';
                    bottom = '34px';
                } else {
                    top = '0px';
                    bottom = '21px';
                    left = '47px';
                    right = '47px';
                }
            } else if (this.deviceInfo.hasNotch) {
                // iPhone X series
                if (this.deviceInfo.orientation === 'portrait') {
                    top = '44px';
                    bottom = '34px';
                } else {
                    top = '0px';
                    bottom = '21px';
                    left = '44px';
                    right = '44px';
                }
            } else {
                // Classic iPhone/iPad
                if (this.deviceInfo.orientation === 'portrait') {
                    top = '20px';
                    bottom = '0px';
                } else {
                    top = '0px';
                    bottom = '0px';
                }
            }
        } else if (this.deviceInfo.isAndroid) {
            // Android safe areas (varies by manufacturer)
            if (this.deviceInfo.orientation === 'portrait') {
                top = '24px'; // Status bar
                bottom = '0px';
            } else {
                top = '0px';
                bottom = '0px';
            }
        }
        
        this.safeAreaValues = { top, right, bottom, left };
    }

    applyGlobalStyles() {
        // Remove existing safe area styles
        const existingStyle = document.getElementById('damp-safe-area-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Create comprehensive safe area CSS
        const style = document.createElement('style');
        style.id = 'damp-safe-area-styles';
        style.textContent = `
            /* DAMP Safe Area Global Styles */
            :root {
                --damp-safe-area-top: ${this.safeAreaValues.top};
                --damp-safe-area-right: ${this.safeAreaValues.right};
                --damp-safe-area-bottom: ${this.safeAreaValues.bottom};
                --damp-safe-area-left: ${this.safeAreaValues.left};
                
                /* Combined safe area values for convenience */
                --damp-safe-area-horizontal: max(${this.safeAreaValues.left}, ${this.safeAreaValues.right});
                --damp-safe-area-vertical: calc(${this.safeAreaValues.top} + ${this.safeAreaValues.bottom});
                
                /* Device-specific variables */
                --damp-device-type: '${this.deviceInfo.deviceType}';
                --damp-orientation: '${this.deviceInfo.orientation}';
                --damp-screen-size: '${this.deviceInfo.screenSize}';
            }
            
            /* Global Safe Area Utility Classes */
            .damp-safe-area {
                padding-top: var(--damp-safe-area-top);
                padding-right: var(--damp-safe-area-right);
                padding-bottom: var(--damp-safe-area-bottom);
                padding-left: var(--damp-safe-area-left);
            }
            
            .damp-safe-area-top {
                padding-top: var(--damp-safe-area-top);
            }
            
            .damp-safe-area-right {
                padding-right: var(--damp-safe-area-right);
            }
            
            .damp-safe-area-bottom {
                padding-bottom: var(--damp-safe-area-bottom);
            }
            
            .damp-safe-area-left {
                padding-left: var(--damp-safe-area-left);
            }
            
            .damp-safe-area-horizontal {
                padding-left: var(--damp-safe-area-left);
                padding-right: var(--damp-safe-area-right);
            }
            
            .damp-safe-area-vertical {
                padding-top: var(--damp-safe-area-top);
                padding-bottom: var(--damp-safe-area-bottom);
            }
            
            /* Margin variants */
            .damp-safe-margin {
                margin-top: var(--damp-safe-area-top);
                margin-right: var(--damp-safe-area-right);
                margin-bottom: var(--damp-safe-area-bottom);
                margin-left: var(--damp-safe-area-left);
            }
            
            .damp-safe-margin-top {
                margin-top: var(--damp-safe-area-top);
            }
            
            .damp-safe-margin-bottom {
                margin-bottom: var(--damp-safe-area-bottom);
            }
            
            .damp-safe-margin-horizontal {
                margin-left: var(--damp-safe-area-left);
                margin-right: var(--damp-safe-area-right);
            }
            
            .damp-safe-margin-vertical {
                margin-top: var(--damp-safe-area-top);
                margin-bottom: var(--damp-safe-area-bottom);
            }
            
            /* Container with safe area */
            .damp-container-safe {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 20px;
                padding-left: max(20px, var(--damp-safe-area-left));
                padding-right: max(20px, var(--damp-safe-area-right));
            }
            
            /* Full viewport height with safe area */
            .damp-vh-safe {
                height: 100vh;
                height: 100dvh;
                padding-top: var(--damp-safe-area-top);
                padding-bottom: var(--damp-safe-area-bottom);
            }
            
            /* Device-specific styles */
            body.damp-ios-device {
                -webkit-text-size-adjust: 100%;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                user-select: none;
            }
            
            body.damp-android-device {
                text-size-adjust: 100%;
            }
            
            body.damp-desktop-device {
                /* Desktop-specific optimizations */
            }
            
            /* Orientation-specific styles */
            body.damp-portrait {
                /* Portrait-specific styles */
            }
            
            body.damp-landscape {
                /* Landscape-specific styles */
            }
            
            body.damp-landscape.damp-ios-device {
                /* iOS landscape optimizations */
            }
            
            /* Screen size specific styles */
            body.damp-small-screen {
                font-size: 14px;
            }
            
            body.damp-medium-screen {
                font-size: 16px;
            }
            
            body.damp-large-screen {
                font-size: 16px;
            }
            
            body.damp-xlarge-screen {
                font-size: 18px;
            }
            
            /* Notch and Dynamic Island specific styles */
            body.damp-has-notch {
                /* Additional styles for notched devices */
            }
            
            body.damp-has-dynamic-island {
                /* Additional styles for Dynamic Island devices */
            }
            
            /* Responsive safe area adjustments */
            @media (orientation: landscape) and (max-height: 500px) {
                .damp-safe-area-top {
                    padding-top: max(var(--damp-safe-area-top), 10px);
                }
            }
            
            @media (orientation: portrait) and (max-width: 400px) {
                .damp-container-safe {
                    padding-left: max(15px, var(--damp-safe-area-left));
                    padding-right: max(15px, var(--damp-safe-area-right));
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    addUtilityClasses() {
        // Add device classes to body
        document.body.classList.add(
            `damp-${this.deviceInfo.deviceType}-device`,
            `damp-${this.deviceInfo.orientation}`,
            `damp-${this.deviceInfo.screenSize}-screen`
        );
        
        if (this.deviceInfo.hasNotch) {
            document.body.classList.add('damp-has-notch');
        }
        
        if (this.deviceInfo.hasDynamicIsland) {
            document.body.classList.add('damp-has-dynamic-island');
        }
        
        // Remove old classes first
        document.body.classList.remove(
            'damp-portrait', 'damp-landscape',
            'damp-small-screen', 'damp-medium-screen', 'damp-large-screen', 'damp-xlarge-screen'
        );
        
        // Add current classes
        document.body.classList.add(
            `damp-${this.deviceInfo.orientation}`,
            `damp-${this.deviceInfo.screenSize}-screen`
        );
    }

    setupEventListeners() {
        // Orientation change listener
        this.addEventListeners('orientationchange', window, () => {
            clearTimeout(this.orientationChangeTimer);
            this.orientationChangeTimer = setTimeout(() => {
                this.handleOrientationChange();
            }, 250);
        });
        
        // Resize listener with debouncing
        this.addEventListeners('resize', window, () => {
            clearTimeout(this.resizeDebounceTimer);
            this.resizeDebounceTimer = setTimeout(() => {
                this.handleResize();
            }, 150);
        });
        
        // Visual viewport changes (keyboard, etc.)
        if (window.visualViewport) {
            this.addEventListeners('resize', window.visualViewport, () => {
                this.handleVisualViewportChange();
            });
        }
        
        // Page visibility changes
        this.addEventListeners('visibilitychange', document, () => {
            if (!document.hidden) {
                // Re-calculate when page becomes visible
                setTimeout(() => {
                    this.recalculate();
                }, 100);
            }
        });
    }

    addEventListeners(event, element, handler) {
        element.addEventListener(event, handler);
        
        // Store for cleanup
        const key = `${event}_${Date.now()}_${Math.random()}`;
        this.eventListeners.set(key, { element, event, handler });
    }

    handleOrientationChange() {
        console.log('🔄 Orientation changed, recalculating safe areas...');
        
        // Re-detect orientation and recalculate
        this.detectOrientation();
        this.calculateSafeAreas();
        this.updateSafeAreaProperties();
        this.addUtilityClasses();
        
        // Dispatch custom event
        this.dispatchSafeAreaEvent('orientationchange', {
            orientation: this.deviceInfo.orientation,
            safeAreas: this.safeAreaValues
        });
    }

    handleResize() {
        const oldScreenSize = this.deviceInfo.screenSize;
        
        // Re-detect screen size
        this.detectDevice();
        
        if (oldScreenSize !== this.deviceInfo.screenSize) {
            console.log(`📱 Screen size changed: ${oldScreenSize} → ${this.deviceInfo.screenSize}`);
            this.addUtilityClasses();
            
            // Dispatch custom event
            this.dispatchSafeAreaEvent('screensize', {
                oldSize: oldScreenSize,
                newSize: this.deviceInfo.screenSize,
                dimensions: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            });
        }
    }

    handleVisualViewportChange() {
        // Handle keyboard appearance, etc.
        const viewport = window.visualViewport;
        const isKeyboardVisible = viewport.height < window.innerHeight * 0.75;
        
        document.body.classList.toggle('damp-keyboard-visible', isKeyboardVisible);
        
        this.dispatchSafeAreaEvent('viewport', {
            keyboardVisible: isKeyboardVisible,
            viewportHeight: viewport.height,
            windowHeight: window.innerHeight
        });
    }

    updateSafeAreaProperties() {
        // Update CSS custom properties
        const root = document.documentElement;
        root.style.setProperty('--damp-safe-area-top', this.safeAreaValues.top);
        root.style.setProperty('--damp-safe-area-right', this.safeAreaValues.right);
        root.style.setProperty('--damp-safe-area-bottom', this.safeAreaValues.bottom);
        root.style.setProperty('--damp-safe-area-left', this.safeAreaValues.left);
        
        // Update combined values
        const horizontal = `max(${this.safeAreaValues.left}, ${this.safeAreaValues.right})`;
        const vertical = `calc(${this.safeAreaValues.top} + ${this.safeAreaValues.bottom})`;
        root.style.setProperty('--damp-safe-area-horizontal', horizontal);
        root.style.setProperty('--damp-safe-area-vertical', vertical);
        
        // Update device info
        root.style.setProperty('--damp-device-type', `'${this.deviceInfo.deviceType}'`);
        root.style.setProperty('--damp-orientation', `'${this.deviceInfo.orientation}'`);
        root.style.setProperty('--damp-screen-size', `'${this.deviceInfo.screenSize}'`);
    }

    recalculate() {
        console.log('🔄 Recalculating safe areas...');
        this.detectDevice();
        this.detectOrientation();
        this.calculateSafeAreas();
        this.updateSafeAreaProperties();
        this.addUtilityClasses();
        this.applyGlobalStyles();
    }

    dispatchSafeAreaEvent(type, data) {
        const event = new CustomEvent(`damp:safearea:${type}`, {
            detail: { ...data, deviceInfo: this.deviceInfo }
        });
        window.dispatchEvent(event);
    }

    // Public API methods
    getSafeAreaValue(side) {
        return this.safeAreaValues[side] || '0px';
    }

    getDeviceInfo() {
        return { ...this.deviceInfo };
    }

    isDevice(type) {
        switch (type.toLowerCase()) {
            case 'ios': return this.deviceInfo.isIOS;
            case 'android': return this.deviceInfo.isAndroid;
            case 'desktop': return this.deviceInfo.isDesktop;
            case 'mobile': return this.deviceInfo.isIOS || this.deviceInfo.isAndroid;
            default: return false;
        }
    }

    isOrientation(orientation) {
        return this.deviceInfo.orientation === orientation.toLowerCase();
    }

    isScreenSize(size) {
        return this.deviceInfo.screenSize === size.toLowerCase();
    }

    hasFeature(feature) {
        switch (feature.toLowerCase()) {
            case 'notch': return this.deviceInfo.hasNotch;
            case 'dynamicisland': return this.deviceInfo.hasDynamicIsland;
            default: return false;
        }
    }

    // Cleanup method
    destroy() {
        // Clear timers
        clearTimeout(this.orientationChangeTimer);
        clearTimeout(this.resizeDebounceTimer);
        
        // Remove event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners.clear();
        
        // Remove styles
        const style = document.getElementById('damp-safe-area-styles');
        if (style) {
            style.remove();
        }
        
        // Remove body classes
        document.body.classList.remove(
            `damp-${this.deviceInfo.deviceType}-device`,
            `damp-${this.deviceInfo.orientation}`,
            `damp-${this.deviceInfo.screenSize}-screen`,
            'damp-has-notch',
            'damp-has-dynamic-island',
            'damp-keyboard-visible'
        );
        
        console.log('🗑️  SafeAreaWrapper destroyed');
    }
}

// Global instance
let dampSafeAreaWrapper = null;

// Initialize function
function initDAMPSafeAreaWrapper() {
    if (dampSafeAreaWrapper) {
        dampSafeAreaWrapper.destroy();
    }
    
    dampSafeAreaWrapper = new DAMPSafeAreaWrapper();
    
    // Make it globally accessible
    window.dampSafeArea = dampSafeAreaWrapper;
    
    return dampSafeAreaWrapper;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDAMPSafeAreaWrapper);
} else {
    initDAMPSafeAreaWrapper();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DAMPSafeAreaWrapper, initDAMPSafeAreaWrapper };
}

// Debug function for development
window.debugSafeArea = function() {
    if (window.dampSafeArea) {
        console.log('🛡️  DAMP SafeArea Debug:', {
            deviceInfo: window.dampSafeArea.getDeviceInfo(),
            safeAreas: {
                top: window.dampSafeArea.getSafeAreaValue('top'),
                right: window.dampSafeArea.getSafeAreaValue('right'),
                bottom: window.dampSafeArea.getSafeAreaValue('bottom'),
                left: window.dampSafeArea.getSafeAreaValue('left')
            },
            cssVariables: {
                '--damp-safe-area-top': getComputedStyle(document.documentElement).getPropertyValue('--damp-safe-area-top'),
                '--damp-safe-area-right': getComputedStyle(document.documentElement).getPropertyValue('--damp-safe-area-right'),
                '--damp-safe-area-bottom': getComputedStyle(document.documentElement).getPropertyValue('--damp-safe-area-bottom'),
                '--damp-safe-area-left': getComputedStyle(document.documentElement).getPropertyValue('--damp-safe-area-left')
            }
        });
    }
};

console.log('🛡️  DAMP SafeAreaWrapper loaded'); 