#!/usr/bin/env node

/**
 * PWA Validator - Google Engineering Standards
 * Validates PWA implementation compliance
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// PWA Requirements Checklist (Google Standards)
const PWA_REQUIREMENTS = {
    manifest: {
        name: 'Web app manifest with name property',
        required: true,
        check: (manifest) => manifest.name && manifest.name.length > 0
    },
    shortName: {
        name: 'Web app manifest with short_name (≤12 chars)',
        required: true,
        check: (manifest) => manifest.short_name && manifest.short_name.length <= 12
    },
    startUrl: {
        name: 'Web app manifest with start_url',
        required: true,
        check: (manifest) => manifest.start_url
    },
    display: {
        name: 'Web app manifest with display mode',
        required: true,
        check: (manifest) => ['standalone', 'fullscreen', 'minimal-ui'].includes(manifest.display)
    },
    icons192: {
        name: 'Web app manifest with 192px icon',
        required: true,
        check: (manifest) => manifest.icons && manifest.icons.some(icon => 
            icon.sizes && icon.sizes.includes('192x192'))
    },
    icons512: {
        name: 'Web app manifest with 512px icon',
        required: true,
        check: (manifest) => manifest.icons && manifest.icons.some(icon => 
            icon.sizes && icon.sizes.includes('512x512'))
    },
    maskableIcons: {
        name: 'Maskable icons for adaptive icon support',
        required: false,
        check: (manifest) => manifest.icons && manifest.icons.some(icon => 
            icon.purpose && icon.purpose.includes('maskable'))
    },
    themeColor: {
        name: 'Theme color specified',
        required: true,
        check: (manifest) => manifest.theme_color
    },
    backgroundColor: {
        name: 'Background color specified',
        required: true,
        check: (manifest) => manifest.background_color
    },
    scope: {
        name: 'Scope specified',
        required: false,
        check: (manifest) => manifest.scope
    },
    categories: {
        name: 'Categories specified for app store listing',
        required: false,
        check: (manifest) => manifest.categories && Array.isArray(manifest.categories)
    },
    screenshots: {
        name: 'Screenshots for app store listing',
        required: false,
        check: (manifest) => manifest.screenshots && Array.isArray(manifest.screenshots)
    },
    shortcuts: {
        name: 'App shortcuts for quick actions',
        required: false,
        check: (manifest) => manifest.shortcuts && Array.isArray(manifest.shortcuts)
    }
};

// Service Worker Requirements
const SW_REQUIREMENTS = {
    registration: {
        name: 'Service Worker registration',
        required: true,
        check: (content) => content.includes('serviceWorker.register')
    },
    scope: {
        name: 'Service Worker scope configuration',
        required: true,
        check: (content) => content.includes('scope:')
    },
    updateHandling: {
        name: 'Service Worker update handling',
        required: true,
        check: (content) => content.includes('updatefound') || content.includes('statechange')
    },
    caching: {
        name: 'Service Worker caching strategy',
        required: true,
        check: (swContent) => swContent.includes('caches.open') && swContent.includes('cache.put')
    },
    offline: {
        name: 'Offline support implementation',
        required: true,
        check: (swContent) => swContent.includes('offline') || swContent.includes('NetworkError')
    }
};

// HTML Meta Tag Requirements
const HTML_REQUIREMENTS = {
    viewport: {
        name: 'Viewport meta tag',
        required: true,
        check: (content) => content.includes('name="viewport"')
    },
    manifestLink: {
        name: 'Manifest link tag',
        required: true,
        check: (content) => content.includes('rel="manifest"')
    },
    appleWebApp: {
        name: 'Apple web app meta tags',
        required: true,
        check: (content) => content.includes('apple-mobile-web-app-capable')
    },
    themeColorMeta: {
        name: 'Theme color meta tag',
        required: true,
        check: (content) => content.includes('name="theme-color"')
    },
    appleTouchIcon: {
        name: 'Apple touch icons',
        required: true,
        check: (content) => content.includes('apple-touch-icon')
    },
    msApplication: {
        name: 'Microsoft application meta tags',
        required: false,
        check: (content) => content.includes('msapplication')
    }
};

class PWAValidator {
    constructor() {
        this.results = {
            manifest: {},
            serviceWorker: {},
            html: {},
            icons: {},
            overall: { score: 0, maxScore: 0, passed: false }
        };
        this.websiteDir = path.join(__dirname, '../website');
    }

    async validate() {
        console.log('🔍 Starting PWA validation...');
        console.log('━'.repeat(60));

        try {
            // Validate manifest
            await this.validateManifest();
            
            // Validate service worker
            await this.validateServiceWorker();
            
            // Validate HTML pages
            await this.validateHTMLPages();
            
            // Validate icons
            await this.validateIcons();
            
            // Calculate overall score
            this.calculateOverallScore();
            
            // Generate report
            this.generateReport();
            
            return this.results;
            
        } catch (error) {
            console.error('❌ PWA validation failed:', error);
            return null;
        }
    }

    async validateManifest() {
        console.log('📱 Validating Web App Manifest...');
        
        try {
            const manifestPath = path.join(this.websiteDir, 'manifest.json');
            const manifestContent = await fs.readFile(manifestPath, 'utf8');
            const manifest = JSON.parse(manifestContent);
            
            for (const [key, requirement] of Object.entries(PWA_REQUIREMENTS)) {
                const passed = requirement.check(manifest);
                this.results.manifest[key] = {
                    name: requirement.name,
                    required: requirement.required,
                    passed,
                    points: passed ? (requirement.required ? 10 : 5) : 0,
                    maxPoints: requirement.required ? 10 : 5
                };
                
                const icon = passed ? '✅' : '❌';
                const req = requirement.required ? '[REQUIRED]' : '[OPTIONAL]';
                console.log(`  ${icon} ${requirement.name} ${req}`);
            }
            
        } catch (error) {
            console.error('❌ Manifest validation failed:', error.message);
            for (const key of Object.keys(PWA_REQUIREMENTS)) {
                this.results.manifest[key] = {
                    passed: false,
                    points: 0,
                    maxPoints: PWA_REQUIREMENTS[key].required ? 10 : 5
                };
            }
        }
    }

    async validateServiceWorker() {
        console.log('⚙️ Validating Service Worker...');
        
        try {
            const swPath = path.join(this.websiteDir, 'sw.js');
            const swContent = await fs.readFile(swPath, 'utf8');
            
            // Also check HTML files for SW registration
            const indexPath = path.join(this.websiteDir, 'index.html');
            const htmlContent = await fs.readFile(indexPath, 'utf8');
            
            for (const [key, requirement] of Object.entries(SW_REQUIREMENTS)) {
                let passed = false;
                
                if (key === 'caching' || key === 'offline') {
                    passed = requirement.check(swContent);
                } else {
                    passed = requirement.check(htmlContent);
                }
                
                this.results.serviceWorker[key] = {
                    name: requirement.name,
                    required: requirement.required,
                    passed,
                    points: passed ? (requirement.required ? 15 : 8) : 0,
                    maxPoints: requirement.required ? 15 : 8
                };
                
                const icon = passed ? '✅' : '❌';
                const req = requirement.required ? '[REQUIRED]' : '[OPTIONAL]';
                console.log(`  ${icon} ${requirement.name} ${req}`);
            }
            
        } catch (error) {
            console.error('❌ Service Worker validation failed:', error.message);
            for (const key of Object.keys(SW_REQUIREMENTS)) {
                this.results.serviceWorker[key] = {
                    passed: false,
                    points: 0,
                    maxPoints: SW_REQUIREMENTS[key].required ? 15 : 8
                };
            }
        }
    }

    async validateHTMLPages() {
        console.log('📄 Validating HTML Pages...');
        
        try {
            const indexPath = path.join(this.websiteDir, 'index.html');
            const htmlContent = await fs.readFile(indexPath, 'utf8');
            
            for (const [key, requirement] of Object.entries(HTML_REQUIREMENTS)) {
                const passed = requirement.check(htmlContent);
                
                this.results.html[key] = {
                    name: requirement.name,
                    required: requirement.required,
                    passed,
                    points: passed ? (requirement.required ? 8 : 4) : 0,
                    maxPoints: requirement.required ? 8 : 4
                };
                
                const icon = passed ? '✅' : '❌';
                const req = requirement.required ? '[REQUIRED]' : '[OPTIONAL]';
                console.log(`  ${icon} ${requirement.name} ${req}`);
            }
            
        } catch (error) {
            console.error('❌ HTML validation failed:', error.message);
            for (const key of Object.keys(HTML_REQUIREMENTS)) {
                this.results.html[key] = {
                    passed: false,
                    points: 0,
                    maxPoints: HTML_REQUIREMENTS[key].required ? 8 : 4
                };
            }
        }
    }

    async validateIcons() {
        console.log('🎨 Validating PWA Icons...');
        
        const requiredIcons = [
            { size: '16x16', path: 'favicon-16x16.png' },
            { size: '32x32', path: 'favicon-32x32.png' },
            { size: '192x192', path: 'icon-192.png', required: true },
            { size: '512x512', path: 'icon-512.png', required: true },
            { size: '72x72', path: 'icon-72.png', maskable: true },
            { size: '96x96', path: 'icon-96.png', maskable: true },
            { size: '144x144', path: 'icon-144.png', maskable: true }
        ];
        
        const logoDir = path.join(this.websiteDir, 'assets', 'images', 'logo');
        
        for (const icon of requiredIcons) {
            const iconPath = path.join(logoDir, icon.path);
            
            try {
                await fs.access(iconPath);
                const passed = true;
                
                this.results.icons[icon.size] = {
                    name: `Icon ${icon.size}${icon.maskable ? ' (maskable)' : ''}`,
                    required: icon.required || false,
                    passed,
                    points: passed ? (icon.required ? 5 : 3) : 0,
                    maxPoints: icon.required ? 5 : 3
                };
                
                console.log(`  ✅ Icon ${icon.size} exists`);
                
            } catch (error) {
                const passed = false;
                
                this.results.icons[icon.size] = {
                    name: `Icon ${icon.size}${icon.maskable ? ' (maskable)' : ''}`,
                    required: icon.required || false,
                    passed,
                    points: 0,
                    maxPoints: icon.required ? 5 : 3
                };
                
                const req = icon.required ? '[REQUIRED]' : '[OPTIONAL]';
                console.log(`  ❌ Icon ${icon.size} missing ${req}`);
            }
        }
    }

    calculateOverallScore() {
        let totalPoints = 0;
        let maxPoints = 0;
        
        // Sum all categories
        for (const category of ['manifest', 'serviceWorker', 'html', 'icons']) {
            for (const result of Object.values(this.results[category])) {
                totalPoints += result.points || 0;
                maxPoints += result.maxPoints || 0;
            }
        }
        
        const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
        const passed = score >= 85; // Google recommends 85%+ for PWA
        
        this.results.overall = {
            score,
            totalPoints,
            maxPoints,
            passed,
            grade: this.getGrade(score)
        };
    }

    getGrade(score) {
        if (score >= 95) return 'A+';
        if (score >= 90) return 'A';
        if (score >= 85) return 'B+';
        if (score >= 80) return 'B';
        if (score >= 75) return 'C+';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    generateReport() {
        console.log('\n' + '═'.repeat(60));
        console.log('📊 PWA VALIDATION REPORT');
        console.log('═'.repeat(60));
        
        const { score, totalPoints, maxPoints, passed, grade } = this.results.overall;
        
        console.log(`\n🎯 OVERALL SCORE: ${score}% (${grade})`);
        console.log(`📈 Points: ${totalPoints}/${maxPoints}`);
        console.log(`✅ PWA Ready: ${passed ? 'YES' : 'NO'}`);
        
        if (passed) {
            console.log('\n🎉 Congratulations! Your PWA meets Google standards and is ready for production.');
        } else {
            console.log('\n⚠️ Your PWA needs improvements to meet Google standards.');
            console.log('Focus on fixing REQUIRED items first.');
        }
        
        // Category breakdown
        console.log('\n📋 CATEGORY BREAKDOWN:');
        
        const categories = [
            { name: 'Web App Manifest', key: 'manifest', icon: '📱' },
            { name: 'Service Worker', key: 'serviceWorker', icon: '⚙️' },
            { name: 'HTML Meta Tags', key: 'html', icon: '📄' },
            { name: 'PWA Icons', key: 'icons', icon: '🎨' }
        ];
        
        for (const category of categories) {
            const results = Object.values(this.results[category.key]);
            const categoryPoints = results.reduce((sum, r) => sum + (r.points || 0), 0);
            const categoryMax = results.reduce((sum, r) => sum + (r.maxPoints || 0), 0);
            const categoryScore = categoryMax > 0 ? Math.round((categoryPoints / categoryMax) * 100) : 0;
            
            console.log(`${category.icon} ${category.name}: ${categoryScore}% (${categoryPoints}/${categoryMax})`);
        }
        
        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:');
        
        const failedRequired = [];
        const failedOptional = [];
        
        for (const category of ['manifest', 'serviceWorker', 'html', 'icons']) {
            for (const [key, result] of Object.entries(this.results[category])) {
                if (!result.passed) {
                    if (result.required) {
                        failedRequired.push(`❗ ${result.name}`);
                    } else {
                        failedOptional.push(`💡 ${result.name}`);
                    }
                }
            }
        }
        
        if (failedRequired.length > 0) {
            console.log('\n🚨 CRITICAL (Fix These First):');
            failedRequired.forEach(item => console.log(`  ${item}`));
        }
        
        if (failedOptional.length > 0) {
            console.log('\n📈 IMPROVEMENTS (Optional):');
            failedOptional.forEach(item => console.log(`  ${item}`));
        }
        
        if (failedRequired.length === 0 && failedOptional.length === 0) {
            console.log('✨ All checks passed! Your PWA is fully optimized.');
        }
        
        console.log('\n🔗 Next Steps:');
        console.log('  1. Test your PWA with Chrome DevTools (Application > Manifest)');
        console.log('  2. Run Lighthouse PWA audit for detailed analysis');
        console.log('  3. Test installation on mobile devices');
        console.log('  4. Verify offline functionality');
        
        console.log('\n' + '═'.repeat(60));
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new PWAValidator();
    validator.validate().then(results => {
        if (results && results.overall.passed) {
            process.exit(0); // Success
        } else {
            process.exit(1); // Failure
        }
    });
}

module.exports = { PWAValidator }; 