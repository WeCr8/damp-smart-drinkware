/**
 * DAMP Smart Drinkware - Pricing API
 * Handles all pricing logic, promotions, and real-time updates
 * Following Google Developer best practices for API design
 */

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// In-memory cache for pricing config (in production, use Redis)
let pricingConfigCache = null;
let lastConfigUpdate = null;

// Load pricing configuration
async function loadPricingConfig() {
    try {
        const configPath = path.join(__dirname, '../../../website/assets/js/pricing-config.js');
        const configContent = await fs.readFile(configPath, 'utf-8');
        
        // Extract the config object from the JavaScript file
        const configMatch = configContent.match(/this\.config\s*=\s*({[\s\S]*?});/);
        if (configMatch) {
            // Parse the configuration (this is a simplified approach)
            // In production, you'd want to have a separate JSON config file
            const configString = configMatch[1];
            // For now, we'll use a hardcoded config object
            pricingConfigCache = getDefaultPricingConfig();
            lastConfigUpdate = new Date();
        }
    } catch (error) {
        console.error('Error loading pricing config:', error);
        pricingConfigCache = getDefaultPricingConfig();
        lastConfigUpdate = new Date();
    }
}

// Get default pricing configuration
function getDefaultPricingConfig() {
    return {
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
                    cost_price: 2500,
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
            }
        },
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
        promotions: {
            'HOLIDAY2025': {
                active: true,
                type: 'percentage',
                value: 15,
                min_order: 5000,
                max_discount: 2000,
                start_date: '2025-12-01T00:00:00Z',
                end_date: '2025-12-31T23:59:59Z',
                description: 'Holiday Special - 15% off orders over $50',
                applicable_products: ['damp-handle', 'silicone-bottom', 'cup-sleeve'],
                usage_limit: 1000,
                usage_count: 0
            },
            'LAUNCH50': {
                active: false,
                type: 'fixed',
                value: 5000,
                min_order: 10000,
                max_discount: 5000,
                start_date: '2025-07-01T00:00:00Z',
                end_date: '2025-07-31T23:59:59Z',
                description: 'Launch Special - $50 off orders over $100',
                applicable_products: ['damp-handle'],
                usage_limit: 500,
                usage_count: 0
            }
        },
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
        seasonal_pricing: {
            'BLACK_FRIDAY': {
                active: false,
                start_date: '2025-11-29T00:00:00Z',
                end_date: '2025-11-29T23:59:59Z',
                discount_percent: 25,
                applicable_products: ['damp-handle', 'silicone-bottom', 'cup-sleeve']
            },
            'CYBER_MONDAY': {
                active: false,
                start_date: '2025-12-02T00:00:00Z',
                end_date: '2025-12-02T23:59:59Z',
                discount_percent: 30,
                applicable_products: ['damp-handle', 'silicone-bottom', 'cup-sleeve']
            }
        },
        bundles: {
            'starter_pack': {
                active: true,
                name: 'DAMP Starter Pack',
                description: 'Get started with smart drinkware',
                products: [
                    { id: 'damp-handle', quantity: 1 },
                    { id: 'silicone-bottom', quantity: 1 }
                ],
                bundle_price: 7499,
                savings: 499,
                badge: 'Best Value'
            }
        },
        settings: {
            currency: 'USD',
            tax_rate: 0.0875,
            shipping_threshold: 7500,
            shipping_cost: 599,
            international_shipping: 1599,
            pre_order_active: true,
            pre_order_payment_type: 'authorize',
            last_updated: new Date().toISOString()
        }
    };
}

// Initialize pricing config on startup
loadPricingConfig();

// Middleware to ensure pricing config is loaded
function ensurePricingConfig(req, res, next) {
    if (!pricingConfigCache) {
        loadPricingConfig();
    }
    next();
}

// GET /api/pricing/config - Get full pricing configuration
router.get('/config', ensurePricingConfig, (req, res) => {
    try {
        res.json({
            success: true,
            config: pricingConfigCache,
            last_updated: lastConfigUpdate
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to load pricing configuration',
            details: error.message
        });
    }
});

// GET /api/pricing/products - Get all products with current pricing
router.get('/products', ensurePricingConfig, (req, res) => {
    try {
        const products = Object.values(pricingConfigCache.products).map(product => ({
            ...product,
            current_pricing: calculateCurrentPricing(product.id, 1)
        }));

        res.json({
            success: true,
            products: products,
            pricing_phase: getCurrentPricingPhase()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get products',
            details: error.message
        });
    }
});

