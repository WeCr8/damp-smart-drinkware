/**
 * DAMP Smart Drinkware - Centralized Pricing Configuration
 * Handles all pricing logic, promotions, and dynamic updates
 * Following Google Developer best practices for maintainable code
 */

class DAMPPricingSystem {
    constructor() {
        this.config = {
            // Base product configurations
            products: {
                'damp-handle': {
                    id: 'damp-handle',
                    name: 'DAMP Handle v1.0',
                    description: 'Universal BLE attachment for existing mugs',
                    image: '/assets/images/products/damp-handle/damp-handle.png',
                    category: 'hardware',
                    inventory: 500,
                    pricing: {
                        base_price: 6999, // $69.99 in cents
                        pre_order_price: 4999, // $49.99 in cents
                        cost_price: 2500, // For profit calculations
                        currency: 'USD'
                    },
                    delivery: {
                        pre_order_delivery: 'Q3 2025',
                        standard_delivery: 'Q4 2025'
                    },
                    stripe_keys: {
                        pre_order: 'DAMP_HAN_V1_pre-order',
                        default: 'DAMP_HAN_V1_default'
                    }
                },
                'silicone-bottom': {
                    id: 'silicone-bottom',
                    name: 'DAMP Silicone Bottom',
                    description: 'Smart silicone base for any cup or mug',
                    image: '/assets/images/products/silicone-bottom/silicone-bottome.png',
                    category: 'hardware',
                    inventory: 800,
                    pricing: {
                        base_price: 3999, // $39.99 in cents
                        pre_order_price: 2999, // $29.99 in cents
                        cost_price: 1500,
                        currency: 'USD'
                    },
                    delivery: {
                        pre_order_delivery: 'Q4 2025',
                        standard_delivery: 'Q1 2026'
                    },
                    stripe_keys: {
                        pre_order: 'DAMP_SIL_BTM_pre-order',
                        default: 'DAMP_SIL_BTM_default'
                    }
                },
                'cup-sleeve': {
                    id: 'cup-sleeve',
                    name: 'DAMP Cup Sleeve',
                    description: 'Flexible smart sleeve for multiple cup sizes',
                    image: '/assets/images/products/cup-sleeve/cup-sleeve.png',
                    category: 'hardware',
                    inventory: 600,
                    pricing: {
                        base_price: 4499, // $44.99 in cents
                        pre_order_price: 3499, // $34.99 in cents
                        cost_price: 2000,
                        currency: 'USD'
                    },
                    delivery: {
                        pre_order_delivery: 'Q3 2025',
                        standard_delivery: 'Q4 2025'
                    },
                    stripe_keys: {
                        pre_order: 'DAMP_SLV_V1_pre-order',
                        default: 'DAMP_SLV_V1_default'
                    }
                },
                'baby-bottle': {
                    id: 'baby-bottle',
                    name: 'DAMP Baby Bottle',
                    description: 'BPA-free smart baby bottle with monitoring',
                    image: '/assets/images/products/baby-bottle/baby-bottle.png',
                    category: 'hardware',
                    inventory: 300,
                    pricing: {
                        base_price: 9999, // $99.99 in cents
                        pre_order_price: 7999, // $79.99 in cents
                        cost_price: 4000,
                        currency: 'USD'
                    },
                    delivery: {
                        pre_order_delivery: 'Q4 2025',
                        standard_delivery: 'Q1 2026'
                    },
                    stripe_keys: {
                        pre_order: 'DAMP_BBB_V1_pre-order',
                        default: 'DAMP_BBB_V1_default'
                    }
                }
            },
            
            // Pricing tiers and phases
            pricing_phases: {
                pre_order: {
                    active: true,
                    start_date: '2025-01-01T00:00:00Z',
                    end_date: '2025-06-30T23:59:59Z',
                    description: 'Early Bird Pre-Order Pricing',
                    badge: 'Early Bird Special'
                },
                launch: {
                    active: false,
                    start_date: '2025-07-01T00:00:00Z',
                    end_date: '2025-12-31T23:59:59Z',
                    description: 'Launch Pricing',
                    badge: 'Launch Special'
                },
                standard: {
                    active: false,
                    start_date: '2026-01-01T00:00:00Z',
                    end_date: null,
                    description: 'Standard Pricing',
                    badge: null
                }
            },

            // Promotional campaigns
            promotions: {
                'HOLIDAY2025': {
                    active: true,
                    type: 'percentage',
                    value: 15, // 15% off
                    min_order: 5000, // $50 minimum order
                    max_discount: 2000, // $20 maximum discount
                    start_date: '2025-12-01T00:00:00Z',
                    end_date: '2025-12-31T23:59:59Z',
                    description: 'Holiday Special - 15% off orders over $50',
                    applicable_products: ['damp-handle', 'silicone-bottom', 'cup-sleeve', 'baby-bottle'],
                    usage_limit: 1000,
                    usage_count: 0
                },
                'LAUNCH50': {
                    active: false,
                    type: 'fixed',
                    value: 5000, // $50 off
                    min_order: 10000, // $100 minimum order
                    max_discount: 5000,
                    start_date: '2025-07-01T00:00:00Z',
                    end_date: '2025-07-31T23:59:59Z',
                    description: 'Launch Special - $50 off orders over $100',
                    applicable_products: ['damp-handle', 'baby-bottle'],
                    usage_limit: 500,
                    usage_count: 0
                }
            },

            // Quantity discounts
            quantity_discounts: {
                'bulk_discount': {
                    active: true,
                    tiers: [
                        { min_quantity: 2, max_quantity: 3, discount_percent: 5 },
                        { min_quantity: 4, max_quantity: 9, discount_percent: 10 },
                        { min_quantity: 10, max_quantity: 99, discount_percent: 15 },
                        { min_quantity: 100, max_quantity: null, discount_percent: 20 }
                    ],
                    applicable_products: ['damp-handle', 'silicone-bottom', 'cup-sleeve']
                }
            },

            // Holiday and seasonal pricing
            seasonal_pricing: {
                'BLACK_FRIDAY': {
                    active: false,
                    start_date: '2025-11-29T00:00:00Z',
                    end_date: '2025-11-29T23:59:59Z',
                    discount_percent: 25,
                    applicable_products: ['damp-handle', 'silicone-bottom', 'cup-sleeve', 'baby-bottle']
                },
                'CYBER_MONDAY': {
                    active: false,
                    start_date: '2025-12-02T00:00:00Z',
                    end_date: '2025-12-02T23:59:59Z',
                    discount_percent: 30,
                    applicable_products: ['damp-handle', 'silicone-bottom', 'cup-sleeve', 'baby-bottle']
                }
            },

            // Bundle pricing
            bundles: {
                'starter_pack': {
                    active: true,
                    name: 'DAMP Starter Pack',
                    description: 'Get started with smart drinkware',
                    products: [
                        { id: 'damp-handle', quantity: 1 },
                        { id: 'silicone-bottom', quantity: 1 }
                    ],
                    bundle_price: 7499, // $74.99 instead of $79.98
                    savings: 499, // $4.99 savings
                    badge: 'Best Value'
                },
                'family_pack': {
                    active: true,
                    name: 'DAMP Family Pack',
                    description: 'Perfect for the whole family',
                    products: [
                        { id: 'damp-handle', quantity: 2 },
                        { id: 'baby-bottle', quantity: 1 },
                        { id: 'cup-sleeve', quantity: 1 }
                    ],
                    bundle_price: 14999, // $149.99 instead of $164.97
                    savings: 1498, // $14.98 savings
                    badge: 'Family Special'
                }
            },

            // Global settings
            settings: {
                currency: 'USD',
                tax_rate: 0.0875, // 8.75% default tax rate
                shipping_threshold: 7500, // Free shipping over $75
                shipping_cost: 599, // $5.99 standard shipping
                international_shipping: 1599, // $15.99 international shipping
                pre_order_active: true,
                pre_order_payment_type: 'authorize', // authorize vs charge
                last_updated: '2025-01-13T15:00:00Z'
            }
        };

        // Initialize the system
        this.init();
    }

