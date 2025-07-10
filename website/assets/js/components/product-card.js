/**
 * DAMP Product Card Web Component
 * Professional data-driven product display component
 * @version 1.0.0
 * @author DAMP Smart Drinkware
 */

class ProductCard extends HTMLElement {
    constructor() {
        super();
        this.productData = null;
        this.loading = false;
        this.error = null;
    }

    static get observedAttributes() {
        return ['product-id', 'variant', 'show-actions'];
    }

    async connectedCallback() {
        this.loading = true;
        this.render(); // Show loading state
        
        try {
            const productId = this.getAttribute('product-id');
            const variant = this.getAttribute('variant') || 'default';
            
            if (!productId) {
                throw new Error('product-id attribute is required');
            }
            
            this.productData = await this.fetchProductData(productId);
            this.loading = false;
            this.render();
            
            // Track component usage for analytics
            this.trackComponentLoad(productId, variant);
            
        } catch (error) {
            this.error = error.message;
            this.loading = false;
            this.render();
            console.error('ProductCard Error:', error);
        }
    }

    async fetchProductData(id) {
        try {
            const response = await fetch('/assets/data/products.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch product data: ${response.status}`);
            }
            
            const products = await response.json();
            const product = products.find(p => p.id === id);
            
            if (!product) {
                throw new Error(`Product with id "${id}" not found`);
            }
            
            return product;
        } catch (error) {
            throw new Error(`Failed to load product data: ${error.message}`);
        }
    }

    generateFeatures() {
        if (!this.productData?.features) return '';
        
        return `
            <ul class="product-features">
                ${this.productData.features.map(feature => 
                    `<li>${this.escapeHtml(feature)}</li>`
                ).join('')}
            </ul>
        `;
    }

    generateActions() {
        if (!this.productData) return '';
        
        const showActions = this.getAttribute('show-actions') !== 'false';
        if (!showActions) return '';
        
        return `
            <div class="product-actions">
                <a href="pages/${this.productData.id}.html" 
                   class="btn btn-primary" 
                   data-action="view-details"
                   data-product-id="${this.productData.id}">
                   View Details
                </a>
                <a href="pages/cart.html?product=${this.productData.id}&quantity=1" 
                   class="btn btn-secondary"
                   data-action="add-to-cart"
                   data-product-id="${this.productData.id}">
                   Add to Cart
                </a>
            </div>
        `;
    }

    generatePricing() {
        if (!this.productData?.pricing) return '';
        
        const { current, original, savings } = this.productData.pricing;
        
        return `
            <div class="product-pricing">
                <span class="product-price">${current}</span>
                ${original ? `<span class="original-price">${original}</span>` : ''}
                ${savings ? `<div class="price-savings">Save ${savings}</div>` : ''}
            </div>
        `;
    }

    generateLoadingState() {
        return `
            <article class="product-card product-card--loading">
                <div class="product-skeleton">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-text skeleton-text--title"></div>
                    <div class="skeleton-text skeleton-text--price"></div>
                    <div class="skeleton-text skeleton-text--features"></div>
                </div>
            </article>
        `;
    }

    generateErrorState() {
        return `
            <article class="product-card product-card--error">
                <div class="product-error">
                    <div class="error-icon">⚠️</div>
                    <h3>Unable to load product</h3>
                    <p>${this.escapeHtml(this.error)}</p>
                    <button onclick="this.closest('product-card').retry()" class="btn btn-secondary">
                        Retry
                    </button>
                </div>
            </article>
        `;
    }

    render() {
        if (this.loading) {
            this.innerHTML = this.generateLoadingState();
            return;
        }
        
        if (this.error) {
            this.innerHTML = this.generateErrorState();
            return;
        }
        
        if (!this.productData) return;
        
        const variant = this.getAttribute('variant') || 'default';
        
        this.innerHTML = `
            <article class="product-card product-card--${variant}" data-product-id="${this.productData.id}">
                ${this.productData.badge ? `<div class="product-badge">${this.escapeHtml(this.productData.badge)}</div>` : ''}
                
                <div class="product-image">
                    <img src="${this.productData.image}" 
                         alt="${this.escapeHtml(this.productData.alt || this.productData.name)}" 
                         width="200" 
                         height="150" 
                         loading="lazy"
                         onerror="this.src='assets/images/fallback-product.png'">
                </div>
                
                <div class="product-info">
                    <h3 class="product-name">${this.escapeHtml(this.productData.name)}</h3>
                    
                    ${this.generatePricing()}
                    
                    ${this.productData.subtitle ? 
                        `<div class="product-subtitle">${this.escapeHtml(this.productData.subtitle)}</div>` : ''}
                    
                    ${this.generateFeatures()}
                    ${this.generateActions()}
                </div>
            </article>
        `;
        
        // Add event listeners for analytics
        this.addEventListeners();
    }

    addEventListeners() {
        const actionButtons = this.querySelectorAll('[data-action]');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                const productId = e.target.getAttribute('data-product-id');
                
                this.trackUserAction(action, productId);
            });
        });
    }

    trackComponentLoad(productId, variant) {
        if (typeof trackEvent === 'function') {
            trackEvent('product_card_load', {
                product_id: productId,
                variant: variant,
                category: 'component'
            });
        }
    }

    trackUserAction(action, productId) {
        if (typeof trackEvent === 'function') {
            trackEvent('product_card_action', {
                action: action,
                product_id: productId,
                category: 'user_interaction'
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    retry() {
        this.error = null;
        this.connectedCallback();
    }

    // Public API methods
    updateProduct(productData) {
        this.productData = productData;
        this.render();
    }

    getProductData() {
        return this.productData;
    }

    generateVariantSelector() {
        if (!this.productData?.variants) return '';
        
        return `
            <div class="product-variants">
                <label for="variant-${this.productData.product_id}">Choose Your Brand:</label>
                <select id="variant-${this.productData.product_id}" class="variant-selector">
                    ${this.productData.variants.map(variant => `
                        <option value="${variant.product_id}" data-price="${variant.pricing.current}">
                            ${variant.name} - ${variant.pricing.current}
                        </option>
                    `).join('')}
                </select>
            </div>
        `;
    }

    generateCompatibilityInfo() {
        if (!this.productData?.compatibility) return '';
        
        const { compatibility } = this.productData;
        
        return `
            <div class="compatibility-info">
                <h4>�� Compatibility</h4>
                <div class="compatibility-type">${compatibility.description}</div>
                ${compatibility.models ? `
                    <details class="compatible-models">
                        <summary>View Compatible Models</summary>
                        <ul>
                            ${compatibility.models.map(model => `<li>${model}</li>`).join('')}
                        </ul>
                    </details>
                ` : ''}
            </div>
        `;
    }
}

// Register the component
customElements.define('product-card', ProductCard);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductCard;
} 