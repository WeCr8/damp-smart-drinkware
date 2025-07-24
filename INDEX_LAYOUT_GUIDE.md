# DAMP Smart Drinkware - Index.html Layout Guide

## 📋 Overview

This document defines the complete layout structure and requirements for the DAMP Smart Drinkware homepage (`index.html`). All developers must follow these patterns to ensure consistency, performance, and SEO optimization across the site.

## 🗺️ Site Architecture (from sitemap.xml)

### Priority Hierarchy
- **Priority 1.0** - Homepage (`/`)
- **Priority 0.95** - Product pages, Pre-sale funnel
- **Priority 0.9** - Individual product pages, How it works, Product voting
- **Priority 0.85** - Subscription pages, Stanley variants  
- **Priority 0.8** - About, Support
- **Priority 0.75** - Waitlist
- **Priority 0.7** - Cart, Checkout flows
- **Priority 0.5** - Legal pages (Privacy, Terms)

### Update Frequencies
- **Daily**: Product voting system
- **Weekly**: Homepage, products, pre-orders, individual product pages
- **Monthly**: Support pages, cart, technical pages
- **Yearly**: Legal/policy pages

## 🏗️ Index.html Structure Requirements

### 1. Document Head Structure

#### Required Meta Tags (CRITICAL - DO NOT MODIFY ORDER)
```html
<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="theme-color" content="#0f0f23">
    
    <!-- Enhanced Security Meta Tags -->
    <meta http-equiv="Content-Security-Policy" content="[EXACT CSP POLICY]">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
    <meta http-equiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains">
    <meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()">
```

#### Performance Resource Hints (REQUIRED)
```html
<!-- DNS Prefetch -->
<link rel="dns-prefetch" href="https://www.googletagmanager.com">
<link rel="dns-prefetch" href="https://js.stripe.com">
<link rel="dns-prefetch" href="https://fonts.googleapis.com">

<!-- Preconnect -->
<link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>

<!-- Critical Resource Preloading -->
<link rel="preload" href="assets/css/main.css" as="style">
<link rel="preload" href="assets/js/config/env-config.js" as="script">
<link rel="preload" href="assets/images/logo/logo.png" as="image">
```

#### SEO Meta Tags (EXACT FORMAT REQUIRED)
```html
<title>DAMP - Never Leave Your Drink Behind | Smart Drinkware Technology</title>
<meta name="description" content="Revolutionary BLE technology that prevents drink abandonment. DAMP Smart Drinkware alerts you when you're about to leave your beverage behind. Works with any cup or bottle. Free app with premium features.">
<meta name="keywords" content="smart drinkware, drink alert, BLE tracking, never leave drink, smart cup, drink reminder, beverage technology, IoT drinkware, smart home">
<meta name="author" content="WeCr8 Solutions LLC">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="https://dampdrink.com/">
```

#### Social Media Tags (REQUIRED)
```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://dampdrink.com/">
<meta property="og:title" content="DAMP - Never Leave Your Drink Behind | Smart Drinkware Technology">
<meta property="og:description" content="Revolutionary BLE technology that prevents drink abandonment. Works with any cup or bottle. Free app with premium features.">
<meta property="og:image" content="https://dampdrink.com/assets/images/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="DAMP - Never Leave Your Drink Behind">
<meta name="twitter:description" content="Revolutionary BLE technology that prevents drink abandonment. Works with any cup or bottle.">
<meta name="twitter:image" content="https://dampdrink.com/assets/images/og-image.jpg">
```

#### Structured Data (MANDATORY)
```html
<!-- Organization Schema -->
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DAMP Smart Drinkware",
    "alternateName": "WeCr8 Solutions LLC",
    "url": "https://dampdrink.com",
    "logo": "https://dampdrink.com/assets/images/logo/logo.png",
    "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-555-DAMP-TECH",
        "contactType": "Customer Service",
        "email": "support@dampdrink.com"
    }
}
</script>

<!-- Product Schema -->
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "DAMP Smart Drinkware System",
    "description": "Revolutionary BLE technology that prevents drink abandonment",
    "brand": {
        "@type": "Brand",
        "name": "DAMP"
    },
    "offers": {
        "@type": "Offer",
        "priceCurrency": "USD",
        "price": "29.00",
        "availability": "https://schema.org/PreOrder"
    }
}
</script>
```

### 2. Critical CSS (INLINE - REQUIRED)

#### CSS Variables (EXACT SPECIFICATION)
```css
:root {
    --primary-color: #00d4ff;
    --primary-dark: #0099cc;
    --secondary-color: #00ff88;
    --accent-color: #ff4757;
    --text-primary: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.8);
    --text-muted: rgba(255, 255, 255, 0.6);
    --bg-primary: #0f0f23;
    --bg-secondary: #1a1a2e;
    --bg-accent: #16213e;
}
```

