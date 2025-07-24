#!/usr/bin/env node

/**
 * PWA Icon Generator - Google Engineering Standards
 * Generates all required PWA icon sizes from source logo
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// PWA Icon specifications (Google Standards)
const PWA_ICON_SIZES = [
    { size: 72, purpose: 'maskable' },
    { size: 96, purpose: 'maskable' },
    { size: 128, purpose: 'maskable' },
    { size: 144, purpose: 'maskable' },
    { size: 152, purpose: 'maskable' },
    { size: 192, purpose: 'any maskable' },
    { size: 384, purpose: 'any' },
    { size: 512, purpose: 'any' },
    // Additional sizes for comprehensive support
    { size: 16, purpose: 'any', filename: 'favicon-16x16.png' },
    { size: 32, purpose: 'any', filename: 'favicon-32x32.png' },
    { size: 48, purpose: 'any' },
    { size: 57, purpose: 'any', filename: 'apple-icon-57x57.png' },
    { size: 60, purpose: 'any', filename: 'apple-icon-60x60.png' },
    { size: 76, purpose: 'any', filename: 'apple-icon-76x76.png' },
    { size: 114, purpose: 'any', filename: 'apple-icon-114x114.png' },
    { size: 120, purpose: 'any', filename: 'apple-icon-120x120.png' },
    { size: 180, purpose: 'any', filename: 'apple-icon-180x180.png' }
];

// Paths
const SOURCE_LOGO = path.join(__dirname, '../website/assets/images/logo/logo.png');
const OUTPUT_DIR = path.join(__dirname, '../website/assets/images/logo');

/**
 * Generate PWA icons with proper formatting
 */
async function generatePWAIcons() {
    console.log('🎨 Generating PWA icons...');
    
    try {
        // Ensure output directory exists
        await fs.mkdir(OUTPUT_DIR, { recursive: true });
        
        // Check if source logo exists
        try {
            await fs.access(SOURCE_LOGO);
        } catch (error) {
            throw new Error(`Source logo not found: ${SOURCE_LOGO}`);
        }
        
        // Generate each icon size
        for (const icon of PWA_ICON_SIZES) {
            const filename = icon.filename || `icon-${icon.size}.png`;
            const outputPath = path.join(OUTPUT_DIR, filename);
            
            console.log(`📱 Generating ${filename} (${icon.size}x${icon.size})...`);
            
            try {
                let sharpInstance = sharp(SOURCE_LOGO);
                
                // For maskable icons, add padding to ensure safe area
                if (icon.purpose.includes('maskable')) {
                    const paddedSize = Math.floor(icon.size * 1.2); // 20% padding
                    
                    sharpInstance = sharpInstance
                        .resize(Math.floor(icon.size * 0.8), Math.floor(icon.size * 0.8), {
                            fit: 'contain',
                            background: { r: 0, g: 0, b: 0, alpha: 0 }
                        })
                        .extend({
                            top: Math.floor((paddedSize - icon.size * 0.8) / 2),
                            bottom: Math.floor((paddedSize - icon.size * 0.8) / 2),
                            left: Math.floor((paddedSize - icon.size * 0.8) / 2),
                            right: Math.floor((paddedSize - icon.size * 0.8) / 2),
                            background: { r: 26, g: 26, b: 46, alpha: 1 } // Brand background
                        })
                        .resize(icon.size, icon.size, {
                            fit: 'fill'
                        });
                } else {
                    sharpInstance = sharpInstance
                        .resize(icon.size, icon.size, {
                            fit: 'contain',
                            background: { r: 0, g: 0, b: 0, alpha: 0 }
                        });
                }
                
                await sharpInstance
                    .png({
                        quality: 100,
                        compressionLevel: 9,
                        adaptiveFiltering: true
                    })
                    .toFile(outputPath);
                
                console.log(`✅ Generated ${filename}`);
                
            } catch (error) {
                console.error(`❌ Failed to generate ${filename}:`, error.message);
            }
        }
        
        // Generate favicon.ico
        await generateFavicon();
        
        // Generate splash screens for iOS
        await generateSplashScreens();
        
        console.log('🎉 PWA icons generation completed!');
        
    } catch (error) {
        console.error('❌ PWA icon generation failed:', error.message);
        process.exit(1);
    }
}

/**
 * Generate favicon.ico with multiple sizes
 */
async function generateFavicon() {
    console.log('🔖 Generating favicon.ico...');
    
    const faviconSizes = [16, 32, 48];
    const faviconPath = path.join(OUTPUT_DIR, 'favicon.ico');
    
    try {
        // For ICO files, we'll generate a 32x32 PNG as primary favicon
        await sharp(SOURCE_LOGO)
            .resize(32, 32, {
                fit: 'contain',
                background: { r: 26, g: 26, b: 46, alpha: 1 }
            })
            .png()
            .toFile(path.join(OUTPUT_DIR, 'favicon.png'));
        
        // Copy PNG as ICO for compatibility
        await fs.copyFile(
            path.join(OUTPUT_DIR, 'favicon.png'),
            faviconPath
        );
        
        console.log('✅ Generated favicon.ico');
        
    } catch (error) {
        console.error('❌ Failed to generate favicon:', error.message);
    }
}

/**
 * Generate iOS splash screens
 */
async function generateSplashScreens() {
    console.log('📱 Generating iOS splash screens...');
    
    const splashScreens = [
        { width: 1125, height: 2436, name: 'splash-iphone-x.png' },
        { width: 828, height: 1792, name: 'splash-iphone-xr.png' },
        { width: 1242, height: 2688, name: 'splash-iphone-xs-max.png' },
        { width: 750, height: 1334, name: 'splash-iphone-8.png' },
        { width: 1242, height: 2208, name: 'splash-iphone-8-plus.png' },
        { width: 1536, height: 2048, name: 'splash-ipad.png' },
        { width: 2048, height: 2732, name: 'splash-ipad-pro.png' }
    ];
    
    const splashDir = path.join(OUTPUT_DIR, 'splash');
    await fs.mkdir(splashDir, { recursive: true });
    
    for (const splash of splashScreens) {
        const outputPath = path.join(splashDir, splash.name);
        
        try {
            // Create splash screen with logo centered on brand background
            const logoSize = Math.min(splash.width, splash.height) * 0.3;
            
            await sharp({
                create: {
                    width: splash.width,
                    height: splash.height,
                    channels: 4,
                    background: { r: 26, g: 26, b: 46, alpha: 1 }
                }
            })
            .composite([{
                input: await sharp(SOURCE_LOGO)
                    .resize(Math.floor(logoSize), Math.floor(logoSize), {
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    })
                    .png()
                    .toBuffer(),
                gravity: 'center'
            }])
            .png()
            .toFile(outputPath);
            
            console.log(`✅ Generated ${splash.name}`);
            
        } catch (error) {
            console.error(`❌ Failed to generate ${splash.name}:`, error.message);
        }
    }
}

// Run if called directly
if (require.main === module) {
    generatePWAIcons();
}

module.exports = { generatePWAIcons }; 