    init() {
        // Set up automatic price updates
        this.setupPriceUpdates();
        
        // Initialize promo code system
        this.initPromoCodeSystem();
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('🎯 DAMP Pricing System initialized');
    }

    // Get current pricing phase
    getCurrentPricingPhase() {
        const now = new Date();
        
        for (const [phase, config] of Object.entries(this.config.pricing_phases)) {
            if (config.active) {
                const startDate = new Date(config.start_date);
                const endDate = config.end_date ? new Date(config.end_date) : null;
                
                if (now >= startDate && (!endDate || now <= endDate)) {
                    return { phase, config };
                }
            }
        }
        
        return { phase: 'standard', config: this.config.pricing_phases.standard };
    }

    // Get product price based on current phase and promotions
    getProductPrice(productId, quantity = 1, promoCode = null) {
        const product = this.config.products[productId];
        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        const currentPhase = this.getCurrentPricingPhase();
        let basePrice;

        // Determine base price based on current phase
        switch (currentPhase.phase) {
            case 'pre_order':
                basePrice = product.pricing.pre_order_price;
                break;
            case 'launch':
                basePrice = product.pricing.base_price * 0.9; // 10% launch discount
                break;
            default:
                basePrice = product.pricing.base_price;
        }

        let finalPrice = basePrice;
        let discounts = [];

        // Apply quantity discounts
        const quantityDiscount = this.getQuantityDiscount(productId, quantity);
        if (quantityDiscount) {
            const discount = Math.round(finalPrice * quantityDiscount.discount_percent / 100);
            finalPrice -= discount;
            discounts.push({
                type: 'quantity',
                description: `${quantityDiscount.discount_percent}% bulk discount`,
                amount: discount
            });
        }

        // Apply seasonal pricing
        const seasonalDiscount = this.getSeasonalDiscount(productId);
        if (seasonalDiscount) {
            const discount = Math.round(finalPrice * seasonalDiscount.discount_percent / 100);
            finalPrice -= discount;
            discounts.push({
                type: 'seasonal',
                description: `${seasonalDiscount.discount_percent}% seasonal discount`,
                amount: discount
            });
        }

        // Apply promo code
        if (promoCode) {
            const promoDiscount = this.applyPromoCode(promoCode, finalPrice * quantity);
            if (promoDiscount) {
                finalPrice -= Math.round(promoDiscount.amount / quantity);
                discounts.push({
                    type: 'promo',
                    description: promoDiscount.description,
                    amount: Math.round(promoDiscount.amount / quantity)
                });
            }
        }

        return {
            product_id: productId,
            product_name: product.name,
            quantity: quantity,
            base_price: basePrice,
            final_price: Math.max(finalPrice, Math.round(product.pricing.cost_price * 1.1)), // Never go below cost + 10%
            total_price: Math.max(finalPrice, Math.round(product.pricing.cost_price * 1.1)) * quantity,
            savings: Math.max(0, (basePrice - finalPrice) * quantity),
            discounts: discounts,
            pricing_phase: currentPhase.phase,
            phase_badge: currentPhase.config.badge,
            delivery_estimate: currentPhase.phase === 'pre_order' ? 
                product.delivery.pre_order_delivery : 
                product.delivery.standard_delivery,
            currency: product.pricing.currency
        };
    }

