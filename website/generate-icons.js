#!/usr/bin/env node

/**
 * DAMP Icon Generator Script
 * Generates all required icon sizes from the main icon.png file
 * 
 * Usage: node generate-icons.js
 * 
 * Requirements:
 * - npm install sharp
 * - Original icon.png file in website/assets/images/logo/
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    inputPath: './website/assets/images/logo/icon.png',
    outputDir: './website/assets/images/logo/',
    
    // All required icon sizes
    sizes: [
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
    ],
    
    // Optimization settings
    optimization: {
        png: {
            quality: 90,
            compressionLevel: 9,
            progressive: true
        },
        webp: {
            quality: 85,
            effort: 6
        }
    }
};

// Color schemes for different purposes
const colorSchemes = {
    primary: {
        background: '#667eea',
        foreground: '#ffffff'
    },
    maskable: {
        background: '#1a1a2e',
        foreground: '#667eea'
    },
    fallback: {
        background: '#16213e',
        foreground: '#ffffff'
    }
};

/**
 * Check if Sharp is installed
 */
function checkSharp() {
    try {
        require('sharp');
        return true;
    } catch (error) {
        console.error('❌ Sharp is not installed. Please run: npm install sharp');
        console.error('   Or install globally: npm install -g sharp');
        return false;
    }
}

/**
 * Check if input file exists
 */
function checkInputFile() {
    if (!fs.existsSync(config.inputPath)) {
        console.error(`❌ Input file not found: ${config.inputPath}`);
        console.error('   Please ensure icon.png exists in the logo directory');
        return false;
    }
    return true;
}

/**
 * Create output directory if it doesn't exist
 */
function ensureOutputDir() {
    if (!fs.existsSync(config.outputDir)) {
        fs.mkdirSync(config.outputDir, { recursive: true });
        console.log(`📁 Created output directory: ${config.outputDir}`);
    }
}

/**
 * Get image information
 */
async function getImageInfo(inputPath) {
    try {
        const metadata = await sharp(inputPath).metadata();
        return {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: metadata.size
        };
    } catch (error) {
        console.error('❌ Error reading image:', error.message);
        return null;
    }
}

/**
 * Generate a single icon size
 */
async function generateIcon(inputPath, outputPath, size, purpose) {
    try {
        let image = sharp(inputPath);
        
        // Apply purpose-specific optimizations
        if (purpose === 'maskable') {
            // Add safe area padding for maskable icons
            const padding = Math.round(size * 0.1); // 10% padding
            const innerSize = size - (padding * 2);
            
            image = image
                .resize(innerSize, innerSize, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .extend({
                    top: padding,
                    bottom: padding,
                    left: padding,
                    right: padding,
                    background: colorSchemes.maskable.background
                });
        } else {
            // Standard resize
            image = image.resize(size, size, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            });
        }
        
        // Apply PNG optimization
        await image
            .png(config.optimization.png)
            .toFile(outputPath);
        
        console.log(`✅ Generated: ${path.basename(outputPath)} (${size}x${size})`);
        return true;
    } catch (error) {
        console.error(`❌ Error generating ${outputPath}:`, error.message);
        return false;
    }
}

/**
 * Generate WebP versions
 */
async function generateWebPVersions() {
    console.log('\n🎨 Generating WebP versions...');
    
    for (const iconSpec of config.sizes) {
        const pngPath = path.join(config.outputDir, iconSpec.name);
        const webpPath = path.join(config.outputDir, iconSpec.name.replace('.png', '.webp'));
        
        if (fs.existsSync(pngPath)) {
            try {
                await sharp(pngPath)
                    .webp(config.optimization.webp)
                    .toFile(webpPath);
                
                console.log(`✅ Generated WebP: ${path.basename(webpPath)}`);
            } catch (error) {
                console.error(`❌ Error generating WebP ${webpPath}:`, error.message);
            }
        }
    }
}

/**
 * Generate fallback icons
 */
