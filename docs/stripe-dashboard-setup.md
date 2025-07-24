# Stripe Dashboard Setup Guide
**Easy Visual Setup for DAMP Pre-Order System**

## Step 1: Create Products in Stripe Dashboard

1. **Log into your Stripe Dashboard** at https://dashboard.stripe.com
2. **Navigate to Products** in the left sidebar
3. **Click "Add product"** for each DAMP product

### Product 1: DAMP Handle v1.0
- **Name**: `DAMP Handle v1.0`
- **Description**: `Universal BLE attachment for existing mugs. Never leave your favorite mug behind again!`
- **Images**: Upload product image from `assets/images/products/damp-handle/damp-handle.png`

### Product 2: DAMP Silicone Bottom
- **Name**: `DAMP Silicone Bottom`
- **Description**: `Smart silicone base with BLE technology. Fits most cup and mug sizes with wireless charging compatibility.`
- **Images**: Upload product image from `assets/images/products/silicone-bottom/silicone-bottome.png`

### Product 3: DAMP Cup Sleeve
- **Name**: `DAMP Cup Sleeve`
- **Description**: `Flexible silicone sleeve with sensors. Heat-resistant up to 200°F with comfortable grip texture.`
- **Images**: Upload product image from `assets/images/products/cup-sleeve/cup-sleeve.png`

### Product 4: DAMP Baby Bottle
- **Name**: `DAMP Baby Bottle`
- **Description**: `BPA-free smart baby bottle with temperature monitoring and feeding schedule reminders.`
- **Images**: Upload product image from `assets/images/products/baby-bottle/baby-bottle.png`

## Step 2: Create Prices with Lookup Keys

For each product you just created, add **TWO prices**: Pre-order and Default pricing.

### DAMP Handle v1.0 Pricing

**Pre-order Price:**
- **Price**: `$49.99 USD`
- **Billing**: `One time`
- **Lookup key**: `DAMP_HAN_V1_pre-order`
- **Description**: `Early bird pre-order pricing`

**Default Price:**
- **Price**: `$69.99 USD`
- **Billing**: `One time`
- **Lookup key**: `DAMP_HAN_V1_default`
- **Description**: `Regular retail pricing`

### DAMP Silicone Bottom Pricing

**Pre-order Price:**
- **Price**: `$29.99 USD`
- **Billing**: `One time`
- **Lookup key**: `DAMP_SIL_BTM_pre-order`
- **Description**: `Early bird pre-order pricing`

**Default Price:**
- **Price**: `$39.99 USD`
- **Billing**: `One time`
- **Lookup key**: `DAMP_SIL_BTM_default`
- **Description**: `Regular retail pricing`

### DAMP Cup Sleeve Pricing

**Pre-order Price:**
- **Price**: `$34.99 USD`
- **Billing**: `One time`
- **Lookup key**: `DAMP_SLV_V1_pre-order`
- **Description**: `Early bird pre-order pricing`

**Default Price:**
- **Price**: `$44.99 USD`
- **Billing**: `One time`
- **Lookup key**: `DAMP_SLV_V1_default`
- **Description**: `Regular retail pricing`

### DAMP Baby Bottle Pricing

**Pre-order Price:**
- **Price**: `$79.99 USD`
- **Billing**: `One time`
- **Lookup key**: `DAMP_BBB_V1_pre-order`
- **Description**: `Early bird pre-order pricing`

**Default Price:**
- **Price**: `$99.99 USD`
- **Billing**: `One time`
- **Lookup key**: `DAMP_BBB_V1_default`
- **Description**: `Regular retail pricing`

## Step 3: Configure Webhook Endpoints

1. **Navigate to Developers → Webhooks** in your Stripe Dashboard
2. **Click "Add endpoint"**
3. **Endpoint URL**: `https://yourdomain.com/webhook` (replace with your actual domain)
4. **Events to send**: Select these specific events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.requires_action`

5. **Click "Add endpoint"**
6. **Copy the webhook signing secret** (starts with `whsec_`) - you'll need this for your `.env` file

## Step 4: Get Your API Keys

1. **Navigate to Developers → API keys**
2. **Copy your Publishable key** (`key`)
3. **Reveal and copy your Secret key** (`key`)

## Step 5: Test Your Setup

### Using Stripe's Test Mode
1. **Ensure you're in Test mode** (toggle in the top-left of your dashboard)
2. **Create a test checkout** using these test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Declined**: `4000 0000 0000 0002`
   - **Requires Authentication**: `4000 0025 0000 3155`

### Verify Lookup Keys Work
1. **Go to Products** in your dashboard
2. **Click on any product**
3. **Verify both prices are listed** with the correct lookup keys
4. **Test that each lookup key is unique** across all products

## Step 6: Environment Variables Setup

Update your `.env` file with the keys from Step 4:



## Step 7: Update Your Website

Replace the placeholder key in `website/pages/stripe-checkout.html`:

```javascript
// Replace this line:
const stripe = Stripe('pk_test_your_stripe_key_here');

// With your actual publishable key:
const stripe = Stripe('pk_test_51ABC...your_actual_key_here');
```

## ✅ Verification Checklist

- [ ] 4 products created in Stripe Dashboard
- [ ] 8 prices created (2 per product: pre-order + default)
- [ ] All lookup keys are correct and unique
- [ ] Webhook endpoint configured with correct events
- [ ] API keys copied to `.env` file
- [ ] Publishable key updated in HTML files
- [ ] Test transaction completed successfully

## 🎯 Benefits of Using Lookup Keys

**Easy Price Management:**
- Switch from pre-order to regular pricing instantly
- No code changes needed to update pricing
- Query prices by memorable names instead of random IDs

**Deployment Flexibility:**
- Same code works across test/live environments
- Easy to manage pricing tiers
- Simplified price updates without redeployment

**Business Operations:**
- Clear pricing structure visible in dashboard
- Easy to create sales/promotional pricing
- Simplified accounting and reporting

## 🚨 Important Notes

1. **Lookup keys must be unique** across your entire Stripe account
2. **Test thoroughly** before switching to live keys
3. **Never commit live keys** to your code repository
4. **Set up proper webhook authentication** for security

## 🆘 Troubleshooting

**If lookup key errors occur:**
- Verify the key exists in your Stripe Dashboard
- Check for typos in the key name
- Ensure you're using the right environment (test vs live)

**If webhooks fail:**
- Check the endpoint URL is accessible
- Verify webhook signing secret is correct
- Check webhook event logs in Stripe Dashboard

---

**You're all set!** Your DAMP pre-order system is now properly configured with Stripe lookup keys for flexible pricing management. 🚀 