    // Get quantity discount for a product
    getQuantityDiscount(productId, quantity) {
        const product = this.config.products[productId];
        if (!product) return null;

        const discountConfig = this.config.quantity_discounts.bulk_discount;
        if (!discountConfig.active) return null;

        if (!discountConfig.applicable_products.includes(productId)) return null;

        for (const tier of discountConfig.tiers) {
            if (quantity >= tier.min_quantity && 
                (!tier.max_quantity || quantity <= tier.max_quantity)) {
                return tier;
            }
        }

        return null;
    }

    // Get seasonal discount for a product
    getSeasonalDiscount(productId) {
        const now = new Date();
        
        for (const [season, config] of Object.entries(this.config.seasonal_pricing)) {
            if (config.active && config.applicable_products.includes(productId)) {
                const startDate = new Date(config.start_date);
                const endDate = new Date(config.end_date);
                
                if (now >= startDate && now <= endDate) {
                    return config;
                }
            }
        }
        
        return null;
    }

    // Apply promo code
    applyPromoCode(code, orderTotal) {
        const promo = this.config.promotions[code.toUpperCase()];
        if (!promo) return null;

        if (!promo.active) return null;

        const now = new Date();
        const startDate = new Date(promo.start_date);
        const endDate = new Date(promo.end_date);

        if (now < startDate || now > endDate) return null;

        if (orderTotal < promo.min_order) return null;

        if (promo.usage_count >= promo.usage_limit) return null;

        let discountAmount;
        if (promo.type === 'percentage') {
            discountAmount = Math.round(orderTotal * promo.value / 100);
        } else if (promo.type === 'fixed') {
            discountAmount = promo.value;
        }

        // Apply maximum discount limit
        discountAmount = Math.min(discountAmount, promo.max_discount);

        return {
            code: code.toUpperCase(),
            type: promo.type,
            amount: discountAmount,
            description: promo.description
        };
    }

