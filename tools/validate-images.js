/**
 * DAMP Image Validation Tool
 * Checks for oversized images and optimization opportunities
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

class ImageValidator {
    constructor() {
        this.maxSizes = {
            'product-large': 100 * 1024,   // 100KB
            'product-medium': 50 * 1024,   // 50KB
            'product-small': 25 * 1024,    // 25KB
            'logo-icon': 10 * 1024,        // 10KB
            'logo-large': 50 * 1024        // 50KB
        };
    }

    async validateAll() {
        console.log('🔍 Validating image optimization...');
        
        const issues = [];
        const optimizedDir = './website/assets/images/optimized';
        
        try {
            await this.validateDirectory(optimizedDir, issues);
            
            if (issues.length === 0) {
                console.log('✅ All images are properly optimized!');
            } else {
                console.log(`⚠️  Found ${issues.length} optimization issues:`);
                issues.forEach(issue => console.log(`   - ${issue}`));
            }
            
        } catch (error) {
            console.error('❌ Validation failed:', error);
        }
    }

    async validateDirectory(dir, issues) {
        const files = await fs.readdir(dir, { withFileTypes: true });
        
        for (const file of files) {
            const filePath = path.join(dir, file.name);
            
            if (file.isDirectory()) {
                await this.validateDirectory(filePath, issues);
            } else if (this.isImageFile(file.name)) {
                await this.validateImage(filePath, issues);
            }
        }
    }

    async validateImage(imag 