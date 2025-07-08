// DAMP Pre-Order Backend with Stripe Integration
// This example shows how to handle pre-orders with proper authorization

const express = require('express');
const stripe = require('stripe')('sk_test_your_stripe_secret_key_here'); // Replace with your secret key
const cors = require('cors');
const app = express();

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
    },
    'baby-bottle': {
        name: 'DAMP Baby Bottle',
        price: 7999, // $79.99 in cents
        originalPrice: 9999,
        estimatedDelivery: '2026-Q1',
        preOrderLookupKey: 'DAMP_BBB_V1_pre-order',
        defaultLookupKey: 'DAMP_BBB_V1_default'
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`DAMP Pre-Order Server running on port ${PORT}`);
    console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
});

module.exports = app; 