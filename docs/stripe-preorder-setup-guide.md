# DAMP Pre-Order System Setup Guide

## Overview
This guide will help you implement the complete Stripe pre-order system for DAMP Smart Drinkware. The system uses Stripe's pre-authorization feature to hold payments without charging until products are ready to ship.

## 🚀 Quick Start Checklist

- [ ] Set up Stripe products and prices
- [ ] Configure environment variables
- [ ] Set up webhook endpoints
- [ ] Configure email service
- [ ] Set up database (optional)
- [ ] Test the system
- [ ] Go live

## Part 1: Stripe Dashboard Setup

### 1.1 Create Products in Stripe
Log into your Stripe Dashboard and create products for each DAMP item:

```bash
# Example using Stripe CLI (or use the web dashboard)
stripe products create --name "DAMP Handle v1.0" --description "Universal BLE attachment for existing mugs"
stripe products create --name "DAMP Silicone Bottom" --description "Smart silicone base with BLE technology"
stripe products create --name "DAMP Cup Sleeve" --description "Flexible silicone sleeve with sensors"
stripe products create --name "DAMP Baby Bottle" --description "BPA-free smart baby bottle"
```

### 1.2 Create Prices with Lookup Keys
Create prices for each product with your specific lookup keys (use the product IDs from step 1.1):

```bash
# DAMP Handle v1.0 - Pre-order ($49.99) and Default ($69.99) pricing
stripe prices create \
  --product prod_YOUR_HANDLE_PRODUCT_ID \
  --unit-amount 4999 \
  --currency usd \
  --lookup-key "DAMP_HAN_V1_pre-order" \
  --nickname "DAMP Handle v1.0 Pre-order"

stripe prices create \
  --product prod_YOUR_HANDLE_PRODUCT_ID \
  --unit-amount 6999 \
  --currency usd \
  --lookup-key "DAMP_HAN_V1_default" \
  --nickname "DAMP Handle v1.0 Default"

# DAMP Silicone Bottom - Pre-order ($29.99) and Default ($39.99) pricing
stripe prices create \
  --product prod_YOUR_SILICONE_PRODUCT_ID \
  --unit-amount 2999 \
  --currency usd \
  --lookup-key "DAMP_SIL_BTM_pre-order" \
  --nickname "DAMP Silicone Bottom Pre-order"

stripe prices create \
  --product prod_YOUR_SILICONE_PRODUCT_ID \
  --unit-amount 3999 \
  --currency usd \
  --lookup-key "DAMP_SIL_BTM_default" \
  --nickname "DAMP Silicone Bottom Default"

# DAMP Cup Sleeve - Pre-order ($34.99) and Default ($44.99) pricing
stripe prices create \
  --product prod_YOUR_SLEEVE_PRODUCT_ID \
  --unit-amount 3499 \
  --currency usd \
  --lookup-key "DAMP_SLV_V1_pre-order" \
  --nickname "DAMP Cup Sleeve Pre-order"

stripe prices create \
  --product prod_YOUR_SLEEVE_PRODUCT_ID \
  --unit-amount 4499 \
  --currency usd \
  --lookup-key "DAMP_SLV_V1_default" \
  --nickname "DAMP Cup Sleeve Default"

# DAMP Baby Bottle - Pre-order ($79.99) and Default ($99.99) pricing
stripe prices create \
  --product prod_YOUR_BOTTLE_PRODUCT_ID \
  --unit-amount 7999 \
  --currency usd \
  --lookup-key "DAMP_BBB_V1_pre-order" \
  --nickname "DAMP Baby Bottle Pre-order"

stripe prices create \
  --product prod_YOUR_BOTTLE_PRODUCT_ID \
  --unit-amount 9999 \
  --currency usd \
  --lookup-key "DAMP_BBB_V1_default" \
  --nickname "DAMP Baby Bottle Default"
```

**💡 Pro Tip**: Lookup keys make it easy to switch between pre-order and regular pricing later. You can also create these in the Stripe Dashboard under Products → [Your Product] → Pricing.

### 1.3 Configure Webhooks
Set up webhooks in your Stripe Dashboard:

1. Go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://yourdomain.com/webhook`
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `checkout.session.expired`

## Part 2: Environment Setup

### 2.1 Install Dependencies
```bash
npm install express stripe cors dotenv
# or
yarn add express stripe cors dotenv
```

### 2.2 Environment Variables
Create a `.env` file:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Database (if using one)
DATABASE_URL=your_database_url_here

# Email Service (choose one)
SENDGRID_API_KEY=your_sendgrid_key_here
MAILGUN_API_KEY=your_mailgun_key_here
AWS_SES_ACCESS_KEY=your_aws_access_key_here
AWS_SES_SECRET_KEY=your_aws_secret_key_here

# Domain
DOMAIN=https://yourdomain.com
```

### 2.3 Update Your HTML Files
Update the Stripe publishable key in your HTML files:

```javascript
// In stripe-checkout.html
const stripe = Stripe('pk_test_your_actual_stripe_key_here');
```

**✅ Your system is already configured with the correct lookup keys:**
- DAMP_HAN_V1_pre-order / DAMP_HAN_V1_default
- DAMP_SIL_BTM_pre-order / DAMP_SIL_BTM_default  
- DAMP_SLV_V1_pre-order / DAMP_SLV_V1_default
- DAMP_BBB_V1_pre-order / DAMP_BBB_V1_default

## Part 3: Database Setup (Optional)

### 3.1 Simple Option: Use Stripe's Metadata
You can store all order information in Stripe's metadata without a separate database. This is perfect for getting started quickly.

### 3.2 Full Database Option
If you want more control, set up a database:

```sql
-- PostgreSQL example
CREATE TABLE pre_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_session_id VARCHAR(255) NOT NULL,
    stripe_payment_intent_id VARCHAR(255) NOT NULL,
    product_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    shipping_address JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    estimated_delivery VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pre_orders_stripe_payment_intent ON pre_orders(stripe_payment_intent_id);
