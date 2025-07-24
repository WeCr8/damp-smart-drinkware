/**
 * DAMP Emergency Image Optimization
 * Fixes the 2.8MB image bloat issue immediately
 */

const fs = require('fs').promises;
const path = require('path');

class ImageEmergencyFix {
    constructor() {
        this.websiteDir = path.join(__dirname, '../website');
        this.imagesDir = path.join(this.websiteDir, 'assets/images');
    }

    async fixNow() {
        console.log('🚨 EMERGENCY IMAGE OPTIMIZATION STARTING...\n');
        
        try {
            // Install sharp if not available
            await this.ensureSharp();
            
            // Fix the massive images
            await this.fixMassiveImages();
            
            // Update image references in HTML
            await this.updateImageReferences();
            
            console.log('\n✅ EMERGENCY IMAGE FIX COMPLETED!');
            console.log('📊 Estimated savings: 2.6MB+ (93% reduction)');
            
        } catch (error) {
            console.error('❌ Emergency fix failed:', error);
            // Fallback: Create placeholder optimized versions
            await this.createPlaceholders();
        }
    }

    async ensureSharp() {
        try {
            require('sharp');
            console.log('✅ Sharp is available');
        } catch (error) {
            console.log('📦 Installing sharp for image optimization...');
            const { spawn } = require('child_process');
            
            return new Promise((resolve, reject) => {
                const install = spawn('npm', ['install', 'sharp'], { stdio: 'inherit' });
                install.on('close', (code) => {
                    if (code === 0) {
                        console.log('✅ Sharp installed successfully');
                        resolve();
                    } else {
                        reject(new Error('Sharp installation failed'));
                    }
                });
            });
        }
    }

    async fixMassiveImages() {
        const sharp = require('sharp');
        
        // Fix icon.png (1.1MB -> ~50KB)
        const iconPath = path.join(this.imagesDir, 'logo/icon.png');
        await sharp(iconPath)
            .resize(512, 512)
            .png 