#### Loading States (REQUIRED)
```css
.no-js .lazy-section { opacity: 1 !important; }
.page-loading { opacity: 0; }
.page-loaded { opacity: 1; transition: opacity 0.3s ease; }
```

### 3. Body Structure Requirements

#### Safe Area Wrapper (MANDATORY)
```html
<body class="page-loading">
    <div class="safe-area-wrapper">
        <!-- All content goes here -->
    </div>
</body>
```

#### Page Sections (EXACT ORDER REQUIRED)

**1. Header Component**
```html
<damp-header></damp-header>
```

**2. Hero Section**
```html
<section class="hero-section section-centered" id="hero">
    <div class="container">
        <div class="hero-content">
            <div class="hero-logo">
                <img src="assets/images/logo/logo.png" alt="DAMP Smart Drinkware Logo" width="80" height="80" loading="eager">
            </div>
            
            <h1 class="hero-title">Never Leave Your Drink Behind</h1>
            
            <p class="hero-subtitle">
                Revolutionary BLE technology that alerts you when you're about to abandon your beverage. 
                Works with any cup, bottle, or drinkware you already own.
            </p>
            
            <div class="hero-stats">
                <div class="stat-item">
                    <span class="stat-number">10K+</span>
                    <span class="stat-label">Pre-Orders</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">99%</span>
                    <span class="stat-label">Success Rate</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">5sec</span>
                    <span class="stat-label">Alert Time</span>
                </div>
            </div>
            
            <div class="hero-cta">
                <a href="pages/pre-order.html" class="btn btn-primary" data-analytics="hero-preorder-cta">
                    🚀 Pre-Order Now - $29
                </a>
                <a href="#products" class="btn btn-secondary" data-analytics="hero-learn-more">
                    Learn More
                </a>
            </div>
        </div>
    </div>
</section>
```

**3. Pain Point Section**
```html
<section class="pain-point-section section lazy-section" id="problem">
    <!-- Problem statement with stats -->
</section>
```

**4. How It Works Section**
```html
<section class="how-it-works-section section lazy-section" id="how-it-works" data-scripts="assets/js/components/how-it-works.js">
    <!-- 4-step process explanation -->
</section>
```

**5. Products Section (CRITICAL)**
```html
<section class="products-section section lazy-section" id="products" data-scripts="assets/js/components/product-showcase.js">
    <!-- Enhanced Material Design Product Cards -->
    <div class="product-cards-container">
        <!-- DAMP Handle - Most Popular -->
        <!-- Silicone Bottom - Best Value -->
        <!-- Cup Sleeve - Premium -->
        <!-- Baby Bottle - New -->
    </div>
</section>
```

**6. Mobile Application Section**
```html
<section class="mobile-app-section section lazy-section" id="mobile-app" data-scripts="assets/js/components/mobile-app-showcase.js">
    <!-- App showcase with store badges -->
</section>
```

**7. Subscription Preview**
```html
<section class="subscription-preview-section section lazy-section" id="subscription" data-scripts="assets/js/components/subscription-manager.js">
    <!-- Free, DAMP+, Family tiers -->
</section>
```

**8. Product Voting**
```html
<section class="voting-section section lazy-section" id="voting" data-scripts="assets/js/components/voting-system.js">
    <!-- Community voting for next products -->
</section>
```

**9. Testimonials**
```html
<section class="testimonials-section section lazy-section" id="testimonials">
    <!-- Customer testimonials -->
</section>
```

**10. FAQ Section**
```html
<section class="faq-section section lazy-section" id="faq" data-scripts="assets/js/components/faq-manager.js">
    <!-- Expandable FAQ items -->
</section>
```

**11. Newsletter**
```html
<section class="newsletter-section section lazy-section" id="newsletter">
    <!-- Email signup form -->
</section>
```

**12. Footer**
```html
<footer class="footer lazy-section">
    <!-- Links to all sitemap pages -->
</footer>
```

## 📱 Required Components

### Navigation Links (from sitemap.xml)
- **Primary Navigation**: Products, How It Works, App, Support, About
- **Product Pages**: All individual product pages (handle, bottom, sleeve, baby)
- **Commerce Flow**: Pre-order, Cart, Checkout, Success
- **Legal Pages**: Privacy, Terms, Cookie Policy
- **Community**: Product Voting, Waitlist, Subscription

### Analytics Implementation (MANDATORY)

