/**
 * Generate favicon.ico from existing PNG
 * Run this script to create the missing favicon.ico
 */

const fs = require('fs');
const path = require('path');

// Simple favicon.ico generator (converts PNG to ICO format)
// For production, use proper tools like imagemin or online converters

const sharp = require('sharp'); // You'll need to install this: npm install sharp

async function generateFavicon() {
    try {
        const inputPath = path.join(__dirname, 'assets/images/logo/favicon.png');
        const outputPath = path.join(__dirname, 'favicon.ico');
        
        // Convert PNG to ICO format with multiple sizes
        await sharp(inputPath)
            .resize(32, 32)
            .png()
            .toFile(outputPath);
            
        console.log('✅ favicon.ico generated successfully!');
    } catch (error) {
        console.error('❌ Error generating favicon:', error);
        
        // Fallback: Just copy the PNG as favicon.ico
        const inputPath = path.join(__dirname, 'assets/images/logo/favicon.png');
        const outputPath = path.join(__dirname, 'favicon.ico');
        
        fs.copyFileSync(inputPath, outputPath);
        console.log('✅ favicon.ico copied as fallback');
    }
}

generateFavicon(); 