    // Get bundle pricing
    getBundlePrice(bundleId) {
        const bundle = this.config.bundles[bundleId];
        if (!bundle || !bundle.active) return null;

        let regularTotal = 0;
        let bundleItems = [];

        for (const item of bundle.products) {
            const productPrice = this.getProductPrice(item.id, item.quantity);
            regularTotal += productPrice.total_price;
            bundleItems.push({
                ...productPrice,
                bundle_quantity: item.quantity
            });
        }

        return {
            bundle_id: bundleId,
            bundle_name: bundle.name,
            bundle_description: bundle.description,
            items: bundleItems,
            regular_total: regularTotal,
            bundle_price: bundle.bundle_price,
            savings: bundle.savings,
            badge: bundle.badge
        };
    }

    // Setup automatic price updates
    setupPriceUpdates() {
        // Update prices every minute to catch time-sensitive promotions
        setInterval(() => {
            this.updateAllPrices();
        }, 60000);

        // Update immediately on page load
        this.updateAllPrices();
    }

    // Update all prices on the page
    updateAllPrices() {
        const priceElements = document.querySelectorAll('[data-product-price]');
        priceElements.forEach(element => {
            const productId = element.dataset.productId;
            const quantity = parseInt(element.dataset.quantity) || 1;
            const priceType = element.dataset.priceType || 'final';
            
            if (productId) {
                const pricing = this.getProductPrice(productId, quantity);
                this.updatePriceElement(element, pricing, priceType);
            }
        });

        // Update bundle prices
        const bundleElements = document.querySelectorAll('[data-bundle-price]');
        bundleElements.forEach(element => {
            const bundleId = element.dataset.bundleId;
            if (bundleId) {
                const bundlePricing = this.getBundlePrice(bundleId);
                if (bundlePricing) {
                    this.updateBundleElement(element, bundlePricing);
                }
            }
        });

        // Dispatch price update event
        window.dispatchEvent(new CustomEvent('damp:pricesUpdated', {
            detail: { timestamp: new Date().toISOString() }
        }));
    }

