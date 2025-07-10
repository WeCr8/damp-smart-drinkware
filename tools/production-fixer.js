/**
 * DAMP Smart Drinkware - Complete Production Auto-Fix
 * Fixes all production issues identified in Lighthouse and deployment
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

class ProductionFixer {
    constructor() {
        this.websiteDir = path.join(__dirname, '../website');
        this.assetsDir = path.join(this.websiteDir, 'assets');
        this.imagesDir = path.join(this.assetsDir, 'images');
        this.fixes = [];
    }

    async fixAll() {
        console.log('🚀 DAMP Production Auto-Fix Starting...\n');
        
        try {
            // Run all fixes in parallel for speed
            await Promise.all([
                this.fixFavicon(),
                this.optimizeImages(),
                this.fixRobotsTxt(),
                this.createSitemap(),
                this.fixManifest(),
                this.optimizeHTML()
            ]);
            
            console.log('\n✅ ALL PRODUCTION FIXES COMPLETED!');
            console.log('📊 Summary of fixes:');
            this.fixes.forEach(fix => console.log(`  ✅ ${fix}`));
            
        } catch (error) {
            console.error('❌ Error during production fix:', error);
        }
    }

    async fixFavicon() {
        console.log('🔧 Fixing favicon issues...');
        
        try {
            const logoPath = path.join(this.imagesDir, 'logo/icon.png');
            const faviconPath = path.join(this.websiteDir, 'favicon.ico');
            
            // Generate proper favicon.ico (32x32)
            await sharp(logoPath)
                .resize(32, 32)
                .png()
                .toFile(faviconPath);
            
            // Generate multiple favicon sizes
            const sizes = [16, 32, 48, 64, 96, 128, 256];
            for (const size of sizes) {
                await sharp(logoPath)
                    .resize(size, size)
                    .png()
                    .toFile(path.join(this.imagesDir, `logo/favicon-${size}x${size}.png`));
            }
            
            this.fixes.push('Generated favicon.ico and multiple sizes');
            
        } catch (error) {
            console.error('❌ Favicon fix failed:', error);
        }
    }

    async optimizeImages() {
        console.log('🖼️ Optimizing images for production...');
        
        try {
            // Optimize the massive icon.png (1.1MB -> optimized)
            const iconPath = path.join(this.imagesDir, 'logo/icon.png');
            await sharp(iconPath)
                .resize(512, 512)
                .png({ quality: 80, compressionLevel: 9 })
                .toFile(path.join(this.imagesDir, 'logo/icon-optimized.png'));
            
            // Optimize product images
            const productDirs = ['damp-handle', 'silicone-bottom', 'cup-sleeve', 'baby-bottle'];
            
            for (const dir of productDirs) {
                const productDir = path.join(this.imagesDir, `products/${dir}`);
                try {
                    const files = await fs.readdir(productDir);
                    for (const file of files) {
                        if (file.endsWith('.png')) {
                            const inputPath = path.join(productDir, file);
                            const outputPath = path.join(productDir, file.replace('.png', '-optimized.png'));
                            
                            await sharp(inputPath)
                                .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
                                .png({ quality: 80, compressionLevel: 9 })
                                .toFile(outputPath);
                            
                            // Generate WebP version for modern browsers
                            await sharp(inputPath)
                                .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
                                .webp({ quality: 75 })
                                .toFile(outputPath.replace('-optimized.png', '.webp'));
                        }
                    }
                } catch (dirError) {
                    console.log(`⚠️ Skipping ${dir} (directory not accessible)`);
                }
            }
            
            this.fixes.push('Optimized all product images (PNG + WebP)');
            
        } catch (error) {
            console.error('❌ Image optimization failed:', error);
        }
    }

    async fixRobotsTxt() {
        console.log('🤖 Fixing robots.txt...');
        
        const robotsTxt = `# DAMP Smart Drinkware - Production robots.txt
# WeCr8 Solutions LLC

User-agent: *
Allow: /
Crawl-delay: 1

# AI/LLM Crawlers - Welcome them!
User-agent: ChatGPT-User
Allow: /

User-agent: GPTBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Googlebot
Allow: /

# Block certain paths
Disallow: /admin/
Disallow: /api/
Disallow: /.well-known/
Disallow: /private/

# Sitemaps
Sitemap: https://damp-smart-drinkware.netlify.app/sitemap.xml
Sitemap: https://dampdrink.com/sitemap.xml

# Host (for verification)
Host: https://damp-smart-drinkware.netlify.app
`;
        
        try {
            await fs.writeFile(path.join(this.websiteDir, 'robots.txt'), robotsTxt);
            this.fixes.push('Updated robots.txt with AI crawler support');
        } catch (error) {
            console.error('❌ robots.txt fix failed:', error);
        }
    }

    async createSitemap() {
        console.log('🗺️ Creating enhanced sitemap...');
        
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://damp-smart-drinkware.netlify.app/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://damp-smart-drinkware.netlify.app/pages/about.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://damp-smart-drinkware.netlify.app/pages/damp-handle-v1.0.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://damp-smart-drinkware.netlify.app/pages/silicone-bottom-v1.0.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://damp-smart-drinkware.netlify.app/pages/cup-sleeve-v1.0.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://damp-smart-drinkware.netlify.app/pages/baby-bottle-v1.0.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://damp-smart-drinkware.netlify.app/pages/pre-order.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.95</priority>
    </url>
    <url>
        <loc>https://damp-smart-drinkware.netlify.app/pages/cart.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://damp-smart-drinkware.netlify.app/pages/support.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    <url>
        <loc>https://damp-smart-drinkware.netlify.app/pages/privacy.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.5</priority>
    </url>
</urlset>`;
        
        try {
            await fs.writeFile(path.join(this.websiteDir, 'sitemap.xml'), sitemap);
            this.fixes.push('Created comprehensive sitemap.xml');
        } catch (error) {
            console.error('❌ Sitemap creation failed:', error);
        }
    }

    async fixManifest() {
        console.log('📱 Optimizing PWA manifest...');
        
        try {
            const manifestPath = path.join(this.websiteDir, 'manifest.json');
            const manifest = await fs.readFile(manifestPath, 'utf-8');
            const manifestData = JSON.parse(manifest);
            
            // Add performance optimizations
            manifestData.start_url = "/?utm_source=pwa";
            manifestData.orientation = "portrait";
            manifestData.categories = ["shopping", "lifestyle", "utilities"];
            
            await fs.writeFile(manifestPath, JSON.stringify(manifestData, null, 2));
            this.fixes.push('Optimized PWA manifest.json');
            
        } catch (error) {
            console.error('❌ Manifest optimization failed:', error);
        }
    }

    async optimizeHTML() {
        console.log('📄 Optimizing HTML for production...');
        
        try {
            const indexPath = path.join(this.websiteDir, 'index.html');
            let html = await fs.readFile(indexPath, 'utf-8');
            
            // Add critical performance optimizations
            const optimizations = [
                // Add resource hints
                '<link rel="preconnect" href="https://fonts.googleapis.com">',
                '<link rel="preconnect" href="https://js.stripe.com">',
                '<link rel="dns-prefetch" href="https://api.netlify.com">',
                
                // Add better favicon links
                '<link rel="icon" type="image/x-icon" href="favicon.ico">',
                '<link rel="icon" type="image/png" sizes="32x32" href="assets/images/logo/favicon-32x32.png">',
                '<link rel="icon" type="image/png" sizes="16x16" href="assets/images/logo/favicon-16x16.png">',
                '<link rel="apple-touch-icon" sizes="180x180" href="assets/images/logo/icon-optimized.png">',
            ];
            
            // Insert optimizations in head
            html = html.replace('</head>', optimizations.join('\n') + '\n</head>');
            
            await fs.writeFile(indexPath, html);
            this.fixes.push('Added performance optimizations to HTML');
            
        } catch (error) {
            console.error('❌ HTML optimization failed:', error);
        }
    }
}

// Run the production fixer
const fixer = new ProductionFixer();
fixer.fixAll().catch(console.error); 