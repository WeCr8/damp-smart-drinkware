import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'DAMP Store Integration',
    version: '1.0.0',
  },
});

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  // For 204 No Content, don't include Content-Type or body
  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const { line_items, success_url, cancel_url, mode, metadata } = await req.json();

    // Validate required parameters
    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return corsResponse({ error: 'line_items is required and must be a non-empty array' }, 400);
    }

    if (!success_url || typeof success_url !== 'string') {
      return corsResponse({ error: 'success_url is required and must be a string' }, 400);
    }

    if (!cancel_url || typeof cancel_url !== 'string') {
      return corsResponse({ error: 'cancel_url is required and must be a string' }, 400);
    }

    if (mode !== 'payment') {
      return corsResponse({ error: 'mode must be "payment" for store purchases' }, 400);
    }

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser(token);

    if (getUserError) {
      return corsResponse({ error: 'Failed to authenticate user' }, 401);
    }

    if (!user) {
      return corsResponse({ error: 'User not found' }, 404);
    }

    // Get or create Stripe customer
    const { data: customer, error: getCustomerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (getCustomerError) {
      console.error('Failed to fetch customer information from the database', getCustomerError);
      return corsResponse({ error: 'Failed to fetch customer information' }, 500);
    }

    let customerId;

    if (!customer || !customer.customer_id) {
      // Create new Stripe customer
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });

      console.log(`Created new Stripe customer ${newCustomer.id} for user ${user.id}`);

      const { error: createCustomerError } = await supabase.from('stripe_customers').insert({
        user_id: user.id,
        customer_id: newCustomer.id,
      });

      if (createCustomerError) {
        console.error('Failed to save customer information in the database', createCustomerError);
        
        // Clean up Stripe customer
        try {
          await stripe.customers.del(newCustomer.id);
        } catch (deleteError) {
          console.error('Failed to clean up Stripe customer:', deleteError);
        }

        return corsResponse({ error: 'Failed to create customer mapping' }, 500);
      }

      customerId = newCustomer.id;
    } else {
      customerId = customer.customer_id;
    }

    // Calculate shipping
    const subtotal = line_items.reduce((total: number, item: any) => {
      return total + (item.price_data.unit_amount * item.quantity);
    }, 0);

    const freeShippingThreshold = 5000; // $50.00 in cents
    const shippingCost = subtotal >= freeShippingThreshold ? 0 : 999; // $9.99 shipping

    // Add shipping to line items if needed
    if (shippingCost > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
            description: 'Standard shipping (Free on orders $50+)',
          },
          unit_amount: shippingCost,
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items,
      mode,
      success_url,
      cancel_url,
      metadata: {
        user_id: user.id,
        order_type: 'store_purchase',
        ...metadata,
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      custom_text: {
        shipping_address: {
          message: 'Please provide accurate shipping information for your DAMP products.',
        },
        submit: {
          message: 'Your order will be processed within 1-2 business days.',
        },
      },
    });

    console.log(`Created store checkout session ${session.id} for customer ${customerId}`);

    return corsResponse({ 
      sessionId: session.id, 
      url: session.url,
      subtotal: subtotal / 100,
      shipping: shippingCost / 100,
      total: (subtotal + shippingCost) / 100,
    });

  } catch (error: any) {
    console.error(`Store checkout error: ${error.message}`);
    return corsResponse({ error: error.message }, 500);
  }
});