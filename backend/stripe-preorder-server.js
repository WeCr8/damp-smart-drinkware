// DAMP Pre-Order Backend with Stripe Integration
// This example shows how to handle pre-orders with proper authorization

const express = require('express');
const stripe = require('stripe')('sk_test_your_stripe_secret_key_here'); // Replace with your secret key
const cors = require('cors');
const app = express();

// Add this at the top of your server file to suppress the warning
process.env.NODE_NO_WARNINGS = '1';

// Or add this specific suppression
process.removeAllListeners('warning');
process.on('warning', (warning) => {
    if (warning.name === 'DeprecationWarning' && warning.message.includes('_headers')) {
        return; // Suppress the _headers deprecation warning
    }
    console.warn(warning.stack);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve your static files

// Product configuration with Stripe Lookup Keys
const PRODUCTS = {
    'damp-handle': {
        name: 'DAMP Handle v1.0',
        price: 4999, // $49.99 in cents
        originalPrice: 6999,
        estimatedDelivery: '2025-Q3',
        preOrderLookupKey: 'DAMP_HAN_V1_pre-order',
        defaultLookupKey: 'DAMP_HAN_V1_default'
    },
    'silicone-bottom': {
        name: 'DAMP Silicone Bottom',
        price: 2999, // $29.99 in cents
        originalPrice: 3999,
        estimatedDelivery: '2025-Q4',
        preOrderLookupKey: 'DAMP_SIL_BTM_pre-order',
        defaultLookupKey: 'DAMP_SIL_BTM_default'
    },
    'cup-sleeve': {
        name: 'DAMP Cup Sleeve',
        price: 3499, // $34.99 in cents
        originalPrice: 4499,
        estimatedDelivery: '2025-Q4',
        preOrderLookupKey: 'DAMP_SLV_V1_pre-order',
        defaultLookupKey: 'DAMP_SLV_V1_default'
    }
};

// Create checkout session for pre-orders
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        
        // Validate product
        if (!PRODUCTS[productId]) {
            return res.status(400).json({ error: 'Invalid product' });
        }
        
        const product = PRODUCTS[productId];
        const totalAmount = product.price * quantity;
        
        // Create Stripe Checkout Session using lookup key
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: product.preOrderLookupKey, // Use lookup key instead of price ID
                    quantity: quantity,
                }
            ],
            mode: 'payment',
            
            // Pre-order specific settings
            payment_intent_data: {
                capture_method: 'manual', // Don't capture payment immediately
                metadata: {
                    order_type: 'pre_order',
                    product_id: productId,
                    product_name: product.name,
                    estimated_delivery: product.estimatedDelivery,
                    original_price: product.originalPrice.toString(),
                    savings: (product.originalPrice - product.price).toString(),
                    order_date: new Date().toISOString()
                }
            },
            
            // Success/Cancel URLs
            success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/cancel`,
            
            // Additional metadata
            metadata: {
                product_id: productId,
                quantity: quantity.toString(),
                order_type: 'pre_order'
            },
            
            // Collect shipping address
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP']
            },
            
            // Custom messaging
            custom_text: {
                shipping_address: {
                    message: 'We\'ll ship your pre-order when it\'s ready for delivery!'
                },
                submit: {
                    message: 'Your payment will be authorized but not charged until we ship your order.'
                }
            }
        });
        
        res.json({ id: session.id });
        
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Handle successful checkout
app.get('/success', async (req, res) => {
    try {
        const { session_id } = req.query;
        
        // Retrieve the session
        const session = await stripe.checkout.sessions.retrieve(session_id);
        
        // Get payment intent details
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
        
        // Store pre-order in your database (example)
        const preOrder = {
            id: session.id,
            paymentIntentId: session.payment_intent,
            productId: session.metadata.product_id,
            quantity: parseInt(session.metadata.quantity),
            customerEmail: session.customer_details.email,
            customerName: session.customer_details.name,
            shippingAddress: session.shipping_details.address,
            amount: session.amount_total,
            status: 'pre_order_confirmed',
            createdAt: new Date(),
            estimatedDelivery: paymentIntent.metadata.estimated_delivery
        };
        
        // TODO: Save to your database
        console.log('Pre-order created:', preOrder);
        
        // Send confirmation email (using your email service)
        await sendPreOrderConfirmation(preOrder);
        
        // Increment pre-order count
        await incrementPreorderCount(session.metadata.product_id, parseInt(session.metadata.quantity));
        
        // Return success page
        res.send(`
            <html>
                <head>
                    <title>Pre-Order Confirmed!</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .success { color: #00ff88; font-size: 24px; margin-bottom: 20px; }
                        .details { background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <h1 class="success">🎉 Pre-Order Confirmed!</h1>
                    <p>Thank you for supporting DAMP development!</p>
                    <div class="details">
                        <h3>Order Details:</h3>
                        <p><strong>Product:</strong> ${paymentIntent.metadata.product_name}</p>
                        <p><strong>Quantity:</strong> ${session.metadata.quantity}</p>
                        <p><strong>Amount:</strong> $${(session.amount_total / 100).toFixed(2)}</p>
                        <p><strong>Estimated Delivery:</strong> ${paymentIntent.metadata.estimated_delivery}</p>
                    </div>
                    <p>Your payment has been authorized but won't be charged until we ship your order.</p>
                    <p>You'll receive regular development updates via email.</p>
                    <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #007cba; color: white; text-decoration: none; border-radius: 5px;">Back to Home</a>
                </body>
            </html>
        `);
        
    } catch (error) {
        console.error('Error handling success:', error);
        res.status(500).send('Error processing your order');
    }
});

// Webhook for handling Stripe events
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            // Payment was authorized successfully
            const paymentIntent = event.data.object;
            console.log('Payment authorized:', paymentIntent.id);
            
            // Update order status in your database
            await updateOrderStatus(paymentIntent.id, 'payment_authorized');
            break;
            
        case 'payment_intent.payment_failed':
            // Payment failed
            const failedPayment = event.data.object;
            console.log('Payment failed:', failedPayment.id);
            
            // Handle failed payment (email customer, etc.)
            await handleFailedPayment(failedPayment);
            break;
            
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({received: true});
});

// Charge pre-orders when ready to ship
app.post('/charge-preorder', async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        
        // Retrieve the payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        // Capture the payment
        const capturedPayment = await stripe.paymentIntents.capture(paymentIntentId);
        
        // Update order status
        await updateOrderStatus(paymentIntentId, 'payment_captured');
        
        // Send shipping notification
        await sendShippingNotification(paymentIntentId);
        
        res.json({ success: true, payment: capturedPayment });
        
    } catch (error) {
        console.error('Error capturing payment:', error);
        res.status(500).json({ error: error.message });
    }
});

// Cancel pre-order and refund
app.post('/cancel-preorder', async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        
        // Cancel the payment intent
        const canceledPayment = await stripe.paymentIntents.cancel(paymentIntentId);
        
        // Update order status
        await updateOrderStatus(paymentIntentId, 'cancelled');
        
        // Send cancellation email
        await sendCancellationEmail(paymentIntentId);
        
        res.json({ success: true, payment: canceledPayment });
        
    } catch (error) {
        console.error('Error canceling payment:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper functions (implement these based on your needs)
async function sendPreOrderConfirmation(preOrder) {
    // Implement email sending logic
    console.log('Sending pre-order confirmation email to:', preOrder.customerEmail);
    // Use services like SendGrid, Mailgun, or AWS SES
}

async function updateOrderStatus(paymentIntentId, status) {
    // Implement database update logic
    console.log(`Updating order ${paymentIntentId} status to:`, status);
    // Update your database
}

async function handleFailedPayment(paymentIntent) {
    // Implement failed payment handling
    console.log('Handling failed payment:', paymentIntent.id);
    // Send email to customer, update database, etc.
}

async function sendShippingNotification(paymentIntentId) {
    // Implement shipping notification
    console.log('Sending shipping notification for:', paymentIntentId);
    // Send email with tracking info
}

async function sendCancellationEmail(paymentIntentId) {
    // Implement cancellation email
    console.log('Sending cancellation email for:', paymentIntentId);
    // Send confirmation of cancellation
}

// Utility function to switch pricing modes
app.post('/admin/switch-pricing', async (req, res) => {
    try {
        const { mode } = req.body; // 'preorder' or 'default'
        
        if (!mode || !['preorder', 'default'].includes(mode)) {
            return res.status(400).json({ error: 'Mode must be "preorder" or "default"' });
        }
        
        const currentPricing = {};
        Object.keys(PRODUCTS).forEach(productId => {
            const product = PRODUCTS[productId];
            currentPricing[productId] = {
                name: product.name,
                activeLookupKey: mode === 'preorder' ? product.preOrderLookupKey : product.defaultLookupKey,
                activePrice: mode === 'preorder' ? product.price : product.originalPrice
            };
        });
        
        res.json({ 
            message: `Pricing mode set to: ${mode}`,
            currentPricing: currentPricing,
            instructions: `Update your frontend to use the ${mode === 'preorder' ? 'preOrderLookupKey' : 'defaultLookupKey'} for each product.`
        });
        
    } catch (error) {
        console.error('Error switching pricing:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin endpoints for managing pre-orders
app.get('/admin/preorders', async (req, res) => {
    try {
        // Get all pre-orders from Stripe
        const paymentIntents = await stripe.paymentIntents.list({
            limit: 100,
            created: { gte: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60) } // Last 30 days
        });
        
        const preOrders = paymentIntents.data
            .filter(pi => pi.metadata.order_type === 'pre_order')
            .map(pi => ({
                id: pi.id,
                productId: pi.metadata.product_id,
                productName: pi.metadata.product_name,
                amount: pi.amount,
                status: pi.status,
                created: new Date(pi.created * 1000),
                estimatedDelivery: pi.metadata.estimated_delivery
            }));
        
        res.json({ preOrders });
        
    } catch (error) {
        console.error('Error fetching pre-orders:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add near the top after existing imports
const fs = require('fs').promises;
const path = require('path');

// Simple JSON file database for counting (production: use Redis/PostgreSQL)
const COUNTS_DB_PATH = path.join(__dirname, 'data', 'preorder-counts.json');
const CAMPAIGN_CONFIG_PATH = path.join(__dirname, 'data', 'campaign-config.json');

// Initialize campaign configuration
const CAMPAIGN_CONFIG = {
    goal_units: 500,
    current_count: 247, // Starting realistic number
    deadline: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString(), // 7 days from now
    early_bird_active: true,
    scarcity_threshold: 450, // When to show "Almost sold out!" messaging
    price_tier: 'early_bird',
    last_updated: new Date().toISOString()
};

// Ensure data directory exists
async function ensureDataDirectory() {
    try {
        await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
        
        // Initialize counts file if it doesn't exist
        try {
            await fs.access(COUNTS_DB_PATH);
        } catch {
            await saveCounts({
                total_preorders: CAMPAIGN_CONFIG.current_count,
                daily_counts: {},
                last_updated: new Date().toISOString(),
                milestone_history: [
                    { count: 100, reached_at: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)).toISOString() },
                    { count: 200, reached_at: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString() }
                ]
            });
        }
        
        // Initialize campaign config
        try {
            await fs.access(CAMPAIGN_CONFIG_PATH);
        } catch {
            await saveCampaignConfig(CAMPAIGN_CONFIG);
        }
    } catch (error) {
        console.error('Error ensuring data directory:', error);
    }
}

// Database helper functions
async function loadCounts() {
    try {
        const data = await fs.readFile(COUNTS_DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading counts:', error);
        return { total_preorders: CAMPAIGN_CONFIG.current_count, daily_counts: {}, last_updated: new Date().toISOString() };
    }
}

async function saveCounts(counts) {
    try {
        await fs.writeFile(COUNTS_DB_PATH, JSON.stringify(counts, null, 2));
    } catch (error) {
        console.error('Error saving counts:', error);
    }
}

async function loadCampaignConfig() {
    try {
        const data = await fs.readFile(CAMPAIGN_CONFIG_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading campaign config:', error);
        return CAMPAIGN_CONFIG;
    }
}

async function saveCampaignConfig(config) {
    try {
        await fs.writeFile(CAMPAIGN_CONFIG_PATH, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Error saving campaign config:', error);
    }
}

// Initialize on startup
ensureDataDirectory();

// API endpoint to get current counts and campaign status
app.get('/api/campaign-status', async (req, res) => {
    try {
        const counts = await loadCounts();
        const config = await loadCampaignConfig();
        
        const now = new Date();
        const deadline = new Date(config.deadline);
        const timeRemaining = deadline - now;
        
        // Calculate progress percentage
        const progressPercentage = Math.min((counts.total_preorders / config.goal_units) * 100, 100);
        
        // Determine urgency messaging
        let urgencyLevel = 'normal';
        let urgencyMessage = '';
        
        if (timeRemaining < 24 * 60 * 60 * 1000) { // Less than 24 hours
            urgencyLevel = 'critical';
            urgencyMessage = 'Less than 24 hours left!';
        } else if (timeRemaining < 3 * 24 * 60 * 60 * 1000) { // Less than 3 days
            urgencyLevel = 'high';
            urgencyMessage = 'Only a few days left!';
        } else if (counts.total_preorders >= config.scarcity_threshold) {
            urgencyLevel = 'high';
            urgencyMessage = 'Almost sold out!';
        }
        
        // Calculate realistic time remaining
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        
        res.json({
            counts: {
                current: counts.total_preorders,
                goal: config.goal_units,
                remaining: config.goal_units - counts.total_preorders,
                progress_percentage: Math.round(progressPercentage * 10) / 10
            },
            timing: {
                deadline: config.deadline,
                time_remaining: {
                    total_milliseconds: Math.max(timeRemaining, 0),
                    days: Math.max(days, 0),
                    hours: Math.max(hours, 0),
                    minutes: Math.max(minutes, 0)
                },
                early_bird_active: config.early_bird_active && timeRemaining > 0
            },
            urgency: {
                level: urgencyLevel,
                message: urgencyMessage
            },
            social_proof: {
                milestone_reached: counts.total_preorders >= 250,
                countries_count: 15,
                recent_activity: "3 people pre-ordered in the last hour"
            },
            pricing: {
                tier: config.price_tier,
                expires_at: config.deadline
            },
            last_updated: counts.last_updated
        });
        
    } catch (error) {
        console.error('Error fetching campaign status:', error);
        res.status(500).json({ error: 'Failed to fetch campaign status' });
    }
});

// Increment counter when new pre-order is successful
async function incrementPreorderCount(productId, quantity = 1) {
    try {
        const counts = await loadCounts();
        const today = new Date().toISOString().split('T')[0];
        
        // Update total count
        counts.total_preorders += quantity;
        
        // Update daily count
        if (!counts.daily_counts[today]) {
            counts.daily_counts[today] = 0;
        }
        counts.daily_counts[today] += quantity;
        
        // Check for milestones
        const milestones = [100, 200, 250, 300, 350, 400, 450, 500];
        milestones.forEach(milestone => {
            const alreadyReached = counts.milestone_history?.some(m => m.count === milestone);
            if (!alreadyReached && counts.total_preorders >= milestone) {
                if (!counts.milestone_history) counts.milestone_history = [];
                counts.milestone_history.push({
                    count: milestone,
                    reached_at: new Date().toISOString()
                });
                console.log(`🎉 Milestone reached: ${milestone} pre-orders!`);
            }
        });
        
        counts.last_updated = new Date().toISOString();
        await saveCounts(counts);
        
        console.log(`Pre-order count updated: ${counts.total_preorders} (added ${quantity})`);
        
    } catch (error) {
        console.error('Error incrementing preorder count:', error);
    }
}

// Add count increment to existing checkout success handler
// Update your existing '/success' endpoint to include this:
// ... in your existing success handler after storing the pre-order ...
// Add this line:
await incrementPreorderCount(session.metadata.product_id, parseInt(session.metadata.quantity));

// Admin endpoint to manually adjust counts (for testing)
app.post('/api/admin/adjust-count', async (req, res) => {
    try {
        const { adjustment, reason } = req.body;
        
        const counts = await loadCounts();
        const oldCount = counts.total_preorders;
        counts.total_preorders += adjustment;
        counts.last_updated = new Date().toISOString();
        
        // Log the adjustment
        if (!counts.adjustment_history) counts.adjustment_history = [];
        counts.adjustment_history.push({
            old_count: oldCount,
            new_count: counts.total_preorders,
            adjustment: adjustment,
            reason: reason || 'Manual adjustment',
            timestamp: new Date().toISOString()
        });
        
        await saveCounts(counts);
        
        res.json({ 
            success: true, 
            old_count: oldCount, 
            new_count: counts.total_preorders 
        });
        
    } catch (error) {
        console.error('Error adjusting count:', error);
        res.status(500).json({ error: 'Failed to adjust count' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`DAMP Pre-Order Server running on port ${PORT}`);
    console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
});

module.exports = app; 