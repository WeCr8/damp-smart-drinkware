# DAMP Pages Layout Guide Template

## 📋 How to Document Each Page

This template shows how to create layout documentation for each page in the `/pages` directory, following the same standards as `INDEX_LAYOUT_GUIDE.md`.

## 🗂️ Pages to Document (from sitemap.xml)

### High Priority Pages (Document First)
1. **products.html** (Priority 0.95) - Weekly updates
2. **pre-sale-funnel.html** (Priority 0.95) - Weekly updates  
3. **how-it-works.html** (Priority 0.9) - Monthly updates
4. **product-voting.html** (Priority 0.9) - Daily updates
5. **damp-handle-v1.0.html** (Priority 0.9) - Weekly updates
6. **silicone-bottom-v1.0.html** (Priority 0.9) - Weekly updates
7. **cup-sleeve-v1.0.html** (Priority 0.9) - Weekly updates
8. **baby-bottle-v1.0.html** (Priority 0.9) - Weekly updates

### Medium Priority Pages
9. **subscription.html** (Priority 0.85) - Weekly updates
10. **about.html** (Priority 0.8) - Monthly updates
11. **support.html** (Priority 0.8) - Monthly updates
12. **waitlist.html** (Priority 0.75) - Weekly updates

### Commerce Flow Pages
13. **cart.html** (Priority 0.7) - Monthly updates
14. **pre-order.html** (Priority 0.9) - Weekly updates
15. **stripe-checkout.html** (Priority 0.7) - Monthly updates
16. **success.html** (Priority 0.6) - Monthly updates

### Legal Pages (Low Priority)
17. **privacy.html** (Priority 0.5) - Yearly updates
18. **terms.html** (Priority 0.5) - Yearly updates
19. **cookie-policy.html** (Priority 0.4) - Yearly updates

## 📄 Page Documentation Template

For each page, create: `[PAGE_NAME]_LAYOUT_GUIDE.md`

```markdown
# DAMP - [Page Name] Layout Guide

## 📋 Page Overview
- **File**: `/pages/[filename].html`
- **URL**: `https://dampdrink.com/pages/[filename].html`
- **Sitemap Priority**: [priority from sitemap.xml]
- **Update Frequency**: [frequency from sitemap.xml]
- **Purpose**: [Brief description of page purpose]

## 🎯 Page-Specific Requirements

### SEO Configuration
```html
<title>[Page-specific title from sitemap analysis]</title>
<meta name="description" content="[Page-specific description]">
<meta name="keywords" content="[Page-specific keywords]">
<link rel="canonical" href="https://dampdrink.com/pages/[filename].html">
```

### Structured Data Requirements
```html
<!-- Page-specific schema markup -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "[PageType]",
  // Page-specific schema
}
</script>
```

## 🏗️ Section Structure

### Required Components (All Pages)
1. **Header Component**: `<damp-header></damp-header>`
2. **Safe Area Wrapper**: `<div class="safe-area-wrapper">`
3. **Main Content Container**: `<div class="container">`
4. **Footer Component**: Standard footer with sitemap links

### Page-Specific Sections
[List sections specific to this page type]

## 📱 Component Requirements

### Navigation Context
- **Breadcrumbs**: [If applicable]
- **Back Navigation**: [If applicable] 
- **Related Pages**: [List related pages from sitemap]

### Analytics Events
- **Page Load**: `page_view` with page category
- **CTA Clicks**: [List specific CTAs for this page]
- **Form Submissions**: [If applicable]
- **Scroll Tracking**: [If long-form content]

## 🎨 Visual Requirements

### Hero Section (if applicable)
- Page-specific hero requirements
- CTA buttons and their destinations
- Background imagery requirements

### Content Sections
- Section-specific requirements
- Component patterns to follow
- Interactive elements

## 🔗 Internal Linking

### Required Links (from sitemap.xml)
- **Navigation Links**: [List required nav links]
- **Cross-references**: [Related pages to link to]
- **CTA Destinations**: [Where buttons should lead]

### Footer Links (Standard for All Pages)
```html
<!-- Products Section -->
<a href="pages/damp-handle-v1.0.html">DAMP Handle</a>
<a href="pages/silicone-bottom-v1.0.html">Silicone Bottom</a>
<a href="pages/cup-sleeve-v1.0.html">Cup Sleeve</a>
<a href="pages/baby-bottle-v1.0.html">Baby Bottle</a>
<a href="pages/products.html">All Products</a>

<!-- Company Section -->
<a href="pages/about.html">About Us</a>
<a href="pages/how-it-works.html">How It Works</a>
<a href="pages/support.html">Support</a>

<!-- Community Section -->
<a href="pages/product-voting.html">Vote Next Product</a>
<a href="pages/waitlist.html">Join Waitlist</a>
<a href="pages/subscription.html">Subscription Plans</a>

<!-- Legal Section -->
<a href="pages/privacy.html">Privacy Policy</a>
<a href="pages/cookie-policy.html">Cookie Policy</a>
<a href="pages/terms.html">Terms</a>
```

## 📊 Performance Requirements

### Page-Specific Optimizations
- **Critical CSS**: [Page-specific critical styles]
- **Image Optimization**: [Image requirements for this page]
- **Script Loading**: [Page-specific JavaScript requirements]

### Core Web Vitals Targets (Same for All Pages)
- **LCP**: < 2.5 seconds
- **FID**: < 100 milliseconds
- **CLS**: < 0.1

## ✅ Testing Checklist

