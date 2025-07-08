// DAMP Icon Generator & Optimizer
// Generates all required icon sizes and handles fallbacks

class DAMPIconGenerator {
    constructor(options = {}) {
        this.options = {
            sourceIcon: '/assets/images/logo/icon.png',
            fallbackIcon: '/assets/images/logo/icon-fallback.png',
            outputPath: '/assets/images/logo/',
            formats: ['png', 'webp'],
            enableFallback: true,
            enableOptimization: true,
            ...options
        };
        
        this.requiredSizes = [
            { size: 16, name: 'icon-16.png', purpose: 'favicon' },
            { size: 32, name: 'icon-32.png', purpose: 'favicon' },
            { size: 48, name: 'icon-48.png', purpose: 'favicon' },
            { size: 72, name: 'icon-72.png', purpose: 'maskable' },
            { size: 96, name: 'icon-96.png', purpose: 'maskable' },
            { size: 128, name: 'icon-128.png', purpose: 'maskable' },
            { size: 144, name: 'icon-144.png', purpose: 'maskable' },
            { size: 152, name: 'icon-152.png', purpose: 'apple-touch' },
            { size: 180, name: 'icon-180.png', purpose: 'apple-touch' },
            { size: 192, name: 'icon-192.png', purpose: 'any maskable' },
            { size: 256, name: 'icon-256.png', purpose: 'any' },
            { size: 384, name: 'icon-384.png', purpose: 'any' },
            { size: 512, name: 'icon-512.png', purpose: 'any' }
        ];
        
        this.init();
    }
    
    init() {
        this.checkExistingIcons();
        this.setupIconFallbacks();
        this.generateMissingIcons();
        this.optimizeExistingIcons();
    }
    
    // Check which icons exist and which are missing
    checkExistingIcons() {
        console.log('🔍 Checking existing icons...');
        
        this.requiredSizes.forEach(iconSpec => {
            const img = new Image();
            img.onload = () => {
                console.log(`✅ ${iconSpec.name} exists (${img.width}x${img.height})`);
                this.validateIconSize(iconSpec, img);
            };
            
            img.onerror = () => {
                console.log(`❌ ${iconSpec.name} missing - will generate`);
                this.generateIcon(iconSpec);
            };
            
            img.src = this.options.outputPath + iconSpec.name;
        });
    }
    
    // Validate icon size matches expected dimensions
    validateIconSize(iconSpec, img) {
        if (img.width !== iconSpec.size || img.height !== iconSpec.size) {
            console.warn(`⚠️ ${iconSpec.name} size mismatch: expected ${iconSpec.size}x${iconSpec.size}, got ${img.width}x${img.height}`);
            this.generateIcon(iconSpec);
        }
    }
    
    // Generate missing icons (requires server-side processing)
    generateIcon(iconSpec) {
        // This would typically be done server-side or with a build process
        // For now, we'll create a placeholder and log instructions
        
        console.log(`🎨 Need to generate: ${iconSpec.name} (${iconSpec.size}x${iconSpec.size})`);
        
        // Create a canvas-based placeholder for demonstration
        this.createPlaceholderIcon(iconSpec);
    }
    
    // Create a placeholder icon using canvas
    createPlaceholderIcon(iconSpec) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = iconSpec.size;
        canvas.height = iconSpec.size;
        
