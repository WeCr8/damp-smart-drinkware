// DAMP SEO Optimizer - Google Engineering Best Practices
// Handles SEO optimization, structured data, and meta tag management

class DAMPSEOOptimizer {
    constructor(options = {}) {
        this.options = {
            enableStructuredData: true,
            enableMetaTags: true,
            enableOpenGraph: true,
            enableTwitterCards: true,
            enableBreadcrumbs: true,
            enableSitemap: true,
            baseUrl: window.location.origin,
            ...options
        };

        this.structuredData = [];
        this.metaTags = new Map();
        this.breadcrumbs = [];
        
        this.init();
    }

    init() {
        this.setupPageMetadata();
        this.generateStructuredData();
        this.setupBreadcrumbs();
        this.optimizeContent();
        this.setupAnalytics();
    }

    // Setup Page Metadata
    setupPageMetadata() {
        const pageData = this.getPageData();
        
        // Basic meta tags
        this.setMetaTag('description', pageData.description);
        this.setMetaTag('keywords', pageData.keywords);
        this.setMetaTag('robots', 'index, follow');
        this.setMetaTag('author', 'DAMP Smart Drinkware');
        this.setMetaTag('viewport', 'width=device-width, initial-scale=1.0');
        
        // Open Graph tags
        if (this.options.enableOpenGraph) {
            this.setMetaTag('og:title', pageData.title, 'property');
            this.setMetaTag('og:description', pageData.description, 'property');
            this.setMetaTag('og:image', pageData.image, 'property');
            this.setMetaTag('og:url', pageData.url, 'property');
            this.setMetaTag('og:type', pageData.type, 'property');
            this.setMetaTag('og:site_name', 'DAMP Smart Drinkware', 'property');
        }
        
        // Twitter Cards
        if (this.options.enableTwitterCards) {
            this.setMetaTag('twitter:card', 'summary_large_image', 'name');
            this.setMetaTag('twitter:title', pageData.title, 'name');
            this.setMetaTag('twitter:description', pageData.description, 'name');
            this.setMetaTag('twitter:image', pageData.image, 'name');
        }
        
        // Canonical URL
        this.setCanonicalUrl(pageData.url);
    }

    // Get Page Data
    getPageData() {
        const path = window.location.pathname;
        const baseData = {
            title: document.title || 'DAMP Smart Drinkware',
            description: 'Revolutionary smart drinkware with temperature control and health monitoring',
            keywords: 'smart drinkware, temperature control, health monitoring, leak protection',
            url: window.location.href,
            image: `${this.options.baseUrl}/assets/images/logo/icon-512.png`,
            type: 'website'
        };

        // Page-specific data
        if (path.includes('product') || path.includes('baby-bottle') || path.includes('cup-sleeve')) {
            return {
                ...baseData,
                type: 'product',
                description: 'Advanced smart drinkware with temperature control, health monitoring, and leak protection technology',
                keywords: 'smart bottle, smart cup, temperature control, health monitoring, leak protection, baby bottle'
            };
        }
        
        if (path.includes('about')) {
            return {
                ...baseData,
                title: 'About DAMP Smart Drinkware',
                description: 'Learn about DAMP\'s innovative smart drinkware technology and mission',
                type: 'article'
            };
        }
        
        if (path.includes('support')) {
            return {
                ...baseData,
                title: 'Support - DAMP Smart Drinkware',
                description: 'Get help and support for your DAMP smart drinkware products',
                type: 'article'
            };
        }
        
        return baseData;
    }

