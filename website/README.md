# DAMP Smart Drinkware Website

Revolutionary BLE-enabled beverage tracking technology website with automated consistency management.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Check page consistency
npm run check-pages

# Auto-fix consistency issues
npm run fix-pages
```

## 📊 Page Management System

### **Page Inventory System**
- **Location**: `website/pages/page-inventory.json`
- **Purpose**: Centralized tracking of all website pages, components, and status
- **Features**:
  - Real-time component status tracking
  - Issue identification and resolution tracking
  - Last updated timestamps
  - Component requirement definitions

### **Automated Consistency Checker**
- **Location**: `tools/page-consistency-checker.js`
- **Purpose**: Automated detection and fixing of page inconsistencies
- **Features**:
  - Scans all HTML files for missing components
  - Auto-fixes hamburger navigation issues
  - Generates detailed reports
  - Updates page inventory automatically

## 🔧 Automation Commands

### Check Pages
```bash
npm run check-pages
```
Scans all pages and generates a report of missing components and consistency issues.

### Auto-Fix Pages
```bash
npm run fix-pages
```
Automatically fixes common issues like missing hamburger navigation, then updates the page inventory.

### Development Server
```bash
npm run dev
```
Starts a local development server on port 8080 for testing.

## 📋 Page Status Tracking

### **Current Status Overview**
- ✅ **Updated Pages**: `index.html`, `about.html`, `support.html`, `privacy.html`, `cart.html`, `success.html`, `pre-order.html`
- ⚠️ **Needs Update**: `waitlist.html`, `stripe-checkout.html`, `damp-handle-v1.0.html`, `baby-bottle-v1.0.html`, `cup-sleeve-v1.0.html`, `silicone-bottom-v1.0.html`

### **Required Components**
All pages must include:
- ✅ Responsive navigation with hamburger menu
- ✅ Google Analytics tracking
- ✅ SEO meta tags
- ✅ Safe area CSS variables
- ✅ Accessibility features
- ✅ Consistent styling

## 🎯 Page-Specific Requirements

### **Product Pages**
- Add to cart functionality
- Product structured data
- Early bird pricing display
- Feature highlights

### **Checkout Pages**
- Stripe integration
- Security measures
- Order confirmation
- Progress indicators

### **Info Pages**
- Contact information
- Legal compliance
- Support resources
- Clear navigation

## 🛠️ Maintenance Schedule

### **Daily**
- [ ] Check for broken links
- [ ] Monitor analytics

### **Weekly**
- [ ] Update product information
- [ ] Review user feedback
- [ ] Run consistency checker

### **Monthly**
- [ ] SEO optimization
- [ ] Performance audit
- [ ] Update page inventory

### **Quarterly**
- [ ] Design consistency review
- [ ] Feature updates
- [ ] Security updates

## 🔍 Troubleshooting

### **Common Issues**

**Missing Hamburger Navigation**
```bash
npm run fix-pages
```
This will automatically add the missing hamburger navigation to all pages.

**Inconsistent Navigation Links**
Check the `page-inventory.json` file for the standard navigation structure and manually update any non-standard implementations.

**Missing Analytics**
The consistency checker will identify pages missing Google Analytics. Add the standard GA4 implementation from the template.

## 📁 File Structure

```
website/
├── index.html                 # Main homepage
├── pages/
│   ├── page-inventory.json    # Page tracking system
│   ├── about.html
│   ├── support.html
│   ├── privacy.html
│   ├── cart.html
│   ├── success.html
│   ├── pre-order.html
│   ├── waitlist.html
│   ├── stripe-checkout.html
│   └── [product-pages].html
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
└── api/
    └── create-checkout-session.js
```

## 🚀 Development Workflow

1. **Before Making Changes**
   ```bash
   npm run check-pages
   ```

2. **Make Your Changes**
   - Edit HTML, CSS, or JS files
   - Follow the component standards in `page-inventory.json`

3. **Test Your Changes**
   ```bash
   npm run dev
   ```

4. **Check Consistency**
   ```bash
   npm run check-pages
   ```

5. **Auto-Fix if Needed**
   ```bash
   npm run fix-pages
   ```

## 📈 Performance Optimization

- **Mobile-First Design**: All pages are optimized for mobile devices first
- **Lazy Loading**: Images and non-critical resources are lazy-loaded
- **Minification**: CSS and JS are minified for production
- **Caching**: Static assets are cached with proper headers
- **CDN**: Assets are served from CDN for faster loading

## 🔐 Security Features

- **HTTPS Enforced**: All pages redirect to HTTPS
- **CSP Headers**: Content Security Policy headers prevent XSS
- **Input Validation**: All form inputs are validated client and server-side
- **Rate Limiting**: API endpoints have rate limiting protection

## 📱 Responsive Design

- **Breakpoints**: 768px (tablet), 480px (mobile)
- **Safe Areas**: Support for device safe areas (iPhone notch, etc.)
- **Touch Targets**: Minimum 44px touch targets for mobile
- **Font Scaling**: Responsive font sizes with viewport units

## 🎨 Design System

- **Colors**: Consistent color palette defined in CSS variables
- **Typography**: System fonts with fallbacks
- **Spacing**: Consistent spacing scale
- **Animations**: Smooth transitions with reduced motion support

## 📊 Analytics & Tracking

- **Google Analytics 4**: Comprehensive event tracking
- **Conversion Tracking**: E-commerce and goal tracking
- **Performance Monitoring**: Core Web Vitals tracking
- **User Behavior**: Scroll depth and engagement tracking

## 🤝 Contributing

1. Check current page status in `page-inventory.json`
2. Run consistency checker before starting work
3. Follow the established component patterns
4. Test on mobile and desktop
5. Update page inventory after changes
6. Run final consistency check

## 📞 Support

For technical support or questions about the page management system:
- **Email**: support@dampdrink.com
- **Documentation**: This README file
- **Tools**: Use the automated consistency checker

---

**Last Updated**: 2025-01-13  
**Version**: 1.0.0  
**Maintained by**: WeCr8 Solutions LLC