async function generateFallbackIcons() {
    console.log('\n🔄 Generating fallback icons...');
    
    // Create SVG fallback
    const svgFallback = `
        <svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                </radialGradient>
            </defs>
            <rect width="192" height="192" fill="url(#grad)" rx="19.2"/>
            <path d="M96 38.4 Q153.6 38.4 153.6 96 Q153.6 153.6 96 172.8 Q38.4 153.6 38.4 96 Q38.4 38.4 96 38.4Z" fill="white" opacity="0.9"/>
            <circle cx="76.8" cy="67.2" r="9.6" fill="white" opacity="0.7"/>
            <text x="96" y="182.4" text-anchor="middle" fill="white" font-family="Arial" font-size="15.36">DAMP</text>
        </svg>
    `;
    
    fs.writeFileSync(path.join(config.outputDir, 'icon-fallback.svg'), svgFallback);
    console.log('✅ Generated SVG fallback');
    
    // Create PNG fallback from SVG
    try {
        await sharp(Buffer.from(svgFallback))
            .png()
            .toFile(path.join(config.outputDir, 'icon-fallback.png'));
        
        console.log('✅ Generated PNG fallback');
    } catch (error) {
        console.error('❌ Error generating PNG fallback:', error.message);
    }
}

/**
 * Generate favicon.ico
 */
async function generateFavicon() {
    console.log('\n🏷️ Generating favicon.ico...');
    
    const faviconSizes = [16, 32, 48];
    const faviconPath = path.join(config.outputDir, '../../../favicon.ico');
    
    try {
        // Create ICO with multiple sizes
        const iconFiles = faviconSizes.map(size => 
            path.join(config.outputDir, `icon-${size}.png`)
        ).filter(file => fs.existsSync(file));
        
        if (iconFiles.length > 0) {
            // Use the largest available icon as favicon
            const largestIcon = iconFiles[iconFiles.length - 1];
            
            await sharp(largestIcon)
                .resize(32, 32)
                .png()
                .toFile(faviconPath.replace('.ico', '.png'));
            
            console.log('✅ Generated favicon.png (use as favicon.ico fallback)');
        }
    } catch (error) {
        console.error('❌ Error generating favicon:', error.message);
    }
}

/**
 * Validate generated icons
 */
async function validateIcons() {
    console.log('\n🔍 Validating generated icons...');
    
    const results = {
        valid: [],
        invalid: [],
        missing: []
    };
    
    for (const iconSpec of config.sizes) {
        const iconPath = path.join(config.outputDir, iconSpec.name);
        
        if (fs.existsSync(iconPath)) {
            try {
                const metadata = await sharp(iconPath).metadata();
                
                if (metadata.width === iconSpec.size && metadata.height === iconSpec.size) {
                    results.valid.push(iconSpec);
                } else {
                    results.invalid.push({
                        ...iconSpec,
                        actualSize: `${metadata.width}x${metadata.height}`
                    });
                }
            } catch (error) {
                results.invalid.push({
                    ...iconSpec,
                    error: error.message
                });
            }
        } else {
            results.missing.push(iconSpec);
        }
    }
    
    // Display results
    console.log(`✅ Valid icons: ${results.valid.length}`);
    console.log(`⚠️ Invalid icons: ${results.invalid.length}`);
    console.log(`❌ Missing icons: ${results.missing.length}`);
    
    if (results.invalid.length > 0) {
        console.log('\n⚠️ Invalid icons:');
        results.invalid.forEach(icon => {
            console.log(`   ${icon.name}: ${icon.actualSize || icon.error}`);
        });
    }
    
    if (results.missing.length > 0) {
        console.log('\n❌ Missing icons:');
        results.missing.forEach(icon => {
            console.log(`   ${icon.name} (${icon.size}x${icon.size})`);
        });
    }
    
    return results;
}

/**
 * Calculate file sizes
 */