// GET /api/pricing/product/:id - Get specific product pricing
router.get('/product/:id', ensurePricingConfig, (req, res) => {
    try {
        const { id } = req.params;
        const { quantity = 1, promo_code } = req.query;

        const product = pricingConfigCache.products[id];
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        const pricing = calculateCurrentPricing(id, parseInt(quantity), promo_code);

        res.json({
            success: true,
            product: {
                ...product,
                current_pricing: pricing
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get product pricing',
            details: error.message
        });
    }
});

// POST /api/pricing/validate-promo - Validate promo code
router.post('/validate-promo', ensurePricingConfig, (req, res) => {
    try {
        const { code, order_total } = req.body;

        if (!code || !order_total) {
            return res.status(400).json({
                success: false,
                error: 'Code and order_total are required'
            });
        }

        const promoResult = validatePromoCode(code, order_total);

        if (promoResult.valid) {
            res.json({
                success: true,
                valid: true,
                discount: promoResult.discount,
                description: promoResult.description
            });
        } else {
            res.json({
                success: true,
                valid: false,
                error: promoResult.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to validate promo code',
            details: error.message
        });
    }
});

// POST /api/pricing/apply-promo - Apply promo code (increments usage count)
router.post('/apply-promo', ensurePricingConfig, (req, res) => {
    try {
        const { code, order_total } = req.body;

        if (!code || !order_total) {
            return res.status(400).json({
                success: false,
                error: 'Code and order_total are required'
            });
        }

        const promoResult = applyPromoCode(code, order_total);

        if (promoResult.valid) {
            res.json({
                success: true,
                applied: true,
                discount: promoResult.discount,
                description: promoResult.description
            });
        } else {
            res.json({
                success: true,
                applied: false,
                error: promoResult.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to apply promo code',
            details: error.message
        });
    }
});

// GET /api/pricing/promotions - Get active promotions
router.get('/promotions', ensurePricingConfig, (req, res) => {
    try {
        const activePromotions = getActivePromotions();

        res.json({
            success: true,
            promotions: activePromotions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get promotions',
            details: error.message
        });
    }
});

// GET /api/pricing/bundles - Get available bundles
router.get('/bundles', ensurePricingConfig, (req, res) => {
    try {
        const bundles = Object.entries(pricingConfigCache.bundles)
            .filter(([_, bundle]) => bundle.active)
            .map(([id, bundle]) => ({
                id,
                ...bundle,
                pricing: calculateBundlePricing(id)
            }));

        res.json({
            success: true,
            bundles: bundles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get bundles',
            details: error.message
        });
    }
});

// POST /api/pricing/calculate-cart - Calculate cart total with all discounts
router.post('/calculate-cart', ensurePricingConfig, (req, res) => {
    try {
        const { items, promo_code } = req.body;

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                error: 'Items array is required'
            });
        }

        const cartCalculation = calculateCartTotal(items, promo_code);

        res.json({
            success: true,
            calculation: cartCalculation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to calculate cart',
            details: error.message
        });
    }
});

// ADMIN ROUTES (would need authentication in production)

// PUT /api/pricing/admin/config - Update pricing configuration
router.put('/admin/config', ensurePricingConfig, (req, res) => {
    try {
        const { config } = req.body;

        if (!config) {
            return res.status(400).json({
                success: false,
                error: 'Configuration is required'
            });
        }

        // Validate configuration structure
        if (!validatePricingConfig(config)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid configuration structure'
            });
        }

        // Update cache
        pricingConfigCache = {
            ...config,
            settings: {
                ...config.settings,
                last_updated: new Date().toISOString()
            }
        };
        lastConfigUpdate = new Date();

        // In production, you would save to database here
        
        res.json({
            success: true,
            message: 'Configuration updated successfully',
            last_updated: lastConfigUpdate
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update configuration',
            details: error.message
        });
    }
});

// POST /api/pricing/admin/promotion - Create/update promotion
router.post('/admin/promotion', ensurePricingConfig, (req, res) => {
    try {
        const { code, promotion } = req.body;

        if (!code || !promotion) {
            return res.status(400).json({
                success: false,
                error: 'Code and promotion details are required'
            });
        }

        // Validate promotion structure
        if (!validatePromotionStructure(promotion)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid promotion structure'
            });
        }

        // Update promotion
        pricingConfigCache.promotions[code.toUpperCase()] = promotion;
        lastConfigUpdate = new Date();

        res.json({
            success: true,
            message: 'Promotion updated successfully',
            code: code.toUpperCase()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update promotion',
            details: error.message
        });
    }
});

// Helper functions

function getCurrentPricingPhase() {
    const now = new Date();
    
    for (const [phase, config] of Object.entries(pricingConfigCache.pricing_phases)) {
        if (config.active) {
            const startDate = new Date(config.start_date);
            const endDate = config.end_date ? new Date(config.end_date) : null;
            
            if (now >= startDate && (!endDate || now <= endDate)) {
                return { phase, config };
            }
        }
    }
    
    return { phase: 'standard', config: pricingConfigCache.pricing_phases.standard };
}

