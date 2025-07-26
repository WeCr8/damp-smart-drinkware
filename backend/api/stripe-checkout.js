// DAMP Stripe Checkout Integration
// Secure pre-sale checkout with Stripe
// Copyright 2025 WeCr8 Solutions LLC

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://dampdrink.com', 'https://www.dampdrink.com']
        : ['http://localhost:8000', 'http://127.0.0.1:8000'],
    credentials: true
}));

// Rate limiting for checkout endpoints
const checkoutLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 checkout attempts per windowMs
    message: { error: 'Too many checkout attempts, please try again later.' }
});

app.use(express.json({ limit: '1mb' }));

// DAMP Pre-Sale Product Configuration
const PRESALE_PRODUCTS = {
    'damp-handle-universal': {
        name: 'DAMP Handle Universal',
        price: 2999, // $29.99 in cents
        originalPrice: 3999, // $39.99 in cents
        description: 'Never abandon your favorite beverage. Works with popular tumbler brands and virtually any drinkware.',
        images: ['https://dampdrink.com/assets/images/products/damp-hero.jpg'],
        features: [
            'Works with any cup, mug, or bottle. Universal compatibility - attach to virtually anything.',
            'Universal handle attachment. Perfect for travel mugs, tumblers, and most drinkware.',
            '2.4 oz (68g) Universal Model',
            'IPX4 splash resistant - Universal Model',
            'Bluetooth connectivity with mobile app',
            '6-month battery life',
            'Instant phone alerts',
            'Universal clip design',
            'Free worldwide shipping'
        ]
    }
};

// Create Stripe Checkout Session
app.post('/api/create-checkout-session', checkoutLimiter, async (req, res) => {
    try {
        const { productId, quantity = 1, customerEmail, metadata = {} } = req.body;
        
        // Validate product
        if (!PRESALE_PRODUCTS[productId]) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        
        const product = PRESALE_PRODUCTS[productId];
        
        // Create Stripe session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        description: product.description,
                        images: product.images,
                        metadata: {
                            type: 'presale',
                            product_id: productId,
                            features: JSON.stringify(product.features)
                        }
                    },
                    unit_amount: product.price,
                },
                quantity: quantity,
            }],
            mode: 'payment',
            success_url: `${req.headers.origin}/pages/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/pages/pre-sale-funnel.html?canceled=true`,
            customer_email: customerEmail,
            metadata: {
                product_id: productId,
                quantity: quantity.toString(),
                campaign_type: 'presale',
                original_price: product.originalPrice.toString(),
                savings: (product.originalPrice - product.price).toString(),
                ...metadata
            },
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH'],
            },
            phone_number_collection: {
                enabled: true,
            },
            custom_text: {
                submit: {
                    message: 'Pre-order confirmation will be sent to your email. Expected delivery: 90 days after campaign completion.'
                }
            },
            invoice_creation: {
                enabled: true,
            }
        });
        
        // Track checkout initiation
        await trackCheckoutEvent('checkout_initiated', {
            session_id: session.id,
            product_id: productId,
            amount: product.price * quantity,
            customer_email: customerEmail
        });
        
        res.json({ 
            sessionId: session.id,
            url: session.url 
        });
        
    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({ 
            error: 'Failed to create checkout session',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Payment processing error'
        });
    }
});

// Webhook to handle successful payments
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            handleSuccessfulPayment(event.data.object);
            break;
        case 'payment_intent.succeeded':
            handlePaymentSuccess(event.data.object);
            break;
        case 'payment_intent.payment_failed':
            handlePaymentFailure(event.data.object);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({received: true});
});

// Get checkout session details
app.get('/api/checkout-session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items', 'customer']
        });
        
        // Only return safe data to frontend
        const safeSession = {
            id: session.id,
            payment_status: session.payment_status,
            customer_email: session.customer_details?.email,
            amount_total: session.amount_total,
            currency: session.currency,
            metadata: session.metadata
        };
        
        res.json(safeSession);
        
    } catch (error) {
        console.error('Error retrieving session:', error);
        res.status(500).json({ error: 'Failed to retrieve session' });
    }
});

