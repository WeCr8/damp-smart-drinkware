#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

/**
 * Parse product specifications from markdown files
 * Following Google engineering standards for clean, maintainable code
 */
class ProductSpecParser {
    constructor() {
        this.specsDir = path.join(__dirname, '..', 'docs', 'product-specs');
        this.outputFile = path.join(__dirname, '..', 'website', 'assets', 'data', 'products.json');
        this.products = [];
    }

    /**
     * Main execution method
     */
    async run() {
        try {
            console.log('🔍 Parsing product specifications...');
            await this.parseAllSpecs();
            await this.writeProductsFile();
            console.log('✅ Product specifications parsed successfully!');
            console.log(`📊 Total products: ${this.products.length}`);
        } catch (error) {
            console.error('❌ Error parsing product specifications:', error);
            process.exit(1);
        }
    }

    /**
     * Parse all product specification files
     */
    async parseAllSpecs() {
        const categories = fs.readdirSync(this.specsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const category of categories) {
            const categoryPath = path.join(this.specsDir, category);
            const specFiles = fs.readdirSync(categoryPath)
                .filter(file => file.endsWith('.md'));

            for (const specFile of specFiles) {
                const filePath = path.join(categoryPath, specFile);
                await this.parseSpecFile(filePath, category);
            }
        }
    }

    /**
     * Parse individual specification file
     */
    async parseSpecFile(filePath, category) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const parsed = matter(content);
            
            if (!parsed.data || !parsed.data.product_id) {
                console.warn(`⚠️  Skipping ${filePath}: No product_id found`);
                return;
            }

            const product = this.transformProductData(parsed.data, category);
            this.products.push(product);
            
            console.log(`✓ Parsed: ${product.name} (${product.product_id})`);
        } catch (error) {
            console.error(`❌ Error parsing ${filePath}:`, error.message);
        }
    }

    /**
     * Transform raw product data into standardized format
     */
    transformProductData(data, category) {
        return {
            // Core product information
            id: data.product_id,
            name: data.name || 'Unknown Product',
            category: category,
            variant: data.variant || null,
            status: data.status || 'unknown',
            priority: data.priority || 1,
            
            // Compatibility information
            compatibility: {
                type: data.compatibility?.type || 'universal',
                brand: data.compatibility?.brand || null,
                description: data.compatibility?.description || '',
                models: data.compatibility?.models || [],
                size_range: data.compatibility?.size_range || null
            },
            
            // Pricing information
            pricing: {
                current: data.pricing?.current || 0,
                original: data.pricing?.original || 0,
                currency: data.pricing?.currency || 'USD',
                discount_percent: data.pricing?.original ? 
                    Math.round((1 - (data.pricing.current / data.pricing.original)) * 100) : 0
            },
            
            // Inventory and delivery
            inventory: data.inventory || 0,
            delivery: {
                preorder: data.delivery?.preorder || null,
                standard: data.delivery?.standard || null
            },
            
            // Technical specifications
            specifications: {
                battery_life: data.specifications?.battery_life || null,
                connectivity: data.specifications?.connectivity || null,
                water_resistance: data.specifications?.water_resistance || null,
                dimensions: data.specifications?.dimensions || null,
                weight: data.specifications?.weight || null,
                installation: data.specifications?.installation || null
            },
            
            // Images
            images: {
                primary: data.images?.primary || null,
                gallery: data.images?.gallery || []
            },
            
            // Metadata
            last_updated: new Date().toISOString(),
            available_for_preorder: data.status === 'development' || data.status === 'preorder',
            in_stock: data.inventory > 0
        };
    }

    /**
     * Write products to JSON file
     */
    async writeProductsFile() {
        // Sort products by priority and name
        this.products.sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            return a.name.localeCompare(b.name);
        });

        // Ensure output directory exists
        const outputDir = path.dirname(this.outputFile);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write formatted JSON
        fs.writeFileSync(this.outputFile, JSON.stringify(this.products, null, 2));
        console.log(`📝 Products written to: ${this.outputFile}`);
    }
}

// Execute if run directly
if (require.main === module) {
    const parser = new ProductSpecParser();
    parser.run();
}

module.exports = ProductSpecParser; 