function calculateCurrentPricing(productId, quantity = 1, promoCode = null) {
    const product = pricingConfigCache.products[productId];
    if (!product) {
        throw new Error(`Product ${productId} not found`);
    }

    const currentPhase = getCurrentPricingPhase();
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
    const quantityDiscount = getQuantityDiscount(productId, quantity);
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
    const seasonalDiscount = getSeasonalDiscount(productId);
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
        const promoDiscount = validatePromoCode(promoCode, finalPrice * quantity);
        if (promoDiscount.valid) {
            finalPrice -= Math.round(promoDiscount.discount.amount / quantity);
            discounts.push({
                type: 'promo',
                description: promoDiscount.discount.description,
                amount: Math.round(promoDiscount.discount.amount / quantity)
            });
        }
    }

    return {
        product_id: productId,
        quantity: quantity,
        base_price: basePrice,
        final_price: Math.max(finalPrice, Math.round(product.pricing.cost_price * 1.1)),
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

function getQuantityDiscount(productId, quantity) {
    const product = pricingConfigCache.products[productId];
    if (!product) return null;

    const discountConfig = pricingConfigCache.quantity_discounts.bulk_discount;
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

function getSeasonalDiscount(productId) {
    const now = new Date();
    
    for (const [season, config] of Object.entries(pricingConfigCache.seasonal_pricing)) {
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

function validatePromoCode(code, orderTotal) {
    const promo = pricingConfigCache.promotions[code.toUpperCase()];
    if (!promo) {
        return { valid: false, error: 'Invalid promo code' };
    }

    if (!promo.active) {
        return { valid: false, error: 'Promo code is not active' };
    }

    const now = new Date();
    const startDate = new Date(promo.start_date);
    const endDate = new Date(promo.end_date);

    if (now < startDate || now > endDate) {
        return { valid: false, error: 'Promo code has expired' };
    }

    if (orderTotal < promo.min_order) {
        return { valid: false, error: `Minimum order of $${(promo.min_order / 100).toFixed(2)} required` };
    }

    if (promo.usage_count >= promo.usage_limit) {
        return { valid: false, error: 'Promo code usage limit reached' };
    }

    let discountAmount;
    if (promo.type === 'percentage') {
        discountAmount = Math.round(orderTotal * promo.value / 100);
    } else if (promo.type === 'fixed') {
        discountAmount = promo.value;
    }

    discountAmount = Math.min(discountAmount, promo.max_discount);

    return {
        valid: true,
        discount: {
            code: code.toUpperCase(),
            type: promo.type,
            amount: discountAmount,
            description: promo.description
        }
    };
}

function applyPromoCode(code, orderTotal) {
    const validation = validatePromoCode(code, orderTotal);
    if (!validation.valid) {
        return validation;
    }

    // Increment usage count
    pricingConfigCache.promotions[code.toUpperCase()].usage_count += 1;
    
    return validation;
}

function getActivePromotions() {
    const now = new Date();
    return Object.entries(pricingConfigCache.promotions)
        .filter(([code, promo]) => {
            if (!promo.active) return false;
            const startDate = new Date(promo.start_date);
            const endDate = new Date(promo.end_date);
            return now >= startDate && now <= endDate;
        })
        .map(([code, promo]) => ({ code, ...promo }));
}

function calculateBundlePricing(bundleId) {
    const bundle = pricingConfigCache.bundles[bundleId];
    if (!bundle || !bundle.active) return null;

    let regularTotal = 0;
    let bundleItems = [];

    for (const item of bundle.products) {
        const productPrice = calculateCurrentPricing(item.id, item.quantity);
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

function calculateCartTotal(items, promoCode = null) {
    let subtotal = 0;
    let itemsWithPricing = [];

    // Calculate individual items
    items.forEach(item => {
        const pricing = calculateCurrentPricing(item.product_id, item.quantity);
        subtotal += pricing.total_price;
        itemsWithPricing.push({
            ...item,
            pricing: pricing
        });
    });

    // Apply promo code to total
    let promoDiscount = null;
    if (promoCode) {
        const promoResult = validatePromoCode(promoCode, subtotal);
        if (promoResult.valid) {
            promoDiscount = promoResult.discount;
            subtotal -= promoDiscount.amount;
        }
    }

    // Calculate shipping
    const shippingThreshold = pricingConfigCache.settings.shipping_threshold;
    const shippingCost = subtotal >= shippingThreshold ? 0 : pricingConfigCache.settings.shipping_cost;

    // Calculate tax (if applicable)
    const taxAmount = 0; // Pre-order, no tax until shipping

    const total = subtotal + shippingCost + taxAmount;

    return {
        items: itemsWithPricing,
        subtotal: subtotal,
        promo_discount: promoDiscount,
        shipping_cost: shippingCost,
        tax_amount: taxAmount,
        total: total,
        currency: pricingConfigCache.settings.currency
    };
}

function validatePricingConfig(config) {
    // Basic validation - in production, use a proper schema validator
    return config.products && config.pricing_phases && config.promotions && config.settings;
}

function validatePromotionStructure(promotion) {
    // Basic validation
    return promotion.type && promotion.value && promotion.start_date && promotion.end_date;
}

module.exports = router; 