// Handle successful payment
async function handleSuccessfulPayment(session) {
    try {
        console.log('💰 Payment successful:', session.id);
        
        // Track successful conversion
        await trackCheckoutEvent('conversion_completed', {
            session_id: session.id,
            customer_email: session.customer_details?.email,
            amount: session.amount_total,
            product_id: session.metadata?.product_id,
            quantity: parseInt(session.metadata?.quantity) || 1
        });
        
        // Update pre-sale counter
        await updatePresaleCount(parseInt(session.metadata?.quantity) || 1);
        
        // Send confirmation email (implement with your email service)
        await sendConfirmationEmail(session);
        
        console.log('✅ Post-payment processing completed for session:', session.id);
        
    } catch (error) {
        console.error('Error handling successful payment:', error);
    }
}

// Handle payment success
async function handlePaymentSuccess(paymentIntent) {
    console.log('✅ Payment succeeded:', paymentIntent.id);
    // Additional payment success logic here
}

// Handle payment failure
async function handlePaymentFailure(paymentIntent) {
    console.log('❌ Payment failed:', paymentIntent.id);
    
    await trackCheckoutEvent('payment_failed', {
        payment_intent_id: paymentIntent.id,
        failure_reason: paymentIntent.last_payment_error?.message
    });
}

// Track checkout events
async function trackCheckoutEvent(eventType, data) {
    try {
        // Send to presale tracker API
        const response = await fetch('http://localhost:3001/api/track-event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event: eventType,
                data: data,
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to track event: ${response.statusText}`);
        }
        
        console.log(`📊 Tracked event: ${eventType}`);
        
    } catch (error) {
        console.error('Error tracking checkout event:', error);
    }
}

// Update pre-sale count
async function updatePresaleCount(quantity) {
    try {
        const response = await fetch('http://localhost:3001/api/track-event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event: 'conversion_completed',
                data: { quantity }
            })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to update count: ${response.statusText}`);
        }
        
        console.log(`📈 Updated pre-sale count by ${quantity}`);
        
    } catch (error) {
        console.error('Error updating pre-sale count:', error);
    }
}

// Send confirmation email
async function sendConfirmationEmail(session) {
    try {
        // Implement with your preferred email service (SendGrid, Mailgun, etc.)
        console.log(`📧 Sending confirmation email to: ${session.customer_details?.email}`);
        
        // Example email content
        const emailData = {
            to: session.customer_details?.email,
            subject: 'DAMP Pre-Order Confirmation - You\'re In!',
            template: 'presale-confirmation',
            data: {
                customerName: session.customer_details?.name,
                orderAmount: (session.amount_total / 100).toFixed(2),
                productName: session.metadata?.product_id,
                expectedDelivery: '90 days after campaign completion',
                orderId: session.id
            }
        };
        
        // This would integrate with your email service
        // await emailService.send(emailData);
        
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
}

// Health check
app.get('/api/checkout-health', (req, res) => {
    res.json({ 
        status: 'healthy',
        stripe: !!process.env.STRIPE_SECRET_KEY,
        webhook: !!process.env.STRIPE_WEBHOOK_SECRET,
        timestamp: new Date().toISOString()
    });
});

// Error handling
app.use((error, req, res, next) => {
    console.error('💥 Checkout API error:', error);
    res.status(500).json({ 
        error: 'Checkout service error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Payment processing unavailable'
    });
});

// Export for testing
module.exports = app;

// Start server if run directly
if (require.main === module) {
    const PORT = process.env.CHECKOUT_PORT || 3002;
    app.listen(PORT, () => {
        console.log(`💳 DAMP Stripe Checkout API running on port ${PORT}`);
        console.log(`🔐 Stripe configured: ${!!process.env.STRIPE_SECRET_KEY}`);
        console.log(`🎯 Webhook endpoint: /api/stripe-webhook`);
    });
} 