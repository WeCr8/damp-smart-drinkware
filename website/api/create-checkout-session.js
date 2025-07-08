// Example Node.js/Express API endpoint for creating Stripe checkout sessions
// This would typically be deployed to a backend service like Vercel, Netlify Functions, or AWS Lambda

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Product catalog with Stripe Price IDs
const products = {
    'damp-handle': {
        name: 'DAMP Handle v1.0',
        price: 4999, // $49.99 in cents
        priceId: 'price_1234567890abcdef', // Replace with actual Stripe Price ID
        description: 'Universal BLE attachment for existing mugs'
    },
    'silicone-bottom': {
        name: 'DAMP Silicone Bottom',
        price: 2999, // $29.99 in cents
        priceId: 'price_abcdef1234567890', // Replace with actual Stripe Price ID
        description: 'Smart silicone base with BLE technology'
    },
    'cup-sleeve': {
        name: 'DAMP Cup Sleeve',
        price: 3499, // $34.99 in cents
        priceId: 'price_fedcba0987654321', // Replace with actual Stripe Price ID
        description: 'Flexible silicone sleeve with sensors'
    },
    'baby-bottle': {
        name: 'DAMP Baby Bottle',
        price: 7999, // $79.99 in cents
        priceId: 'price_123456789abcdef0', // Replace with actual Stripe Price ID
        description: 'BPA-free smart baby bottle'
    }
};

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { cart, products: productData } = req.body;

        // Validate cart data
        if (!cart || Object.keys(cart).length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Create line items for Stripe
        const lineItems = [];
        let totalAmount = 0;

        for (const [productId, quantity] of Object.entries(cart)) {
            const product = products[productId];
            
            if (!product) {
                return res.status(400).json({ error: `Invalid product: ${productId}` });
            }

            if (quantity <= 0 || quantity > 10) {
                return res.status(400).json({ error: `Invalid quantity for ${productId}` });
            }

            lineItems.push({
                price: product.priceId,
                quantity: quantity,
                adjustable_quantity: {
                    enabled: true,
                    minimum: 1,
                    maximum: 10
                }
            });

            totalAmount += product.price * quantity;
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.DOMAIN}/pages/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.DOMAIN}/pages/cart.html`,
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK', 'FI']
            },
            billing_address_collection: 'required',
            metadata: {
                order_type: 'pre_order',
                total_items: Object.values(cart).reduce((sum, qty) => sum + qty, 0),
                estimated_delivery: 'Q3-Q4 2025'
            },
            custom_text: {
                submit: {
                    message: 'This is a pre-order. Payment will be authorized but not charged until shipping.'
                }
            },
            payment_intent_data: {
                capture_method: 'manual', // For pre-orders - capture when ready to ship
                metadata: {
                    order_type: 'pre_order',
                    products: JSON.stringify(cart)
                }
            },
            customer_email: req.body.customer_email || undefined,
            expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
            phone_number_collection: {
                enabled: true
            }
        });

        // Log successful checkout session creation
        console.log('Checkout session created:', {
            sessionId: session.id,
            cart: cart,
            totalAmount: totalAmount,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({
            id: session.id,
            url: session.url
        });

    } catch (error) {
        console.error('Stripe checkout error:', error);
        
        // Don't expose internal errors to client
        const errorMessage = error.type === 'StripeCardError' 
            ? 'Payment processing error. Please try again.' 
            : 'An error occurred. Please try again or contact support.';

        res.status(500).json({ 
            error: errorMessage,
            support_email: 'support@dampdrink.com'
        });
    }
}

// Additional utility functions for order management

// Webhook handler for Stripe events
export async function handleStripeWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`Webhook signature verification failed:`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case 'checkout.session.completed':
            // Handle successful pre-order
            const session = event.data.object;
            await handlePreOrderSuccess(session);
            break;
        
        case 'payment_intent.succeeded':
            // Handle when payment is captured (product ships)
            const paymentIntent = event.data.object;
            await handlePaymentSuccess(paymentIntent);
            break;
        
        case 'payment_intent.payment_failed':
            // Handle payment failure
            const failedPayment = event.data.object;
            await handlePaymentFailure(failedPayment);
            break;
        
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
}

async function handlePreOrderSuccess(session) {
    // Save order to database
    // Send confirmation email
    // Add to CRM/email list
    // Track analytics
    console.log('Pre-order successful:', session.id);
}

async function handlePaymentSuccess(paymentIntent) {
    // Update order status
    // Send shipping notification
    // Update inventory
    console.log('Payment captured:', paymentIntent.id);
}

async function handlePaymentFailure(paymentIntent) {
    // Handle failed payment
    // Send notification to customer
    // Update order status
    console.log('Payment failed:', paymentIntent.id);
} 