CREATE INDEX idx_pre_orders_customer_email ON pre_orders(customer_email);
CREATE INDEX idx_pre_orders_status ON pre_orders(status);
```

## Part 4: Email Service Setup

### 4.1 Choose an Email Service
**Recommended options:**
- **SendGrid**: Great for transactional emails
- **Mailgun**: Reliable and developer-friendly
- **AWS SES**: Cost-effective for high volume

### 4.2 Email Templates
Create email templates for:
- Pre-order confirmation
- Development updates
- Shipping notifications
- Cancellation confirmations

Example SendGrid integration:
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendPreOrderConfirmation(preOrder) {
    const msg = {
        to: preOrder.customerEmail,
        from: 'orders@dampdrink.com',
        subject: 'Pre-Order Confirmation - DAMP Smart Drinkware',
        html: `
            <h1>Thank you for your pre-order!</h1>
            <p>Dear ${preOrder.customerName},</p>
            <p>Your pre-order for ${preOrder.productName} has been confirmed.</p>
            <p><strong>Order Details:</strong></p>
            <ul>
                <li>Product: ${preOrder.productName}</li>
                <li>Quantity: ${preOrder.quantity}</li>
                <li>Amount: $${(preOrder.amount / 100).toFixed(2)}</li>
                <li>Estimated Delivery: ${preOrder.estimatedDelivery}</li>
            </ul>
            <p>Your payment has been authorized but won't be charged until we ship your order.</p>
        `
    };
    
    await sgMail.send(msg);
}
```

## Part 5: Testing

### 5.1 Test Cards
Use Stripe's test cards:
- **Success**: `4242 4242 4242 4242`
- **Requires authentication**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 0002`

### 5.2 Test Workflow
1. Create a test pre-order
2. Verify payment is authorized (not charged)
3. Check webhook events
4. Test email notifications
5. Test order management functions

### 5.3 Webhook Testing
Use Stripe CLI to test webhooks locally:
```bash
stripe listen --forward-to localhost:3000/webhook
```

## Part 6: Going Live

### 6.1 Switch to Live Keys
1. Replace test keys with live keys in your `.env` file
2. Update webhook endpoints to use your live domain
3. Update HTML files with live publishable key

### 6.2 Production Considerations
- [ ] Set up SSL certificate
- [ ] Configure proper CORS headers
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Set up rate limiting
- [ ] Configure proper error handling

## Part 7: Managing Pre-Orders

### 7.1 Admin Dashboard
Access your pre-orders via:
```
GET /admin/preorders
```

### 7.2 When Ready to Ship
Capture payments when products are ready:
```javascript
// Charge a specific pre-order
POST /charge-preorder
{
    "paymentIntentId": "pi_your_payment_intent_id"
}
```

### 7.3 Handling Cancellations
If you need to cancel pre-orders:
```javascript
// Cancel a pre-order
POST /cancel-preorder
{
    "paymentIntentId": "pi_your_payment_intent_id"
}
```

## Part 8: Best Practices

### 8.1 Communication
- Send monthly development updates
- Be transparent about timelines
- Provide clear refund policies
- Set up customer support

### 8.2 Financial Management
- Monitor authorization expiration (7 days for most cards)
- Plan for declined payments when charging
- Keep detailed records for accounting
- Consider partial charging for partial shipments

### 8.3 Legal Considerations
- Clear terms and conditions
- Refund policy
- Data privacy compliance
- Consumer protection laws

## Part 9: Alternative Approaches

### 9.1 Stripe Checkout vs Custom Form
**Stripe Checkout (Recommended):**
- ✅ Faster implementation
- ✅ Built-in fraud protection
- ✅ Mobile optimized
- ✅ Multiple payment methods

**Custom Form:**
- ✅ More control over design
- ✅ Custom validation
- ❌ More development time
- ❌ You handle PCI compliance

### 9.2 Payment Timing Options
1. **Pre-authorization (Recommended)**: Authorize now, charge later
2. **Immediate charge**: Charge now, ship later (requires clear communication)
3. **Deposit + Balance**: Charge partial amount now, rest later

## Part 10: Troubleshooting

### Common Issues:
- **Authorization expires**: Cards expire after 7 days
- **Webhook failures**: Check endpoint URL and signature verification
- **Email delivery**: Verify email service configuration
- **CORS errors**: Configure proper CORS headers

### Support Resources:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Discord Community](https://discord.gg/stripe)
- [Stripe Support](https://support.stripe.com)

## 🎯 Success Metrics to Track

- Pre-order conversion rate
- Payment authorization success rate
- Email delivery rates
- Customer satisfaction scores
- Average order value
- Refund/cancellation rates

## 📞 Need Help?

If you run into issues:
1. Check the Stripe Dashboard for error logs
2. Review webhook event logs
3. Test with Stripe CLI
4. Contact Stripe support if needed

---

**Remember**: This system is designed for pre-orders where you authorize payments but don't charge until shipping. This builds trust with customers and ensures you only charge when you can deliver! 