### Page-Specific Tests
- [ ] [Custom tests for this page type]
- [ ] All internal links work correctly
- [ ] Form functionality (if applicable)
- [ ] Analytics events fire correctly

### Standard Tests (All Pages)
- [ ] Mobile responsive design
- [ ] Accessibility compliance (WCAG 2.1)
- [ ] SEO meta tags complete
- [ ] Core Web Vitals targets met
- [ ] Cross-browser compatibility
- [ ] Safe area support on mobile
```

## 🛠️ Quick Start Guide

### Step 1: Choose Your Page
Select a page from the priority list above.

### Step 2: Analyze Current Implementation
```bash
# Open the page file
code website/pages/[filename].html

# Check current structure against template
# Look for missing components
# Identify page-specific requirements
```

### Step 3: Create Documentation
```bash
# Create the layout guide
touch [PAGE_NAME]_LAYOUT_GUIDE.md

# Use template above and customize for your page
# Fill in page-specific details
# Add component requirements
```

### Step 4: Cross-Reference Sitemap
- Check sitemap.xml for priority and update frequency
- Ensure all required internal links are included
- Verify canonical URL structure

## 📋 Example: Products Page Documentation

### PRODUCTS_LAYOUT_GUIDE.md
```markdown
# DAMP - Products Page Layout Guide

## 📋 Page Overview
- **File**: `/pages/products.html`
- **URL**: `https://dampdrink.com/pages/products.html`
- **Sitemap Priority**: 0.95 (Very High)
- **Update Frequency**: Weekly
- **Purpose**: Showcase all DAMP products with comparison features

## 🎯 Page-Specific Requirements

### SEO Configuration
```html
<title>DAMP Smart Drinkware Products - Complete Product Lineup</title>
<meta name="description" content="Explore the complete DAMP Smart Drinkware product lineup. Compare features, prices, and specifications for Handle, Silicone Bottom, Cup Sleeve, and Baby Bottle.">
<meta name="keywords" content="DAMP products, smart drinkware comparison, BLE tracking devices, drink alert systems">
```

### Product Schema Markup
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "DAMP Smart Drinkware Products",
  "description": "Complete lineup of smart drinkware products"
}
</script>
```

## 🏗️ Section Structure

### Required Sections (In Order)
1. **Hero Section**: Product overview and value proposition
2. **Product Grid**: All 4 main products with comparison
3. **Feature Comparison Table**: Side-by-side feature comparison
4. **Pricing Overview**: Pricing for all products
5. **Subscription Upsell**: Link to subscription benefits
6. **FAQ Section**: Product-specific questions
7. **CTA Section**: Pre-order and learn more options

### Navigation Context
- **Breadcrumbs**: Home > Products
- **Related Pages**: Individual product pages, How It Works, Subscription
- **Back to Home**: Prominent link in header

## 📱 Component Requirements

### Product Cards (Required Pattern)
```html
<div class="product-card" data-product="[product-id]">
    <div class="product-image">
        <img data-src="assets/images/products/[product]/[product].png" 
             alt="[Product Name]" 
             loading="lazy" 
             width="280" 
             height="280">
    </div>
    <div class="product-info">
        <h3 class="product-title">[Product Name]</h3>
        <p class="product-price">$[XX] USD</p>
        <p class="product-description">[Brief description]</p>
        <div class="product-actions">
            <a href="pages/[product]-v1.0.html" class="btn btn-primary">View Details</a>
            <a href="pages/pre-order.html?product=[product]" class="btn btn-secondary">Pre-Order</a>
        </div>
    </div>
</div>
```

### Comparison Table
- Feature-by-feature comparison
- Highlight key differentiators
- Mobile-responsive table design
- Sort and filter functionality

## 🔗 Internal Linking Requirements

### Product Links (Must Include All)
- Link to each individual product page
- Link to pre-order page with product parameter
- Link to subscription page for premium features
- Link to how-it-works for technical details

### Analytics Events
- `product_view` for each product card view
- `product_comparison` for comparison table interactions
- `cta_click` for all pre-order buttons
- `navigation_click` for internal page navigation
```

## 🚀 Implementation Steps

### Phase 1: High Priority Pages (Week 1)
1. Create `PRODUCTS_LAYOUT_GUIDE.md`
2. Create `PRE_SALE_FUNNEL_LAYOUT_GUIDE.md`
3. Create `PRODUCT_VOTING_LAYOUT_GUIDE.md`

### Phase 2: Product Pages (Week 2)
4. Create `DAMP_HANDLE_LAYOUT_GUIDE.md`
5. Create `SILICONE_BOTTOM_LAYOUT_GUIDE.md`
6. Create `CUP_SLEEVE_LAYOUT_GUIDE.md`
7. Create `BABY_BOTTLE_LAYOUT_GUIDE.md`

### Phase 3: Support Pages (Week 3)
8. Create `HOW_IT_WORKS_LAYOUT_GUIDE.md`
9. Create `ABOUT_LAYOUT_GUIDE.md`
10. Create `SUPPORT_LAYOUT_GUIDE.md`

### Phase 4: Commerce & Legal (Week 4)
11. Create remaining commerce flow guides
12. Create legal page guides (lower priority)

## 📞 Next Steps

1. **Start with INDEX_LAYOUT_GUIDE.md** - Use as reference
2. **Pick highest priority page** from the list above
3. **Create page-specific documentation** using this template
4. **Cross-reference sitemap.xml** for accuracy
5. **Test against current implementation**
6. **Iterate and improve** based on findings

---

**Template Version**: 1.0  
**Last Updated**: January 2025  
**Use This Template**: For all pages in `/pages` directory 