    // Set Meta Tag
    setMetaTag(name, content, attribute = 'name') {
        if (!content) return;
        
        let meta = document.querySelector(`meta[${attribute}="${name}"]`);
        
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attribute, name);
            document.head.appendChild(meta);
        }
        
        meta.setAttribute('content', content);
        this.metaTags.set(name, content);
    }

    // Set Canonical URL
    setCanonicalUrl(url) {
        let canonical = document.querySelector('link[rel="canonical"]');
        
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        
        canonical.href = url;
    }

    // Generate Structured Data
    generateStructuredData() {
        if (!this.options.enableStructuredData) return;
        
        const path = window.location.pathname;
        
        // Organization Schema
        this.addStructuredData(this.getOrganizationSchema());
        
        // Website Schema
        this.addStructuredData(this.getWebsiteSchema());
        
        // Page-specific schemas
        if (path.includes('product') || path.includes('baby-bottle') || path.includes('cup-sleeve')) {
            this.addStructuredData(this.getProductSchema());
        }
        
        if (path.includes('about')) {
            this.addStructuredData(this.getAboutPageSchema());
        }
        
        // FAQ Schema if FAQ content exists
        if (document.querySelector('.faq-section')) {
            this.addStructuredData(this.getFAQSchema());
        }
    }

    // Organization Schema
    getOrganizationSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "DAMP Smart Drinkware",
            "description": "Revolutionary smart drinkware technology with temperature control, health monitoring, and leak protection",
            "url": this.options.baseUrl,
            "logo": `${this.options.baseUrl}/assets/images/logo/icon-512.png`,
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-800-DAMP-HELP",
                "contactType": "customer service",
                "availableLanguage": "en"
            },
            "sameAs": [
                "https://facebook.com/dampsmartdrinkware",
                "https://twitter.com/dampdrinkware",
                "https://instagram.com/dampsmartdrinkware"
            ]
        };
    }

    // Website Schema
    getWebsiteSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "DAMP Smart Drinkware",
            "url": this.options.baseUrl,
            "potentialAction": {
                "@type": "SearchAction",
                "target": `${this.options.baseUrl}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
            }
        };
    }

    // Product Schema
    getProductSchema() {
        const path = window.location.pathname;
        let productData = {
            name: "DAMP Smart Drinkware",
            description: "Revolutionary smart drinkware with temperature control and health monitoring",
            image: `${this.options.baseUrl}/assets/images/products/damp-handle/damp-handle.png`,
            price: "69.99",
            currency: "USD"
        };

        if (path.includes('baby-bottle')) {
            productData = {
                name: "DAMP Baby Bottle v1.0",
                description: "Smart baby bottle with temperature monitoring and health tracking",
                image: `${this.options.baseUrl}/assets/images/products/baby-bottle/baby-bottle.png`,
                price: "99.99",
                currency: "USD"
            };
        } else if (path.includes('cup-sleeve')) {
            productData = {
                name: "DAMP Cup Sleeve v1.0",
                description: "Smart cup sleeve with temperature control and leak protection",
                image: `${this.options.baseUrl}/assets/images/products/cup-sleeve/cup-sleeve.png`,
                price: "44.99",
                currency: "USD"
            };
        } else if (path.includes('silicone-bottom')) {
            productData = {
                name: "DAMP Silicone Bottom v1.0",
                description: "Smart silicone bottom with temperature control and stability",
                image: `${this.options.baseUrl}/assets/images/products/silicone-bottom/silicone-bottome.png`,
                price: "39.99",
                currency: "USD"
            };
        }

        return {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": productData.name,
            "description": productData.description,
            "image": productData.image,
            "brand": {
                "@type": "Brand",
                "name": "DAMP"
            },
            "offers": {
                "@type": "Offer",
                "price": productData.price,
                "priceCurrency": productData.currency,
                "availability": "https://schema.org/InStock",
                "seller": {
                    "@type": "Organization",
                    "name": "DAMP Smart Drinkware"
                }
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "127"
            }
        };
    }

    // About Page Schema
    getAboutPageSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About DAMP Smart Drinkware",
            "description": "Learn about DAMP's innovative smart drinkware technology and mission",
            "url": `${this.options.baseUrl}/pages/about.html`,
            "mainEntity": {
                "@type": "Organization",
                "name": "DAMP Smart Drinkware"
            }
        };
    }

    // FAQ Schema
    getFAQSchema() {
        const faqItems = [];
        const faqElements = document.querySelectorAll('.faq-item');
        
        faqElements.forEach(item => {
            const question = item.querySelector('.faq-question')?.textContent;
            const answer = item.querySelector('.faq-answer')?.textContent;
            
            if (question && answer) {
                faqItems.push({
                    "@type": "Question",
                    "name": question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": answer
                    }
                });
            }
        });

        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqItems
        };
    }

    // Add Structured Data
    addStructuredData(schema) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
        
        this.structuredData.push(schema);
    }

    // Setup Breadcrumbs
    setupBreadcrumbs() {
        if (!this.options.enableBreadcrumbs) return;
        
        const breadcrumbs = this.generateBreadcrumbs();
        this.addBreadcrumbsToDOM(breadcrumbs);
        this.addBreadcrumbsSchema(breadcrumbs);
    }

    // Generate Breadcrumbs
    generateBreadcrumbs() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(segment => segment);
        
        const breadcrumbs = [
            { name: 'Home', url: '/' }
        ];
        
        let currentPath = '';
        
        segments.forEach(segment => {
            currentPath += `/${segment}`;
            
            let name = segment.replace(/[-_]/g, ' ');
            name = name.charAt(0).toUpperCase() + name.slice(1);
            
            // Custom names for known pages
            if (segment === 'baby-bottle-v1.0') name = 'Baby Bottle v1.0';
            if (segment === 'cup-sleeve-v1.0') name = 'Cup Sleeve v1.0';
            if (segment === 'damp-handle-v1.0') name = 'DAMP Handle v1.0';
            if (segment === 'silicone-bottom-v1.0') name = 'Silicone Bottom v1.0';
            
            breadcrumbs.push({
                name: name,
                url: currentPath
            });
        });
        
        return breadcrumbs;
    }

    // Add Breadcrumbs to DOM
    addBreadcrumbsToDOM(breadcrumbs) {
        let breadcrumbContainer = document.querySelector('.breadcrumbs');
        
        if (!breadcrumbContainer) {
            breadcrumbContainer = document.createElement('nav');
            breadcrumbContainer.className = 'breadcrumbs';
            breadcrumbContainer.setAttribute('aria-label', 'Breadcrumb navigation');
            
            // Insert after header or at beginning of main content
            const header = document.querySelector('header');
            const main = document.querySelector('main');
            
            if (header && header.nextSibling) {
                header.parentNode.insertBefore(breadcrumbContainer, header.nextSibling);
            } else if (main) {
                main.insertBefore(breadcrumbContainer, main.firstChild);
            }
        }
        
        const breadcrumbHTML = breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            if (isLast) {
                return `<span class="breadcrumb-current" aria-current="page">${item.name}</span>`;
            } else {
                return `<a href="${item.url}" class="breadcrumb-link">${item.name}</a>`;
            }
        }).join(' <span class="breadcrumb-separator">/</span> ');
        
        breadcrumbContainer.innerHTML = breadcrumbHTML;
        
        // Add CSS if not present
        if (!document.querySelector('#breadcrumb-styles')) {
            const style = document.createElement('style');
            style.id = 'breadcrumb-styles';
            style.textContent = `
                .breadcrumbs {
                    padding: 1rem 0;
                    font-size: 0.9rem;
                    color: #666;
                }
                
                .breadcrumb-link {
                    color: #667eea;
                    text-decoration: none;
                    transition: color 0.3s ease;
                }
                
                .breadcrumb-link:hover {
                    color: #764ba2;
                    text-decoration: underline;
                }
                
                .breadcrumb-separator {
                    margin: 0 0.5rem;
                    color: #999;
                }
                
                .breadcrumb-current {
                    color: #333;
                    font-weight: 500;
                }
                
                @media (max-width: 768px) {
                    .breadcrumbs {
                        font-size: 0.8rem;
                        padding: 0.5rem 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Add Breadcrumbs Schema
    addBreadcrumbsSchema(breadcrumbs) {
        const breadcrumbList = breadcrumbs.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": `${this.options.baseUrl}${item.url}`
        }));
        
        const schema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbList
        };
        
        this.addStructuredData(schema);
    }

    // Optimize Content
    optimizeContent() {
        // Add alt text to images without it
        const images = document.querySelectorAll('img:not([alt])');
        images.forEach(img => {
            const altText = this.generateAltText(img);
            if (altText) {
                img.setAttribute('alt', altText);
            }
        });
        
        // Add heading hierarchy
        this.optimizeHeadings();
        
        // Add semantic HTML
        this.addSemanticHTML();
    }

    // Generate Alt Text
    generateAltText(img) {
        const src = img.src;
        const fileName = src.split('/').pop().split('.')[0];
        
        // Convert filename to readable text
        let altText = fileName.replace(/[-_]/g, ' ');
        altText = altText.replace(/\b\w/g, l => l.toUpperCase());
        
        // Add context based on page
        const path = window.location.pathname;
        if (path.includes('baby-bottle')) {
            altText = `${altText} - Smart Baby Bottle`;
        } else if (path.includes('cup-sleeve')) {
            altText = `${altText} - Smart Cup Sleeve`;
        } else if (path.includes('damp-handle')) {
            altText = `${altText} - DAMP Handle`;
        } else if (path.includes('silicone-bottom')) {
            altText = `${altText} - Silicone Bottom`;
        }
        
        return altText;
    }

    // Optimize Headings
    optimizeHeadings() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let currentLevel = 0;
        
        headings.forEach(heading => {
            const level = parseInt(heading.tagName.charAt(1));
            
            // Ensure proper heading hierarchy
            if (level > currentLevel + 1) {
                console.warn(`Heading hierarchy issue: ${heading.tagName} after h${currentLevel}`);
            }
            
            currentLevel = level;
            
            // Add ID for linking
            if (!heading.id) {
                const id = heading.textContent.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                heading.id = id;
            }
        });
    }

    // Add Semantic HTML
    addSemanticHTML() {
        // Wrap navigation in nav element
        const navElements = document.querySelectorAll('.navigation:not(nav)');
        navElements.forEach(nav => {
            if (nav.tagName !== 'NAV') {
                const wrapper = document.createElement('nav');
                nav.parentNode.insertBefore(wrapper, nav);
                wrapper.appendChild(nav);
            }
        });
        
        // Add main element if missing
        if (!document.querySelector('main')) {
            const content = document.querySelector('.content, .main-content, #content');
            if (content && content.tagName !== 'MAIN') {
                const main = document.createElement('main');
                content.parentNode.insertBefore(main, content);
                main.appendChild(content);
            }
        }
    }

    // Setup Analytics
    setupAnalytics() {
        // Enhanced measurement events
        this.trackPageView();
        this.trackUserEngagement();
        this.trackConversions();
    }

    // Track Page View
    trackPageView() {
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: document.title,
                page_location: window.location.href,
                content_group1: this.getContentGroup()
            });
        }
    }

    // Get Content Group
    getContentGroup() {
        const path = window.location.pathname;
        
        if (path.includes('product') || path.includes('baby-bottle') || path.includes('cup-sleeve')) {
            return 'Products';
        } else if (path.includes('about')) {
            return 'About';
        } else if (path.includes('support')) {
            return 'Support';
        } else if (path.includes('cart')) {
            return 'E-commerce';
        } else {
            return 'General';
        }
    }

    // Track User Engagement
    trackUserEngagement() {
        // Scroll depth tracking
        let maxScrollDepth = 0;
        
        const trackScroll = () => {
            const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                
                // Track milestones
                if (scrollDepth >= 25 && scrollDepth < 50) {
                    this.trackEvent('scroll_depth', { depth: 25 });
                } else if (scrollDepth >= 50 && scrollDepth < 75) {
                    this.trackEvent('scroll_depth', { depth: 50 });
                } else if (scrollDepth >= 75 && scrollDepth < 100) {
                    this.trackEvent('scroll_depth', { depth: 75 });
                } else if (scrollDepth >= 100) {
                    this.trackEvent('scroll_depth', { depth: 100 });
                }
            }
        };
        
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(trackScroll, 100);
        });
    }

    // Track Conversions
    trackConversions() {
        // Form submissions
        document.addEventListener('submit', (event) => {
            const form = event.target;
            
            this.trackEvent('form_submit', {
                form_id: form.id,
                form_name: form.name,
                page_location: window.location.href
            });
        });
        
        // Product interactions
        document.addEventListener('click', (event) => {
            const target = event.target;
            
            if (target.classList.contains('add-to-cart')) {
                this.trackEvent('add_to_cart', {
                    item_name: target.dataset.product,
                    value: target.dataset.price,
                    currency: 'USD'
                });
            }
            
            if (target.classList.contains('product-link')) {
                this.trackEvent('view_item', {
                    item_name: target.dataset.product,
                    item_category: 'Smart Drinkware'
                });
            }
        });
    }

    // Track Event
    trackEvent(eventName, parameters = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }
    }

    // Get SEO Report
    getSEOReport() {
        return {
            metaTags: Object.fromEntries(this.metaTags),
            structuredData: this.structuredData,
            breadcrumbs: this.breadcrumbs,
            images: {
                total: document.querySelectorAll('img').length,
                withAlt: document.querySelectorAll('img[alt]').length
            },
            headings: {
                h1: document.querySelectorAll('h1').length,
                h2: document.querySelectorAll('h2').length,
                h3: document.querySelectorAll('h3').length
            }
        };
    }
}

// Auto-initialize SEO Optimizer
let dampSEOOptimizer;

function initSEOOptimizer(options = {}) {
    dampSEOOptimizer = new DAMPSEOOptimizer(options);
    window.dampSEOOptimizer = dampSEOOptimizer;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSEOOptimizer);
} else {
    initSEOOptimizer();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPSEOOptimizer;
}

console.log('DAMP SEO Optimizer initialized'); 