    // Update individual price element
    updatePriceElement(element, pricing, priceType) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: pricing.currency
        });

        let displayPrice;
        switch (priceType) {
            case 'base':
                displayPrice = pricing.base_price;
                break;
            case 'total':
                displayPrice = pricing.total_price;
                break;
            default:
                displayPrice = pricing.final_price;
        }

        element.textContent = formatter.format(displayPrice / 100);
        element.dataset.lastUpdated = new Date().toISOString();
    }

    // Update bundle element
    updateBundleElement(element, bundlePricing) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        });

        element.textContent = formatter.format(bundlePricing.bundle_price / 100);
        element.dataset.lastUpdated = new Date().toISOString();
    }

    // Initialize promo code system
    initPromoCodeSystem() {
        // Set up promo code input handlers
        const promoInputs = document.querySelectorAll('[data-promo-input]');
        promoInputs.forEach(input => {
            input.addEventListener('input', this.handlePromoCodeInput.bind(this));
        });

        const promoButtons = document.querySelectorAll('[data-promo-apply]');
        promoButtons.forEach(button => {
            button.addEventListener('click', this.handlePromoCodeApply.bind(this));
        });
    }

    // Handle promo code input
    handlePromoCodeInput(event) {
        const code = event.target.value.toUpperCase();
        const button = document.querySelector(`[data-promo-apply="${event.target.dataset.promoInput}"]`);
        
        if (button) {
            button.disabled = code.length < 3;
        }
    }

    // Handle promo code apply
    handlePromoCodeApply(event) {
        const inputId = event.target.dataset.promoApply;
        const input = document.querySelector(`[data-promo-input="${inputId}"]`);
        
        if (input) {
            const code = input.value.trim();
            this.validateAndApplyPromoCode(code);
        }
    }

    // Validate and apply promo code
    validateAndApplyPromoCode(code) {
        // This would typically make an API call to validate the code
        // For now, we'll use the local validation
        
        // Get current cart total (this should be dynamic based on your cart system)
        const cartTotal = this.getCurrentCartTotal();
        
        const promoResult = this.applyPromoCode(code, cartTotal);
        
        if (promoResult) {
            // Code is valid
            this.showPromoSuccess(promoResult);
            this.updateCartWithPromo(promoResult);
        } else {
            // Code is invalid
            this.showPromoError('Invalid or expired promo code');
        }
    }

    // Show promo success message
    showPromoSuccess(promoResult) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        });

        const message = `Promo code applied! You saved ${formatter.format(promoResult.amount / 100)}`;
        this.showNotification(message, 'success');
    }

    // Show promo error message
    showPromoError(message) {
        this.showNotification(message, 'error');
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `pricing-notification pricing-notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Get current cart total (placeholder - should integrate with actual cart)
    getCurrentCartTotal() {
        // This should be replaced with actual cart integration
        return 10000; // $100 placeholder
    }

    // Update cart with promo
    updateCartWithPromo(promoResult) {
        // This should integrate with your cart system
        console.log('Applying promo to cart:', promoResult);
        
        // Dispatch event for cart to listen to
        window.dispatchEvent(new CustomEvent('damp:promoApplied', {
            detail: promoResult
        }));
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for cart updates
        window.addEventListener('damp:cartUpdated', (event) => {
            this.updateAllPrices();
        });

        // Listen for admin price updates
        window.addEventListener('damp:pricesChanged', (event) => {
            this.reloadPricing();
        });
    }

    // Reload pricing from server (for admin updates)
    async reloadPricing() {
        try {
            const response = await fetch('/api/pricing/config');
            const newConfig = await response.json();
            this.config = newConfig;
            this.updateAllPrices();
            console.log('✅ Pricing configuration reloaded');
        } catch (error) {
            console.error('❌ Failed to reload pricing:', error);
        }
    }

    // Get all products with pricing
    getAllProducts() {
        return Object.values(this.config.products).map(product => ({
            ...product,
            pricing: this.getProductPrice(product.id)
        }));
    }

    // Get active promotions
    getActivePromotions() {
        const now = new Date();
        return Object.entries(this.config.promotions)
            .filter(([code, promo]) => {
                if (!promo.active) return false;
                const startDate = new Date(promo.start_date);
                const endDate = new Date(promo.end_date);
                return now >= startDate && now <= endDate;
            })
            .map(([code, promo]) => ({ code, ...promo }));
    }

    // Public API methods
    formatPrice(cents, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(cents / 100);
    }

    // Export configuration for admin panel
    exportConfig() {
        return JSON.stringify(this.config, null, 2);
    }

    // Import configuration from admin panel
    importConfig(configJson) {
        try {
            const newConfig = JSON.parse(configJson);
            this.config = newConfig;
            this.updateAllPrices();
            return true;
        } catch (error) {
            console.error('Failed to import configuration:', error);
            return false;
        }
    }
}

// Initialize global pricing system
window.DAMPPricing = new DAMPPricingSystem();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPPricingSystem;
} 