        // Create a gradient background
        const gradient = ctx.createRadialGradient(
            iconSpec.size / 2, iconSpec.size / 2, 0,
            iconSpec.size / 2, iconSpec.size / 2, iconSpec.size / 2
        );
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, iconSpec.size, iconSpec.size);
        
        // Add a water droplet shape
        this.drawWaterDroplet(ctx, iconSpec.size);
        
        // Add text for size identification
        ctx.fillStyle = 'white';
        ctx.font = `${Math.max(8, iconSpec.size / 8)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(iconSpec.size.toString(), iconSpec.size / 2, iconSpec.size - 4);
        
        // Create download link (for development)
        if (window.location.hostname === 'localhost') {
            const link = document.createElement('a');
            link.download = iconSpec.name;
            link.href = canvas.toDataURL();
            link.textContent = `Download ${iconSpec.name}`;
            link.style.display = 'block';
            link.style.margin = '5px';
            link.style.color = '#667eea';
            
            // Add to a debug container
            let debugContainer = document.getElementById('icon-debug');
            if (!debugContainer) {
                debugContainer = document.createElement('div');
                debugContainer.id = 'icon-debug';
                debugContainer.style.position = 'fixed';
                debugContainer.style.top = '10px';
                debugContainer.style.right = '10px';
                debugContainer.style.background = 'rgba(0,0,0,0.8)';
                debugContainer.style.color = 'white';
                debugContainer.style.padding = '10px';
                debugContainer.style.borderRadius = '5px';
                debugContainer.style.zIndex = '10000';
                debugContainer.style.maxHeight = '300px';
                debugContainer.style.overflow = 'auto';
                debugContainer.innerHTML = '<h4>Generated Icons:</h4>';
                document.body.appendChild(debugContainer);
            }
            
            debugContainer.appendChild(link);
        }
    }
    
    // Draw water droplet shape
    drawWaterDroplet(ctx, size) {
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size * 0.3;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - radius);
        
        // Create water droplet shape using bezier curves
        ctx.bezierCurveTo(
            centerX + radius, centerY - radius,
            centerX + radius, centerY,
            centerX, centerY + radius * 0.7
        );
        ctx.bezierCurveTo(
            centerX - radius, centerY,
            centerX - radius, centerY - radius,
            centerX, centerY - radius
        );
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
        
        // Add inner highlight
        ctx.beginPath();
        ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();
    }
    
    // Setup icon fallbacks
    setupIconFallbacks() {
        if (!this.options.enableFallback) return;
        
        // Create fallback for missing icons
        document.addEventListener('error', (event) => {
            if (event.target.tagName === 'IMG' && event.target.src.includes('/logo/icon-')) {
                this.handleIconError(event.target);
            }
        }, true);
        
        // Check all existing icon references
        document.querySelectorAll('img[src*="/logo/icon-"]').forEach(img => {
            this.setupIconFallback(img);
        });
        
        // Setup favicon fallback
        this.setupFaviconFallback();
    }
    
    // Handle icon loading errors
    handleIconError(img) {
        if (img.dataset.fallbackAttempted) return;
        
        img.dataset.fallbackAttempted = 'true';
        
        // Try fallback icon first
        if (this.options.fallbackIcon && !img.src.includes('fallback')) {
            img.src = this.options.fallbackIcon;
            return;
        }
        
        // Generate SVG fallback
        const size = this.extractSizeFromFilename(img.src) || 192;
        img.src = this.generateSVGFallback(size);
    }
    
    // Extract size from filename
    extractSizeFromFilename(src) {
        const match = src.match(/icon-(\d+)\.png/);
        return match ? parseInt(match[1]) : null;
    }
    
    // Generate SVG fallback
    generateSVGFallback(size) {
        const svg = `
            <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="grad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                    </radialGradient>
                </defs>
                <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.1}"/>
                <path d="M${size/2} ${size*0.2} Q${size*0.8} ${size*0.2} ${size*0.8} ${size/2} Q${size*0.8} ${size*0.8} ${size/2} ${size*0.9} Q${size*0.2} ${size*0.8} ${size*0.2} ${size/2} Q${size*0.2} ${size*0.2} ${size/2} ${size*0.2}Z" fill="white" opacity="0.9"/>
                <circle cx="${size*0.4}" cy="${size*0.35}" r="${size*0.05}" fill="white" opacity="0.7"/>
                <text x="${size/2}" y="${size*0.95}" text-anchor="middle" fill="white" font-family="Arial" font-size="${size*0.08}">DAMP</text>
            </svg>
        `;
        
        return 'data:image/svg+xml,' + encodeURIComponent(svg);
    }
    
    // Setup individual icon fallback
    setupIconFallback(img) {
        if (img.dataset.fallbackSetup) return;
        
        img.dataset.fallbackSetup = 'true';
        img.addEventListener('error', () => this.handleIconError(img));
    }
    
    // Setup favicon fallback
    setupFaviconFallback() {
        const favicon = document.querySelector('link[rel*="icon"]');
        if (favicon) {
            favicon.addEventListener('error', () => {
                favicon.href = this.generateSVGFallback(32);
            });
        }
    }
    
    // Optimize existing icons
    optimizeExistingIcons() {
        if (!this.options.enableOptimization) return;
        
        // Add loading optimization to all logo images
        document.querySelectorAll('img[src*="/logo/"]').forEach(img => {
            // Add loading attribute
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            
            // Add dimensions if missing
            if (!img.width || !img.height) {
                const size = this.extractSizeFromFilename(img.src) || 192;
                img.width = size;
                img.height = size;
            }
            
            // Add alt text if missing
            if (!img.alt) {
                img.alt = 'DAMP Smart Drinkware Logo';
            }
        });
    }
    
    // Generate all required icons (instructions for build process)
    generateAllIcons() {
        console.log('📝 Icon Generation Instructions:');
        console.log('=====================================');
        
        this.requiredSizes.forEach(iconSpec => {
            console.log(`${iconSpec.name} (${iconSpec.size}x${iconSpec.size}) - ${iconSpec.purpose}`);
        });
        
        console.log('\n🛠️ Recommended tools:');
        console.log('- ImageMagick: convert icon.png -resize 192x192 icon-192.png');
        console.log('- Sharp (Node.js): sharp("icon.png").resize(192, 192).png().toFile("icon-192.png")');
        console.log('- Online: https://realfavicongenerator.net/');
        
        return this.requiredSizes;
    }
    
    // Validate all icons
    validateAllIcons() {
        const results = {
            existing: [],
            missing: [],
            invalid: []
        };
        
        this.requiredSizes.forEach(iconSpec => {
            const img = new Image();
            img.onload = () => {
                if (img.width === iconSpec.size && img.height === iconSpec.size) {
                    results.existing.push(iconSpec);
                } else {
                    results.invalid.push({
                        ...iconSpec,
                        actualSize: `${img.width}x${img.height}`
                    });
                }
            };
            
            img.onerror = () => {
                results.missing.push(iconSpec);
            };
            
            img.src = this.options.outputPath + iconSpec.name;
        });
        
        return results;
    }
    
    // Create favicon links
    generateFaviconLinks() {
        const faviconSizes = [16, 32, 48, 180];
        const links = [];
        
        faviconSizes.forEach(size => {
            const link = document.createElement('link');
            link.rel = size === 180 ? 'apple-touch-icon' : 'icon';
            link.type = 'image/png';
            link.sizes = `${size}x${size}`;
            link.href = `${this.options.outputPath}icon-${size}.png`;
            
            // Add error handling
            link.addEventListener('error', () => {
                link.href = this.generateSVGFallback(size);
            });
            
            links.push(link);
            
            // Add to document head if not exists
            if (!document.querySelector(`link[sizes="${size}x${size}"]`)) {
                document.head.appendChild(link);
            }
        });
        
        return links;
    }
    
    // Get icon usage report
    getIconReport() {
        const report = {
            requiredSizes: this.requiredSizes,
            currentUsage: [],
            recommendations: []
        };
        
        // Check current usage
        document.querySelectorAll('img[src*="/logo/"], link[href*="/logo/"]').forEach(element => {
            report.currentUsage.push({
                element: element.tagName,
                src: element.src || element.href,
                size: element.sizes || `${element.width}x${element.height}`,
                purpose: element.rel || element.className
            });
        });
        
        // Generate recommendations
        if (report.currentUsage.length < this.requiredSizes.length) {
            report.recommendations.push('Generate missing icon sizes');
        }
        
        return report;
    }
}

// Auto-initialize icon generator
let dampIconGenerator;

function initIconGenerator(options = {}) {
    dampIconGenerator = new DAMPIconGenerator(options);
    window.dampIconGenerator = dampIconGenerator;
    
    // Generate favicon links
    dampIconGenerator.generateFaviconLinks();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIconGenerator);
} else {
    initIconGenerator();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPIconGenerator;
}

// Debug functions
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.generateIcons = () => {
        if (dampIconGenerator) {
            return dampIconGenerator.generateAllIcons();
        }
    };
    
    window.validateIcons = () => {
        if (dampIconGenerator) {
            return dampIconGenerator.validateAllIcons();
        }
    };
    
    window.iconReport = () => {
        if (dampIconGenerator) {
            return dampIconGenerator.getIconReport();
        }
    };
    
    console.log('🎨 Icon Generator Debug Mode');
    console.log('Available commands: generateIcons(), validateIcons(), iconReport()');
}

console.log('DAMP Icon Generator initialized'); 