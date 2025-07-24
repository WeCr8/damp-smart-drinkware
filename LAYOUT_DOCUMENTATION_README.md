# DAMP Smart Drinkware - Layout Documentation System

## 📋 Overview

This documentation system ensures all developers follow consistent patterns, performance standards, and SEO requirements across the entire DAMP Smart Drinkware website.

## 📚 Documentation Files

### 1. [INDEX_LAYOUT_GUIDE.md](INDEX_LAYOUT_GUIDE.md)
**Complete specification for the homepage (`index.html`)**
- ✅ Sitemap integration with priorities and update frequencies
- ✅ Exact HTML structure requirements (12 sections)
- ✅ Required meta tags, security headers, and SEO elements
- ✅ Google Analytics 4 implementation with consent management
- ✅ Performance requirements (Core Web Vitals targets)
- ✅ Accessibility and mobile-first design requirements
- ✅ Testing checklist and critical don'ts

### 2. [PAGES_LAYOUT_GUIDE_TEMPLATE.md](PAGES_LAYOUT_GUIDE_TEMPLATE.md)
**Template for documenting all pages in `/pages` directory**
- ✅ Priority-ordered list of 19 pages from sitemap.xml
- ✅ Complete documentation template with examples
- ✅ Implementation phases (4 weeks)
- ✅ Products page example with full specification
- ✅ Cross-referencing with sitemap data

## 🗺️ Site Architecture Summary

### From sitemap.xml Analysis:
- **19 total pages** documented with priorities and update frequencies
- **Priority 1.0**: Homepage (highest)
- **Priority 0.95**: Products, Pre-sale funnel (very high)
- **Priority 0.9**: Individual products, How it works, Product voting
- **Priority 0.85**: Subscription, Stanley variants
- **Priority 0.8**: About, Support
- **Update frequencies**: Daily (voting) → Weekly (products) → Monthly → Yearly (legal)

## 🚀 Quick Start

### For Homepage Development
```bash
# Read the complete index specification
cat INDEX_LAYOUT_GUIDE.md

# Key requirements:
# - 12 sections in exact order
# - Google Analytics 4 with consent management
# - Core Web Vitals < 2.5s LCP, 100ms FID, 0.1 CLS
# - Mobile-first responsive design
# - Complete SEO and social media tags
```

### For Individual Pages
```bash
# Use the template system
cat PAGES_LAYOUT_GUIDE_TEMPLATE.md

# Priority order for documentation:
# Week 1: products.html, pre-sale-funnel.html, product-voting.html
# Week 2: Individual product pages (4 pages)
# Week 3: Support pages (how-it-works, about, support)
# Week 4: Commerce and legal pages
```

## 🏗️ Required Components (All Pages)

### 1. Document Head (CRITICAL ORDER)
```html
<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="theme-color" content="#0f0f23">
    
    <!-- Security headers (8 required) -->
    <!-- Performance hints (DNS prefetch, preconnect, preload) -->
    <!-- SEO meta tags (title, description, keywords, canonical) -->  
    <!-- Social media tags (Open Graph, Twitter Cards) -->
    <!-- Structured data (Organization, Product schemas) -->
    <!-- Google Analytics 4 with consent management -->
</head>
```

### 2. Body Structure (MANDATORY)
```html
<body class="page-loading">
    <div class="safe-area-wrapper">
        <damp-header></damp-header>
        
        <!-- Page-specific content -->
        
        <footer class="footer lazy-section">
            <!-- All sitemap links required -->
        </footer>
    </div>
</body>
```

### 3. Performance Requirements
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1
- **Loading Strategy**: Critical CSS inline, lazy loading for sections
- **Image Optimization**: WebP format, proper sizing, lazy loading
- **Script Loading**: Module loading, deferred non-critical scripts

## 📊 Analytics & SEO Standards

### Google Analytics 4 (REQUIRED)
```javascript
// Consent management BEFORE configuration
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'security_storage': 'granted'
});

// Track all CTA clicks, form submissions, page views
// Custom events: product_view, comparison_view, cta_click
```

### SEO Requirements (ALL PAGES)
- **Title tags**: Page-specific, under 60 characters
- **Meta descriptions**: Under 160 characters, compelling
- **Canonical URLs**: Prevent duplicate content
- **Structured data**: Page-appropriate schema markup
- **Internal linking**: Cross-reference sitemap pages

## 🎨 Design System Standards

### Color Palette (EXACT SPECIFICATIONS)
```css
:root {
    --primary-color: #00d4ff;      /* Main CTAs, brand */
    --primary-dark: #0099cc;       /* Hover states */
    --secondary-color: #00ff88;    /* Success, positive */
    --accent-color: #ff4757;       /* Warnings, urgent */
    --bg-primary: #0f0f23;         /* Main background */
    --bg-secondary: #1a1a2e;       /* Section backgrounds */
    --bg-accent: #16213e;          /* Accent sections */
}
```

