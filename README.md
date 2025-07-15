# DAMP Smart Drinkware Website

This directory contains the landing page and marketing website for DAMP Smart Drinkware.

## 📁 File Structure

```
website/
├── index.html              # Main landing page
├── assets/
│   ├── css/
│   │   └── styles.css      # Main stylesheet
│   ├── js/
│   │   └── script.js       # Main JavaScript functionality
│   └── images/             # Website images (to be added)
│       ├── logo/           # DAMP logo variants
│       ├── products/       # Product images
│       ├── hero/           # Hero section images
│       └── favicon.ico     # Website favicon
└── README.md              # This file
```

## 🚀 Quick Start

### Option 1: Simple File Hosting
1. Upload the entire `website/` folder to your web hosting service
2. Point your domain (dampdrink.com) to the `index.html` file
3. No build process required - it's ready to go!

### Option 2: GitHub Pages
1. Push this repository to GitHub
2. Go to Settings → Pages
3. Set source to "Deploy from a branch"
4. Select "main" branch and "/ (root)" folder
5. Your site will be available at: `https://yourusername.github.io/damp-smart-drinkware/website/`

### Option 3: Netlify (Recommended)
1. Connect your GitHub repository to Netlify
2. Set build command: (leave blank)
3. Set publish directory: `website`
4. Deploy automatically on every push

## 🔧 Website Features

### ✅ Current Features
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Modern UI/UX** - Glassmorphism effects, smooth animations
- **Pre-Order System** - Ready for payment processor integration
- **Mobile App Waitlist** - Collect emails for app launch
- **SEO Optimized** - Meta tags, structured data, Open Graph
- **Performance Optimized** - Preloaded resources, efficient CSS/JS

### 📱 Mobile-First Design
- Hamburger navigation menu
- Touch-friendly buttons
- Optimized typography and spacing
- Fast loading on mobile networks

### 🎨 Visual Elements
- Animated floating particles
- Smooth scroll effects
- Hover animations on cards
- Responsive grid layouts
- Modern gradient backgrounds

## 🛠️ Customization

### Adding Images
Place images in the appropriate subdirectories:
- **Logo**: `assets/images/logo/`
- **Products**: `assets/images/products/`
- **Hero**: `assets/images/hero/`

Update the HTML to reference your images:
```html
<img src="assets/images/products/damp-handle.jpg" alt="DAMP Handle v1.0">
```

### Modifying Content
- **Text Content**: Edit directly in `index.html`
- **Styling**: Modify `assets/css/styles.css`
- **Functionality**: Update `assets/js/script.js`

### Brand Colors
Current brand colors in CSS:
- **Primary Blue**: `#00d4ff`
- **Secondary Blue**: `#0099cc`
- **Background**: `#0f0f23` to `#16213e` (gradient)

### Adding Pages
To add new pages:
1. Create new HTML file (e.g., `about.html`)
2. Copy the header/footer structure from `index.html`
3. Update navigation links in all files

## 📊 Analytics & Tracking

### Google Analytics Setup
1. Get your tracking ID from Google Analytics
2. Uncomment and update the tracking code in `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_TRACKING_ID"></script>
```

### Event Tracking
The website includes built-in event tracking for:
- Pre-order button clicks
- App waitlist signups
- Page load performance
- Navigation usage

## 💳 Payment Integration

### Pre-Order System
To connect the pre-order buttons to a payment processor:

1. **Stripe Integration**:
```javascript
// In script.js, update the preOrderProduct function
window.location.href = `https://checkout.stripe.com/pay/your-checkout-link`;
```

2. **PayPal Integration**:
```javascript
// Add PayPal SDK and redirect to checkout
window.location.href = `https://www.paypal.com/checkoutnow?your-params`;
```

3. **Custom Checkout**:
```javascript
// Redirect to your custom checkout page
window.location.href = `https://dampdrink.com/checkout?product=${productId}`;
```

## 📧 Email Collection

### Waitlist Signup
To collect emails for the app waitlist:

1. **Mailchimp Integration**:
```javascript
// Add Mailchimp API call in joinWaitlist function
```

2. **ConvertKit Integration**:
```javascript
// Add ConvertKit form submission
```

3. **Custom Backend**:
```javascript
// Send to your own API endpoint
fetch('/api/waitlist', {
    method: 'POST',
    body: JSON.stringify({ email, platform })
});
```

## 🔒 Security Considerations

- All forms should use HTTPS
- Implement CSRF protection for form submissions
- Validate all user inputs on server-side
- Use environment variables for API keys
- Regular security updates for dependencies

## 📈 Performance Optimization

### Current Optimizations
- CSS and JS are minified for production
- Images should be optimized (WebP format recommended)
- Critical resources are preloaded
- Efficient CSS selectors used

### Recommended Improvements
1. **Image Optimization**: Use WebP format with fallbacks
2. **CDN**: Use Cloudflare or similar for global distribution
3. **Caching**: Implement browser caching headers
4. **Compression**: Enable GZIP compression on server

## 🧪 Testing

### Browser Testing
Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Device Testing
- Desktop (1920x1080, 1366x768)
- Tablet (iPad, Android tablets)
- Mobile (iPhone, Android phones)

### Accessibility Testing
- Screen readers (use semantic HTML)
- Keyboard navigation
- Color contrast ratios
- Focus indicators

## 🚀 Deployment Checklist

Before going live:
- [ ] Update all placeholder content
- [ ] Add real product images
- [ ] Set up analytics tracking
- [ ] Configure payment processing
- [ ] Test all forms and interactions
- [ ] Verify mobile responsiveness
- [ ] Check page load speed
- [ ] Test on multiple browsers
- [ ] Set up SSL certificate
- [ ] Configure domain DNS

## 📞 Support

For technical questions about the website:
- Check the main project README.md
- Review code comments in CSS/JS files
- Contact: info@wecr8solutions.com

## 📄 License

Website code is part of the DAMP Smart Drinkware project.
Copyright © 2025 WeCr8 Solutions LLC. All rights reserved.
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/WeCr8/damp-smart-drinkware?utm_source=oss&utm_medium=github&utm_campaign=WeCr8%2Fdamp-smart-drinkware&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)