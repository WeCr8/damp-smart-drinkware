/**
 * DAMP Product Generator
 * Generates new product pages from templates and configuration
 */

const fs = require('fs').promises;
const path = require('path');

class ProductGenerator {
    constructor() {
        this.templatePath = path.join(__dirname, '../website/templates/product-template.html');
        this.outputDir = path.join(__dirname, '../website/pages');
    }

    async generateProduct(configPath) {
        try {
            // Read configuration
            const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
            
            // Read template
            const template = await fs.readFile(this.templatePath, 'utf8');
            
            // Generate HTML
            const html = this.processTemplate(template, config);
            
            // Write output file
            const outputPath = path.join(this.outputDir, `${config.product.slug}.html`);
            await fs.writeFile(outputPath, html);
            
            console.log(`✅ Generated product page: ${outputPath}`);
            
            // Generate image placeholders if needed
            await this.generateImagePlaceholders(config);
            
        } catch (error) {
            console.error('❌ Error generating product:', error);
        }
    }

    processTemplate(template, config) {
        let html = template;
        
        // Replace basic product information
        Object.entries(config.product).forEach(([key, value]) => {
            const placeholder = `{{${key.toUpperCase()}}}`;
            html = html.replace(new RegExp(placeholder, 'g'), value);
        });
        
        // Generate features cards
        const featuresHtml = config.features.map(feature => `
            <div class="feature-card">
                <div class="feature-icon">${feature.icon}</div>
                <h3>${feature.title}</h3>
                <p>${feature.description}</p>
            </div>
        `).join('');
        html = html.replace('{{FEATURES_CARDS}}', featuresHtml);
        
        // Generate specifications
        const specsHtml = config.specifications.map(spec => `
            <div class="spec-item">
                <div class="spec-label">${spec.label}</div>
                <div class="spec-value">${spec.value}</div>
            </div>
        `).join('');
        html = html.replace('{{SPECS_ITEMS}}', specsHtml);
        
        // Generate custom form fields
        const customFieldsHtml = config.preorder.customFields.map(field => {
            if (field.type === 'select') {
                const options = field.options.map(opt => 
                    `<option value="${opt.value}">${opt.text}</option>`
                ).join('');
                return `
                    <div class="form-group">
                        <label for="${field.id}">${field.label}</label>
                        <select id="${field.id}" name="${field.id}" required>
                            <option value="">Select ${field.label.toLowerCase()}</option>
                            ${options}
                        </select>
                    </div>
                `;
            }
            return '';
        }).join('');
        html = html.replace('{{CUSTOM_FORM_FIELDS}}', customFieldsHtml);
        
        // Generate quantity options
        const quantityHtml = config.preorder.quantityOptions.map(opt => 
            `<option value="${opt.value}">${opt.text}</option>`
        ).join('');
        html = html.replace('{{QUANTITY_OPTIONS}}', quantityHtml);
        
        // Replace preorder fields
        html = html.replace('{{PREORDER_HEADLINE}}', config.preorder.headline);
        html = html.replace('{{PREORDER_DESCRIPTION}}', config.preorder.description);
        
        return html;
    }

    async generateImagePlaceholders(config) {
        const imagesDir = path.join(__dirname, '../website/assets/images/products', config.product.folder);
        
        try {
            await fs.mkdir(imagesDir, { recursive: true });
            console.log(`📁 Created images directory: ${imagesDir}`);
        } catch (error) {
            console.log(`📁 Images directory already exists: ${imagesDir}`);
        }
    }
}

// Usage
if (require.main === module) {
    const generator = new ProductGenerator();
    const configPath = process.argv[2];
    
    if (!configPath) {
        console.log('Usage: node product-generator.js <config-file.json>');
        process.exit(1);
    }
    
    generator.generateProduct(configPath);
}

module.exports = ProductGenerator; 