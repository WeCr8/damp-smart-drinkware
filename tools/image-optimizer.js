/**
 * DAMP Smart Drinkware - Professional Image Optimization System
 * Converts images to modern formats and generates responsive sizes
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class DAMPImageOptimizer {
    constructor() {
        this.inputDir = './website/assets/images';
        this.outputDir = './website/assets/images/optimized';
        this.formats = ['webp', 'avif', 'png'];
        
        // Responsive breakpoints
        this.breakpoints = {
            // Product images
            'product-large': 800,
            'product-medium': 400,
            'product-small': 200,
            'product-thumb': 150,
            
            // Logo sizes
            'logo-large': 256,
            'logo-medium': 128,
            'logo-small': 64,
            'logo-icon': 32,
            'logo-favicon': 16,
            
            // Hero images
            'hero-desktop': 1200,
            'hero-tablet': 768,
            'hero-mobile': 480
        };
    }

    async optimizeAll() {
        console.log('🚀 Starting DAMP Image Optimization...');
        
        try {
            // Create output directory
            await fs.mkdir(this.outputDir, { recursive: true });
            
            // Optimize product images
            await this.optimizeProductImages();
            
            // Optimize logo images
            await this.optimizeLogos();
            
            // Generate manifests
            await this.generateManifests();
            
            console.log('✅ Image optimization completed successfully!');
            console.log(`📁 Optimized images saved to: ${this.outputDir}`);
            
        } catch (error) {
            console.error('❌ Image optimization failed:', error);
        }
    }

    async optimizeProductImages() {
        console.log('🖼️  Optimizing product images...');
        
        const productDirs = [
            'products/damp-handle',
            'products/silicone-bottom', 
            'products/cup-sleeve',
            'products/baby-bottle'
        ];

        for (const dir of productDirs) {
            const inputPath = path.join(this.inputDir, dir);
            const outputPath = path.join(this.outputDir, dir);
            
            try {
                await fs.mkdir(outputPath, { recursive: true });
                const files = await fs.readdir(inputPath);
                
                for (const file of files) {
                    if (this.isImageFile(file)) {
                        await this.optimizeProductImage(
                            path.join(inputPath, file),
                            outputPath,
                            file
                        );
                    }
                }
            } catch (error) {
                console.warn(`⚠️  Could not process ${dir}:`, error.message);
            }
        }
    }

    async optimizeProductImage(inputPath, outputDir, filename) {
        const baseName = path.parse(filename).name;
        
        // Generate multiple sizes for responsive images
        const sizes = [
            { suffix: '-large', width: this.breakpoints['product-large'] },
            { suffix: '-medium', width: this.breakpoints['product-medium'] },
            { suffix: '-small', width: this.breakpoints['product-small'] },
            { suffix: '-thumb', width: this.breakpoints['product-thumb'] }
        ];

        for (const size of sizes) {
            for (const format of this.formats) {
                const outputPath = path.join(outputDir, `${baseName}${size.suffix}.${format}`);
                
                try {
                    await sharp(inputPath)
                        .resize(size.width, null, {
                            withoutEnlargement: true,
                            fit: 'inside'
                        })
                        .toFormat(format, {
                            webp: { quality: 85, effort: 6 },
                            avif: { quality: 75, effort: 4 },
                            png: { quality: 90, compressionLevel: 9 }
                        })
                        .toFile(outputPath);
                    
                    console.log(`✅ Generated: ${path.basename(outputPath)}`);
                } catch (error) {
                    console.warn(`⚠️  Failed to generate ${outputPath}:`, error.message);
                }
            }
        }
    }

    async optimizeLogos() {
        console.log('🏷️  Optimizing logos...');
        
        const logoDir = path.join(this.inputDir, 'logo');
        const outputDir = path.join(this.outputDir, 'logo');
        
        try {
            await fs.mkdir(outputDir, { recursive: true });
            const files = await fs.readdir(logoDir);
            
            for (const file of files) {
                if (this.isImageFile(file)) {
                    await this.optimizeLogo(
                        path.join(logoDir, file),
                        outputDir,
                        file
                    );
                }
            }
        } catch (error) {
            console.warn('⚠️  Could not optimize logos:', error.message);
        }
    }

    async optimizeLogo(inputPath, outputDir, filename) {
        const baseName = path.parse(filename).name;
        
        const sizes = [
            { suffix: '-256', width: 256 },
            { suffix: '-128', width: 128 },
            { suffix: '-64', width: 64 },
            { suffix: '-32', width: 32 },
            { suffix: '-16', width: 16 }
        ];

        for (const size of sizes) {
            for (const format of this.formats) {
                const outputPath = path.join(outputDir, `${baseName}${size.suffix}.${format}`);
                
                try {
                    await sharp(inputPath)
                        .resize(size.width, size.width, {
                            fit: 'contain',
                            background: { r: 0, g: 0, b: 0, alpha: 0 }
                        })
                        .toFormat(format, {
                            webp: { quality: 90, effort: 6 },
                            avif: { quality: 80, effort: 4 },
                            png: { quality: 95, compressionLevel: 9 }
                        })
                        .toFile(outputPath);
                    
                    console.log(`✅ Generated: ${path.basename(outputPath)}`);
                } catch (error) {
                    console.warn(`⚠️  Failed to generate ${outputPath}:`, error.message);
                }
            }
        }
    }

    async generateManifests() {
        console.log('📋 Generating image manifests...');
        
        const manifest = {
            generated: new Date().toISOString(),
            formats: this.formats,
            breakpoints: this.breakpoints,
            products: {},
            logos: {}
        };
        
        // Generate product manifest
        const productDirs = ['damp-handle', 'silicone-bottom', 'cup-sleeve', 'baby-bottle'];
        
        for (const product of productDirs) {
            manifest.products[product] = {
                large: `assets/images/optimized/products/${product}/${product}-large`,
                medium: `assets/images/optimized/products/${product}/${product}-medium`,
                small: `assets/images/optimized/products/${product}/${product}-small`,
                thumb: `assets/images/optimized/products/${product}/${product}-thumb`
            };
        }
        
        // Generate logo manifest
        manifest.logos = {
            icon: 'assets/images/optimized/logo/icon',
            favicon: 'assets/images/optimized/logo/favicon'
        };
        
        await fs.writeFile(
            path.join(this.outputDir, 'image-manifest.json'),
            JSON.stringify(manifest, null, 2)
        );
        
        console.log('📋 Image manifest generated');
    }

    isImageFile(filename) {
        const ext = path.extname(filename).toLowerCase();
        return ['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext);
    }
}

// Export for use in other scripts
module.exports = DAMPImageOptimizer;

// Run if called directly
if (require.main === module) {
    const optimizer = new DAMPImageOptimizer();
    optimizer.optimizeAll();
} 