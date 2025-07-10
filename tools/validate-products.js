#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Validate products.json file
 * Following Google engineering standards for validation
 */
class ProductValidator {
    constructor() {
        this.productsFile = path.join(__dirname, '..', 'website', 'assets', 'data', 'products.json');
        this.errors = [];
        this.warnings = [];
    }

    /**
     * Main validation method
     */
    async validate() {
        try {
            console.log('🔍 Validating products.json...');
            
            if (!fs.existsSync(this.productsFile)) {
                throw new Error(`Products file not found: ${this.productsFile}`);
            }

            const products = JSON.parse(fs.readFileSync(this.productsFile, 'utf8'));
            
            this.validateStructure(products);
            this.validateProducts(products);
            this.validateImages(products);
            this.validatePricing(products);
            this.validateCompatibility(products);
            
            this.reportResults(products);
            
            if (this.errors.length > 0) {
                process.exit(1);
            }
            
        } catch (error) {
            console.error('❌ Validation failed:', error.message);
            process.exit(1);
        }
    }

    /**
     * Validate overall structure
     */
    validateStructure(products) {
        if (!Array.isArray(products)) {
            this.errors.push('Products must be an array');
            return;
        }

        if (products.length === 0) {
            this.warnings.push('No products found');
        }
    }

    /**
     * Validate individual products
     */
    validateProducts(products) {
        const productIds = new Set();
        
        products.forEach((product, index) => {
            const prefix = `Product ${index + 1} (${product.name || 'Unknown'})`;
            
            // Required fields
            if (!product.id) {
                this.errors.push(`${prefix}: Missing required field 'id'`);
            } else if (productIds.has(product.id)) {
                this.errors.push(`${prefix}: Duplicate product ID '${product.id}'`);
            } else {
                productIds.add(product.id);
            }
            
            if (!product.name) {
                this.errors.push(`${prefix}: Missing required field 'name'`);
            }
            
            if (!product.category) {
                this.errors.push(`${prefix}: Missing required field 'category'`);
            }
            
            // Inventory validation
            if (typeof product.inventory !== 'number' || product.inventory < 0) {
                this.errors.push(`${prefix}: Inventory must be a non-negative number`);
            }
            
            // Status validation
            const validStatuses = ['development', 'preorder', 'available', 'discontinued'];
            if (!validStatuses.includes(product.status)) {
                this.warnings.push(`${prefix}: Unknown status '${product.status}'. Valid values: ${validStatuses.join(', ')}`);
            }

            // Priority validation
            if (typeof product.priority !== 'number' || product.priority < 1) {
                this.warnings.push(`${prefix}: Priority should be a positive number`);
            }
        });
    }

    /**
     * Validate image paths
     */
    validateImages(products) {
        products.forEach((product, index) => {
            const prefix = `Product ${index + 1} (${product.name || 'Unknown'})`;
            
            if (product.images?.primary) {
                const imagePath = path.join(__dirname, '..', 'website', product.images.primary);
                if (!fs.existsSync(imagePath)) {
                    this.warnings.push(`${prefix}: Primary image not found: ${product.images.primary}`);
                }
            } else {
                this.warnings.push(`${prefix}: No primary image specified`);
            }
            
            if (product.images?.gallery && Array.isArray(product.images.gallery)) {
                product.images.gallery.forEach((imagePath, imgIndex) => {
                    const fullPath = path.join(__dirname, '..', 'website', imagePath);
                    if (!fs.existsSync(fullPath)) {
                        this.warnings.push(`${prefix}: Gallery image ${imgIndex + 1} not found: ${imagePath}`);
                    }
                });
            }
        });
    }

    /**
     * Validate pricing information
     */
    validatePricing(products) {
        products.forEach((product, index) => {
            const prefix = `Product ${index + 1} (${product.name || 'Unknown'})`;
            
            if (!product.pricing) {
                this.errors.push(`${prefix}: Missing pricing information`);
                return;
            }
            
            const { current, original, currency } = product.pricing;
            
            // Price validation
            if (typeof current !== 'number' || current < 0) {
                this.errors.push(`${prefix}: Current price must be a non-negative number`);
            }
            
            if (typeof original !== 'number' || original < 0) {
                this.errors.push(`${prefix}: Original price must be a non-negative number`);
            }
            
            if (current > original) {
                this.warnings.push(`${prefix}: Current price ($${current}) is higher than original price ($${original})`);
            }
            
            // Currency validation
            const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
            if (!validCurrencies.includes(currency)) {
                this.warnings.push(`${prefix}: Unknown currency '${currency}'. Valid values: ${validCurrencies.join(', ')}`);
            }
            
            // Discount calculation validation
            if (original > 0 && current > 0) {
                const expectedDiscount = Math.round((1 - (current / original)) * 100);
                if (product.pricing.discount_percent !== expectedDiscount) {
                    this.warnings.push(`${prefix}: Discount percentage mismatch. Expected: ${expectedDiscount}%, Got: ${product.pricing.discount_percent}%`);
                }
            }
        });
    }

    /**
     * Validate compatibility information
     */
    validateCompatibility(products) {
        products.forEach((product, index) => {
            const prefix = `Product ${index + 1} (${product.name || 'Unknown'})`;
            
            if (!product.compatibility) {
                this.warnings.push(`${prefix}: Missing compatibility information`);
                return;
            }
            
            const { type, brand, models } = product.compatibility;
            
            // Compatibility type validation
            const validTypes = ['universal', 'brand-specific', 'model-specific'];
            if (!validTypes.includes(type)) {
                this.warnings.push(`${prefix}: Unknown compatibility type '${type}'. Valid values: ${validTypes.join(', ')}`);
            }
            
            // Brand-specific validation
            if (type === 'brand-specific' && !brand) {
                this.errors.push(`${prefix}: Brand-specific compatibility requires a brand name`);
            }
            
            // Models validation
            if (type !== 'universal' && (!models || !Array.isArray(models) || models.length === 0)) {
                this.warnings.push(`${prefix}: Specific compatibility should include supported models`);
            }
        });
    }

    /**
     * Report validation results
     */
    reportResults(products) {
        console.log(`\n📊 Validation Results:`);
        console.log(`   Products: ${products.length}`);
        console.log(`   Errors: ${this.errors.length}`);
        console.log(`   Warnings: ${this.warnings.length}`);
        
        if (this.errors.length > 0) {
            console.log('\n❌ Errors:');
            this.errors.forEach(error => console.log(`   - ${error}`));
        }
        
        if (this.warnings.length > 0) {
            console.log('\n⚠️  Warnings:');
            this.warnings.forEach(warning => console.log(`   - ${warning}`));
        }
        
        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('✅ All validations passed!');
        }
        
        // Summary by category
        const categories = [...new Set(products.map(p => p.category))];
        console.log('\n📋 Products by Category:');
        categories.forEach(category => {
            const count = products.filter(p => p.category === category).length;
            console.log(`   - ${category}: ${count} products`);
        });
        
        // Summary by status
        const statuses = [...new Set(products.map(p => p.status))];
        console.log('\n📈 Products by Status:');
        statuses.forEach(status => {
            const count = products.filter(p => p.status === status).length;
            console.log(`   - ${status}: ${count} products`);
        });
    }
}

// Execute if run directly
if (require.main === module) {
    const validator = new ProductValidator();
    validator.validate();
}

module.exports = ProductValidator;