#### Google Analytics 4 Setup
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YW2BN4SVPQ"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  // CRITICAL: Set consent defaults BEFORE config
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'analytics_storage': 'denied',
    'functionality_storage': 'denied',
    'personalization_storage': 'denied',
    'security_storage': 'granted',
    'wait_for_update': 2000
  });

  gtag('config', 'G-YW2BN4SVPQ', {
    'send_page_view': true,
    'anonymize_ip': true,
    'cookie_flags': 'SameSite=None;Secure'
  });
</script>
```

### Performance Requirements

#### Core Web Vitals Targets
- **LCP**: < 2.5 seconds
- **FID**: < 100 milliseconds  
- **CLS**: < 0.1

#### Loading Strategy
```html
<!-- Critical scripts loaded immediately -->
<script type="module" src="assets/js/config/env-config.js"></script>
<script type="module" src="assets/js/security/security-manager.js"></script>
<script type="module" src="assets/js/performance/performance-manager.js"></script>

<!-- Non-critical scripts loaded after page load -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initializeHeroAnimation();
    setupSmoothScrolling();
    initializeScrollAnimations();
    // ... other functions
});
</script>
```

## 🛠️ Developer Requirements

### 1. Section Class Pattern (MANDATORY)
```html
<section class="[section-name]-section section lazy-section" id="[section-id]" data-scripts="[optional-script-path]">
```

### 2. Container Pattern (REQUIRED)
```html
<div class="container">
    <!-- All section content -->
</div>
```

### 3. Analytics Attributes (REQUIRED)
```html
<a href="..." class="btn btn-primary" data-analytics="descriptive-action-name">
```

### 4. Image Loading (MANDATORY)
```html
<!-- Hero images: loading="eager" -->
<img src="..." alt="..." width="..." height="..." loading="eager">

<!-- Other images: lazy loading -->
<img data-src="..." alt="..." loading="lazy" width="..." height="..." class="product-image">
```

### 5. Accessibility Requirements (CRITICAL)
- Alt text for all images
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatibility

### 6. Mobile-First Responsive Design
- Safe area support: `padding: env(safe-area-inset-*)`
- Viewport units: `clamp()` for responsive typography
- Touch-friendly buttons: minimum 44px touch targets
- Hamburger navigation for mobile

## 🎨 Styling Standards

### Button Hierarchy
```css
.btn-primary     /* Main CTAs - Pre-order, key actions */
.btn-secondary   /* Secondary actions - Learn more */
.btn-tertiary    /* Tertiary actions - Navigation */
.btn-material    /* Enhanced material design buttons */
```

### Color Usage
- **Primary Blue (#00d4ff)**: Main CTAs, brand elements
- **Secondary Green (#00ff88)**: Success states, positive actions
- **Accent Red (#ff4757)**: Warnings, urgent actions
- **Background Gradient**: `linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)`

### Typography Scale
```css
.hero-title      /* clamp(3rem, 8vw, 4.5rem) */
.section-title   /* 2.5rem desktop, 2rem mobile */
.section-subtitle /* 1.25rem, opacity 0.8 */
```

## 🔒 Security Requirements

### Content Security Policy (EXACT SPECIFICATION)
```
default-src 'self'; 
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://js.stripe.com https://www.google-analytics.com; 
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
img-src 'self' data: https://www.googletagmanager.com https://www.google-analytics.com; 
font-src 'self' https://fonts.gstatic.com; 
connect-src 'self' https://www.google-analytics.com https://api.stripe.com;
```

## 📊 Testing Checklist

### Before Deployment
- [ ] All sitemap URLs accessible
- [ ] Analytics firing correctly
- [ ] Core Web Vitals < targets
- [ ] Mobile responsive design
- [ ] Accessibility compliance
- [ ] SEO meta tags complete
- [ ] Social media previews working
- [ ] Performance budget met
- [ ] Security headers configured
- [ ] Error handling implemented

### Performance Testing
```bash
# Lighthouse CI
npm run lighthouse

# Core Web Vitals
npm run test-cwv

# PWA compliance
npm run test-pwa
```

## 🚨 Critical Don'ts

1. **NEVER** modify the meta tag order in `<head>`
2. **NEVER** remove security headers
3. **NEVER** skip analytics consent management
4. **NEVER** hardcode URLs (use relative paths)
5. **NEVER** inline large JavaScript blocks
6. **NEVER** forget mobile viewport testing
7. **NEVER** skip accessibility testing
8. **NEVER** deploy without performance audit

## 📞 Support

For questions about this layout guide:
- Technical issues: Check `website/GOOGLE_ENGINEERING_PRACTICES.md`
- Performance issues: Use debug commands in browser console
- SEO issues: Validate structured data at schema.org
- Analytics issues: Check Google Analytics configuration

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Maintained By**: DAMP Development Team 