function calculateSizes() {
    console.log('\n📊 Icon file sizes:');
    
    let totalSize = 0;
    
    config.sizes.forEach(iconSpec => {
        const iconPath = path.join(config.outputDir, iconSpec.name);
        
        if (fs.existsSync(iconPath)) {
            const stats = fs.statSync(iconPath);
            const sizeKB = (stats.size / 1024).toFixed(1);
            totalSize += stats.size;
            
            console.log(`   ${iconSpec.name}: ${sizeKB}KB`);
        }
    });
    
    console.log(`\n📦 Total size: ${(totalSize / 1024).toFixed(1)}KB`);
    
    // Check original file size
    if (fs.existsSync(config.inputPath)) {
        const originalStats = fs.statSync(config.inputPath);
        const originalSizeKB = (originalStats.size / 1024).toFixed(1);
        console.log(`📄 Original file: ${originalSizeKB}KB`);
        
        if (originalStats.size > totalSize) {
            const savings = ((originalStats.size - totalSize) / originalStats.size * 100).toFixed(1);
            console.log(`💡 Space saved: ${savings}% (optimized versions)`);
        }
    }
}

/**
 * Generate instructions for manual creation
 */
function generateInstructions() {
    console.log('\n📝 Manual Generation Instructions:');
    console.log('=====================================');
    console.log('If you prefer to generate icons manually, use these commands:\n');
    
    console.log('Using ImageMagick:');
    config.sizes.forEach(iconSpec => {
        console.log(`convert icon.png -resize ${iconSpec.size}x${iconSpec.size} ${iconSpec.name}`);
    });
    
    console.log('\nUsing online tools:');
    console.log('- https://realfavicongenerator.net/');
    console.log('- https://favicon.io/favicon-generator/');
    console.log('- https://iconifier.net/');
    
    console.log('\nUsing Photoshop/GIMP:');
    console.log('1. Open icon.png');
    console.log('2. Image > Image Size > Set width/height');
    console.log('3. Export as PNG with high quality');
    console.log('4. Repeat for each required size');
}

/**
 * Main function
 */
async function main() {
    console.log('🎨 DAMP Icon Generator');
    console.log('======================\n');
    
    // Check prerequisites
    if (!checkSharp()) {
        generateInstructions();
        return;
    }
    
    if (!checkInputFile()) {
        return;
    }
    
    // Setup
    ensureOutputDir();
    
    // Get input image info
    const imageInfo = await getImageInfo(config.inputPath);
    if (!imageInfo) {
        return;
    }
    
    console.log('📷 Input image info:');
    console.log(`   Size: ${imageInfo.width}x${imageInfo.height}`);
    console.log(`   Format: ${imageInfo.format}`);
    console.log(`   File size: ${(imageInfo.size / 1024).toFixed(1)}KB\n`);
    
    // Generate icons
    console.log('🚀 Generating icons...');
    
    let successCount = 0;
    for (const iconSpec of config.sizes) {
        const outputPath = path.join(config.outputDir, iconSpec.name);
        const success = await generateIcon(
            config.inputPath,
            outputPath,
            iconSpec.size,
            iconSpec.purpose
        );
        
        if (success) {
            successCount++;
        }
    }
    
    // Generate additional formats and fallbacks
    await generateWebPVersions();
    await generateFallbackIcons();
    await generateFavicon();
    
    // Validation and summary
    const validation = await validateIcons();
    calculateSizes();
    
    console.log('\n🎉 Icon generation complete!');
    console.log(`   Generated: ${successCount}/${config.sizes.length} icons`);
    console.log(`   Valid: ${validation.valid.length} icons`);
    
    if (validation.invalid.length > 0 || validation.missing.length > 0) {
        console.log('\n⚠️ Some icons need attention. Check the validation results above.');
    }
    
    console.log('\n📋 Next steps:');
    console.log('1. Check the generated icons in the logo directory');
    console.log('2. Test the website to ensure icons load correctly');
    console.log('3. Update any hardcoded icon references if needed');
    console.log('4. Consider adding the icon-generator.js script to your build process');
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    generateIcon,
    generateWebPVersions,
    generateFallbackIcons,
    validateIcons,
    config
}; 