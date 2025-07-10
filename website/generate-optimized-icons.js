/**
 * Generate optimized icons for all platforms
 * Creates multiple sizes and formats for maximum compatibility
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

class IconGenerator {
    constructor() {
        this.sourceIcon = path.join(__dirname, 'assets/images/logo/icon.png');
        this.logoDir = path.join(__dirname, 'assets/images/logo');
        this.rootDir = __dirname;
    }

    async generateAllIcons() {
        console.log('🎨 Generating optimized icons...');
        
        try {
            // Generate favicon sizes
            await this.generateFavicons();
            
            // Generate app icons
            await this.generateAppIcons();
            
            // Generate logo variants
            await this.generateLogoVariants();
            
            // Update manifest.json
            await this.updateManifest();
            
            console.log('✅ All icons generated successfully!');
            
        } catch (error) {
            console.error('❌ Error generating icons:', error);
        }
    }

    async generateFavicons() {
        const sizes = [16, 32, 48, 64, 128];
        
        for (const size of sizes) {
            await sharp(this.sourceIcon)
                .resize(size, size)
                .png({ quality: 90, compressionLevel: 9 })
                .toFile(path.join(this.logoDir, `favicon-${size}x${size}.png`));
        }
        
        // Generate favicon.ico (multi-size)
        await sharp(this.sourceIcon)
            .resize(32, 32)
            .png({ quality: 90, compressionLevel: 9 })
            .toFile(path.join(this.logoDir, 'favicon.ico'));
            
        // Copy to root
        await fs.copyFile(
            path.join(this.logoDir, 'favicon.ico'),
            path.join(this.rootDir, 'favicon.ico')
        );
    }

    async generateAppIcons() {
        const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
        
        for (const size of sizes) {
            await sharp(this.sourceIcon)
                .resize(size, size)
                .png({ quality: 90, compressionLevel: 9 })
                .toFile(path.join(this.logoDir, `icon-${size}x${size}.png`));
        }
    }

    async generateLogoVariants() {
        // Optimized logo for navigation (32x32, ~5KB)
        await sharp(this.sourceIcon)
            .resize(32, 32)
            .png({ quality: 90, compressionLevel: 9 })
            .toFile(path.join(this.logoDir, 'logo-nav.png'));
            
        // Medium logo for headers (64x64, ~10KB)
        await sharp(this.sourceIcon)
            .resize(64, 64)
            .png({ quality: 90, compressionLevel: 9 })
            .toFile(path.join(this.logoDir, 'logo-header.png'));
            
        // Large logo for hero sections (128x128, ~20KB)
        await sharp(this.sourceIcon)
            .resize(128, 128)
            .png({ quality: 90, compressionLevel: 9 })
            .toFile(path.join(this.logoDir, 'logo-hero.png'));

        // WebP versions for modern browsers
        await sharp(this.sourceIcon)
            .resize(32, 32)
            .webp({ quality: 90 })
            .toFile(path.join(this.logoDir, 'logo-nav.webp'));
    }

    async updateManifest() {
        const manifestPath = path.join(this.rootDir, 'manifest.json');
        const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
        
        manifest.icons = [
            {
                "src": "assets/images/logo/icon-72x72.png",
                "sizes": "72x72",
                "type": "image/png"
            },
            {
                "src": "assets/images/logo/icon-96x96.png",
                "sizes": "96x96",
                "type": "image/png"
            },
            {
                "src": "assets/images/logo/icon-128x128.png",
                "sizes": "128x128",
                "type": "image/png"
            },
            {
                "src": "assets/images/logo/icon-144x144.png",
                "sizes": "144x144",
                "type": "image/png"
            },
            {
                "src": "assets/images/logo/icon-152x152.png",
                "sizes": "152x152",
                "type": "image/png"
            },
            {
                "src": "assets/images/logo/icon-192x192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "assets/images/logo/icon-384x384.png",
                "sizes": "384x384",
                "type": "image/png"
            },
            {
                "src": "assets/images/logo/icon-512x512.png",
                "sizes": "512x512",
                "type": "image/png"
            }
        ];
        
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    }
}

// Generate icons
const generator = new IconGenerator();
generator.generateAllIcons(); 