### Button Hierarchy
- **btn-primary**: Pre-order, main actions (#00d4ff)
- **btn-secondary**: Learn more, secondary actions
- **btn-tertiary**: Navigation, subtle actions
- **btn-material**: Enhanced cards with Material Design

### Typography Scale
- **Hero title**: `clamp(3rem, 8vw, 4.5rem)`
- **Section titles**: `2.5rem` desktop, `2rem` mobile
- **Section subtitles**: `1.25rem`, 80% opacity

## 🔒 Security Requirements

### Content Security Policy (EXACT)
```
default-src 'self'; 
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://js.stripe.com; 
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
img-src 'self' data: https://www.googletagmanager.com; 
font-src 'self' https://fonts.gstatic.com;
```

### Security Headers (8 REQUIRED)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000`
- `Permissions-Policy: camera=(), microphone=()`

## 📱 Mobile & Accessibility

### Mobile-First Design
- **Safe area support**: `env(safe-area-inset-*)`
- **Touch targets**: Minimum 44px
- **Viewport**: `width=device-width, initial-scale=1.0, viewport-fit=cover`
- **Hamburger navigation**: Required for mobile

### Accessibility (WCAG 2.1)
- **Alt text**: All images with descriptive text
- **ARIA labels**: Interactive elements
- **Keyboard navigation**: Tab order and focus states
- **Color contrast**: WCAG AA compliance
- **Screen readers**: Semantic HTML structure

## ✅ Testing Checklist

### Before Any Deployment
- [ ] All sitemap URLs accessible and working
- [ ] Analytics events firing correctly
- [ ] Core Web Vitals meet targets (<2.5s, <100ms, <0.1)
- [ ] Mobile responsive on all breakpoints
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] SEO meta tags complete and accurate
- [ ] Social media previews working correctly
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Performance budget met (Lighthouse score >90)
- [ ] Security headers configured correctly
- [ ] Error handling and fallbacks implemented

### Performance Testing Commands
```bash
# Lighthouse audit
npm run lighthouse

# Core Web Vitals
npm run test-cwv

# PWA compliance  
npm run test-pwa

# Cross-browser testing
npm run test-browsers
```

## 🚨 Critical Rules

### Never Do This:
1. **NEVER** modify meta tag order in `<head>`
2. **NEVER** remove security headers
3. **NEVER** skip analytics consent management
4. **NEVER** hardcode absolute URLs (use relative paths)
5. **NEVER** inline large JavaScript blocks
6. **NEVER** deploy without mobile testing
7. **NEVER** skip accessibility testing
8. **NEVER** ignore Core Web Vitals targets

### Always Do This:
1. **ALWAYS** use the safe area wrapper
2. **ALWAYS** include all required meta tags
3. **ALWAYS** add analytics attributes to buttons
4. **ALWAYS** optimize images (WebP, proper sizing)
5. **ALWAYS** test on real mobile devices
6. **ALWAYS** validate structured data
7. **ALWAYS** cross-reference sitemap.xml
8. **ALWAYS** run performance audits before deployment

## 🎯 Implementation Priority

### Week 1: Foundation
- [ ] Validate `index.html` against `INDEX_LAYOUT_GUIDE.md`
- [ ] Create `PRODUCTS_LAYOUT_GUIDE.md` using template
- [ ] Document `pre-sale-funnel.html` and `product-voting.html`

### Week 2: Product Pages
- [ ] Document all 4 individual product pages
- [ ] Ensure consistent product card patterns
- [ ] Validate cross-linking between products

### Week 3: Support & Info
- [ ] Document `how-it-works.html`, `about.html`, `support.html`
- [ ] Ensure FAQ sections follow consistent patterns
- [ ] Validate contact information and forms

### Week 4: Commerce & Legal
- [ ] Document commerce flow (cart, checkout, success)
- [ ] Document legal pages (privacy, terms, cookies)
- [ ] Final cross-reference with sitemap.xml

## 📞 Support & Resources

### Reference Documents
- **Google Engineering Practices**: `website/GOOGLE_ENGINEERING_PRACTICES.md`
- **Analytics Setup**: `website/ANALYTICS_SETUP.md`
- **Performance Guide**: Use browser dev tools, Lighthouse
- **SEO Validation**: schema.org validator, Google Search Console

### Debug Commands (localhost only)
```javascript
// Browser console commands
dampDebug.performance()    // Performance metrics
dampDebug.seo()           // SEO report  
dampDebug.iconReport()    // Icon validation
dampDebug.lazyLoading()   // Lazy loading stats
```

### Questions or Issues?
1. Check existing documentation files first
2. Validate against sitemap.xml priorities
3. Test on mobile devices
4. Use browser dev tools for debugging
5. Run Lighthouse audits for performance issues

---

**Master Documentation Version**: 1.0  
**Last Updated**: January 2025  
**Covers**: Complete site architecture and development standards  
**Next Update**: After Phase 1 implementation (Week 1) 