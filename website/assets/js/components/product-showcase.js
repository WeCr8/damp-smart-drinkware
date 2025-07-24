/**
 * Enhanced Product Showcase - Interactive Features
 * Google Material Design with Enterprise-level functionality
 * Copyright 2025 WeCr8 Solutions LLC
 */

class DAMPProductShowcase {
    constructor() {
        this.products = new Map();
        this.comparisonList = [];
        this.wishlist = JSON.parse(localStorage.getItem('damp-wishlist') || '[]');
        this.expandedCategories = new Set();
        
        this.init();
    }
    
    init() {
        this.setupProductCards();
        this.setupFeatureToggles();
        this.setupActions();
        this.setupImageZoom();
        this.setupAnalytics();
        this.loadStoredStates();
        
        console.log('✅ DAMP Product Showcase initialized');
    }
    
    setupProductCards() {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const productId = card.dataset.product;
            
            // Store product data
            this.products.set(productId, {
                element: card,
                id: productId,
                name: card.querySelector('.product-title')?.textContent,
                price: card.querySelector('.price-main')?.textContent,
                rating: card.querySelector('.stars')?.textContent?.length || 5,
                features: this.extractFeatures(card)
            });
            
            // Add hover effects
            this.setupCardHoverEffects(card);
            
            // Setup ripple effects for Material Design
            this.setupRippleEffect(card);
        });
    }
    
    setupFeatureToggles() {
        // Main feature category toggles
        document.querySelectorAll('.feature-category-header').forEach(header => {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleFeatureCategory(header);
            });
        });
        
        // View more features buttons
        document.querySelectorAll('.view-more-features').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAllFeatures(button);
            });
        });
    }
    
    toggleFeatureCategory(header) {
        const category = header.dataset.category;
        const productCard = header.closest('.product-card');
        const productId = productCard.dataset.product;
        const content = header.nextElementSibling;
        const expandIcon = header.querySelector('.expand-icon');
        const categoryKey = `${productId}-${category}`;
        
        const isExpanded = this.expandedCategories.has(categoryKey);
        
        if (isExpanded) {
            // Collapse
            content.style.maxHeight = '0';
            content.classList.remove('expanded');
            header.classList.remove('expanded');
            expandIcon.style.transform = 'rotate(0deg)';
            this.expandedCategories.delete(categoryKey);
        } else {
            // Expand
            content.style.maxHeight = content.scrollHeight + 'px';
            content.classList.add('expanded');
            header.classList.add('expanded');
            expandIcon.style.transform = 'rotate(45deg)';
            this.expandedCategories.add(categoryKey);
        }
        
        // Analytics
        if (window.gtag) {
            gtag('event', 'feature_category_toggle', {
                event_category: 'product_interaction',
                event_label: `${productId}-${category}`,
                value: isExpanded ? 0 : 1
            });
        }
        
        // Save state
        this.saveExpandedStates();
    }
    
    showAllFeatures(button) {
        const productCard = button.closest('.product-card');
        const productId = productCard.dataset.product;
        const previewContainer = button.closest('.product-features-preview');
        
        // Create full features display
        const fullFeaturesHtml = this.generateFullFeaturesHtml(productId);
        
        // Replace preview with full features
        previewContainer.innerHTML = fullFeaturesHtml;
        
        // Setup new toggle functionality
        this.setupFeatureToggles();
        
        // Analytics
        if (window.gtag) {
            gtag('event', 'view_all_features', {
                event_category: 'product_interaction',
                event_label: productId,
                value: 1
            });
        }
    }
    
    setupActions() {
        // Compare buttons
        document.querySelectorAll('.compare-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleComparison(btn.dataset.product);
            });
        });
        
        // Wishlist buttons
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleWishlist(btn.dataset.product);
            });
        });
        
        // Share buttons
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.shareProduct(btn.dataset.product);
            });
        });
        
        // Image zoom buttons
        document.querySelectorAll('.image-zoom-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openImageModal(btn);
            });
        });
    }
    
    toggleComparison(productId) {
        const btn = document.querySelector(`.compare-btn[data-product="${productId}"]`);
        const isInComparison = this.comparisonList.includes(productId);
        
        if (isInComparison) {
            // Remove from comparison
            this.comparisonList = this.comparisonList.filter(id => id !== productId);
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
            this.showNotification(`Removed ${this.products.get(productId).name} from comparison`, 'info');
        } else {
            // Add to comparison (max 3 products)
            if (this.comparisonList.length >= 3) {
                this.showNotification('Maximum 3 products can be compared at once', 'warning');
                return;
            }
            
            this.comparisonList.push(productId);
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            this.showNotification(`Added ${this.products.get(productId).name} to comparison`, 'success');
        }
        
        this.updateComparisonUI();
        
        // Analytics
        if (window.gtag) {
            gtag('event', 'product_comparison', {
                event_category: 'product_interaction',
                event_label: productId,
                value: isInComparison ? 0 : 1
            });
        }
    }
    
    toggleWishlist(productId) {
        const btn = document.querySelector(`.wishlist-btn[data-product="${productId}"]`);
        const isInWishlist = this.wishlist.includes(productId);
        
        if (isInWishlist) {
            // Remove from wishlist
            this.wishlist = this.wishlist.filter(id => id !== productId);
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
            this.showNotification(`Removed ${this.products.get(productId).name} from wishlist`, 'info');
        } else {
            // Add to wishlist
            this.wishlist.push(productId);
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            this.showNotification(`Added ${this.products.get(productId).name} to wishlist`, 'success');
        }
        
        this.saveWishlist();
        
        // Analytics
        if (window.gtag) {
            gtag('event', 'wishlist_toggle', {
                event_category: 'product_interaction',
                event_label: productId,
                value: isInWishlist ? 0 : 1
            });
        }
    }
    
    async shareProduct(productId) {
        const product = this.products.get(productId);
        const productUrl = `${window.location.origin}/pages/${productId}-v1.0.html`;
        
        const shareData = {
            title: `DAMP ${product.name}`,
            text: `Check out the ${product.name} - Never leave your drink behind!`,
            url: productUrl
        };
        
        try {
            if (navigator.share) {
                // Use native share API
                await navigator.share(shareData);
                this.showNotification('Product shared successfully!', 'success');
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(productUrl);
                this.showNotification('Product link copied to clipboard!', 'success');
            }
            
            // Analytics
            if (window.gtag) {
                gtag('event', 'product_share', {
                    event_category: 'product_interaction',
                    event_label: productId,
                    value: 1
                });
            }
        } catch (error) {
            console.error('Share failed:', error);
            this.showNotification('Share failed. Please try again.', 'error');
        }
    }
    
    setupImageZoom() {
        // Create modal for image zoom
        this.createImageModal();
    }
    
    openImageModal(btn) {
        const productCard = btn.closest('.product-card');
        const productImage = productCard.querySelector('.product-image');
        const modal = document.getElementById('imageZoomModal');
        const modalImage = modal.querySelector('.modal-image');
        const productName = productCard.querySelector('.product-title').textContent;
        
        modalImage.src = productImage.src || productImage.dataset.src;
        modalImage.alt = `${productName} - Detailed View`;
        modal.querySelector('.modal-title').textContent = productName;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Analytics
        if (window.gtag) {
            gtag('event', 'image_zoom', {
                event_category: 'product_interaction',
                event_label: productCard.dataset.product,
                value: 1
            });
        }
    }
    
    createImageModal() {
        const modal = document.createElement('div');
        modal.id = 'imageZoomModal';
        modal.className = 'image-zoom-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="window.dampProductShowcase.closeImageModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title"></h3>
                    <button class="modal-close" onclick="window.dampProductShowcase.closeImageModal()" aria-label="Close modal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <img class="modal-image" src="" alt="" loading="eager">
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.closeImageModal();
            }
        });
    }
    
    closeImageModal() {
        const modal = document.getElementById('imageZoomModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    setupCardHoverEffects(card) {
        card.addEventListener('mouseenter', () => {
            // Preload higher quality images if needed
            const img = card.querySelector('.product-image');
            if (img.dataset.srcHd) {
                img.src = img.dataset.srcHd;
            }
        });
    }
    
    setupRippleEffect(card) {
        const materialBtns = card.querySelectorAll('.btn-material');
        
        materialBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ripple = btn.querySelector('.btn-ripple') || btn.querySelector(':before');
                if (ripple) {
                    const rect = btn.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;
                    
                    // Create ripple effect
                    btn.style.setProperty('--ripple-x', x + 'px');
                    btn.style.setProperty('--ripple-y', y + 'px');
                    btn.style.setProperty('--ripple-size', size + 'px');
                }
            });
        });
    }
    
    setupAnalytics() {
        // Track product card visibility
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const productId = entry.target.dataset.product;
                    if (window.gtag) {
                        gtag('event', 'product_view', {
                            event_category: 'product_interaction',
                            event_label: productId,
                            value: 1
                        });
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        document.querySelectorAll('.product-card').forEach(card => {
            observer.observe(card);
        });
    }
    
    updateComparisonUI() {
        // Show/hide comparison bar
        let comparisonBar = document.getElementById('comparisonBar');
        
        if (this.comparisonList.length > 0) {
            if (!comparisonBar) {
                comparisonBar = this.createComparisonBar();
            }
            this.updateComparisonBar(comparisonBar);
            comparisonBar.classList.add('active');
        } else if (comparisonBar) {
            comparisonBar.classList.remove('active');
        }
    }
    
    createComparisonBar() {
        const bar = document.createElement('div');
        bar.id = 'comparisonBar';
        bar.className = 'comparison-bar';
        bar.innerHTML = `
            <div class="comparison-content">
                <div class="comparison-products"></div>
                <div class="comparison-actions">
                    <button class="btn-material btn-primary" onclick="window.dampProductShowcase.openComparison()">
                        <span class="btn-text">Compare Products</span>
                        <span class="btn-icon">⚖️</span>
                    </button>
                    <button class="btn-clear" onclick="window.dampProductShowcase.clearComparison()" aria-label="Clear comparison">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(bar);
        return bar;
    }
    
    updateComparisonBar(bar) {
        const productsContainer = bar.querySelector('.comparison-products');
        productsContainer.innerHTML = this.comparisonList.map(productId => {
            const product = this.products.get(productId);
            return `
                <div class="comparison-product-item">
                    <span class="product-name">${product.name}</span>
                    <span class="product-price">${product.price}</span>
                </div>
            `;
        }).join('');
    }
    
    openComparison() {
        // Open comparison modal or navigate to comparison page
        const comparisonUrl = `/pages/products.html?compare=${this.comparisonList.join(',')}`;
        window.open(comparisonUrl, '_blank');
        
        // Analytics
        if (window.gtag) {
            gtag('event', 'comparison_open', {
                event_category: 'product_interaction',
                event_label: this.comparisonList.join(','),
                value: this.comparisonList.length
            });
        }
    }
    
    clearComparison() {
        this.comparisonList = [];
        document.querySelectorAll('.compare-btn.active').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        this.updateComparisonUI();
        this.showNotification('Comparison list cleared', 'info');
    }
    
    showNotification(message, type = 'info') {
        // Create or update notification system
        let notificationContainer = document.getElementById('notificationContainer');
        
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notificationContainer';
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()" aria-label="Close notification">×</button>
        `;
        
        notificationContainer.appendChild(notification);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 4000);
        
        // Add entrance animation
        setTimeout(() => {
            notification.classList.add('active');
        }, 100);
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
    
    extractFeatures(card) {
        const features = [];
        card.querySelectorAll('.feature-item').forEach(item => {
            const icon = item.querySelector('.feature-icon')?.textContent;
            const text = item.querySelector('.feature-text')?.textContent;
            if (text) features.push({ icon, text });
        });
        return features;
    }
    
    generateFullFeaturesHtml(productId) {
        // This would typically come from a data source
        const fullFeatures = this.getFullProductFeatures(productId);
        
        return fullFeatures.map(category => `
            <div class="feature-category">
                <button class="feature-category-header" data-category="${category.id}">
                    <span class="category-icon">${category.icon}</span>
                    <span class="category-title">${category.title}</span>
                    <span class="expand-icon">+</span>
                </button>
                <div class="feature-category-content">
                    <ul class="feature-list">
                        ${category.features.map(feature => `
                            <li class="feature-item">
                                <span class="feature-icon">${feature.icon}</span>
                                <span class="feature-text">${feature.text}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    }
    
    getFullProductFeatures(productId) {
        // Mock data - in production this would come from API/database
        const features = {
            handle: [
                {
                    id: 'technical',
                    icon: '⚡',
                    title: 'Technical Specs',
                    features: [
                        { icon: '🔋', text: '30-day battery life with BLE 5.0' },
                        { icon: '💧', text: 'IPX7 waterproof rating' },
                        { icon: '⚡', text: '5-second smart alert system' },
                        { icon: '📶', text: '100ft BLE range, unlimited WiFi' }
                    ]
                },
                {
                    id: 'compatibility',
                    icon: '🔗',
                    title: 'Compatibility',
                    features: [
                        { icon: '📱', text: 'iOS 14+ & Android 8+' },
                        { icon: '🔄', text: 'Universal clip-on design' },
                        { icon: '☕', text: 'Works with any drinkware' },
                        { icon: '🏠', text: 'Smart home integration' }
                    ]
                }
            ],
            // Add other products...
        };
        
        return features[productId] || [];
    }
    
    saveWishlist() {
        localStorage.setItem('damp-wishlist', JSON.stringify(this.wishlist));
    }
    
    saveExpandedStates() {
        localStorage.setItem('damp-expanded-categories', JSON.stringify([...this.expandedCategories]));
    }
    
    loadStoredStates() {
        // Load wishlist states
        this.wishlist.forEach(productId => {
            const btn = document.querySelector(`.wishlist-btn[data-product="${productId}"]`);
            if (btn) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            }
        });
        
        // Load expanded categories
        const expandedStates = JSON.parse(localStorage.getItem('damp-expanded-categories') || '[]');
        expandedStates.forEach(categoryKey => {
            this.expandedCategories.add(categoryKey);
            const [productId, category] = categoryKey.split('-');
            const header = document.querySelector(`.product-card[data-product="${productId}"] .feature-category-header[data-category="${category}"]`);
            if (header) {
                // Trigger expansion without animation for initial load
                const content = header.nextElementSibling;
                content.style.maxHeight = content.scrollHeight + 'px';
                content.classList.add('expanded');
                header.classList.add('expanded');
                header.querySelector('.expand-icon').style.transform = 'rotate(45deg)';
            }
        });
    }
}

// Mobile App Showcase Component
class DAMPMobileAppShowcase {
    constructor() {
        this.currentScreen = 'dashboard';
        this.screenshots = ['dashboard', 'alerts', 'settings', 'analytics'];
        this.autoRotateInterval = null;
        
        this.init();
    }
    
    init() {
        this.setupScreenNavigation();
        this.setupAutoRotation();
        this.setupAppStoreTracking();
        
        console.log('✅ DAMP Mobile App Showcase initialized');
    }
    
    setupScreenNavigation() {
        const navDots = document.querySelectorAll('.nav-dot');
        
        navDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const screen = dot.dataset.screen;
                this.showScreen(screen);
                this.pauseAutoRotation();
            });
        });
    }
    
    showScreen(screenId) {
        // Hide current screen
        document.querySelectorAll('.app-screenshot').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show new screen
        const newScreen = document.querySelector(`.app-screenshot[data-screen="${screenId}"]`);
        if (newScreen) {
            newScreen.classList.add('active');
        }
        
        // Update navigation
        document.querySelectorAll('.nav-dot').forEach(dot => {
            dot.classList.remove('active');
        });
        document.querySelector(`.nav-dot[data-screen="${screenId}"]`)?.classList.add('active');
        
        this.currentScreen = screenId;
        
        // Analytics
        if (window.gtag) {
            gtag('event', 'app_screen_view', {
                event_category: 'mobile_app_interaction',
                event_label: screenId,
                value: 1
            });
        }
    }
    
    setupAutoRotation() {
        const appMockup = document.querySelector('.app-mockup');
        
        if (appMockup) {
            // Start auto-rotation
            this.startAutoRotation();
            
            // Pause on hover
            appMockup.addEventListener('mouseenter', () => {
                this.pauseAutoRotation();
            });
            
            // Resume on leave
            appMockup.addEventListener('mouseleave', () => {
                this.startAutoRotation();
            });
        }
    }
    
    startAutoRotation() {
        this.autoRotateInterval = setInterval(() => {
            const currentIndex = this.screenshots.indexOf(this.currentScreen);
            const nextIndex = (currentIndex + 1) % this.screenshots.length;
            this.showScreen(this.screenshots[nextIndex]);
        }, 4000);
    }
    
    pauseAutoRotation() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }
    }
    
    setupAppStoreTracking() {
        document.querySelectorAll('.store-badge').forEach(badge => {
            badge.addEventListener('click', () => {
                const store = badge.classList.contains('apple-store') ? 'ios' : 'android';
                
                if (window.gtag) {
                    gtag('event', 'app_store_click', {
                        event_category: 'mobile_app_interaction',
                        event_label: store,
                        value: 1
                    });
                }
            });
        });
        
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const platform = btn.classList.contains('ios-download') ? 'ios' : 'android';
                
                if (window.gtag) {
                    gtag('event', 'app_download_click', {
                        event_category: 'mobile_app_interaction',
                        event_label: platform,
                        value: 1
                    });
                }
            });
        });
    }
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize product showcase
    window.dampProductShowcase = new DAMPProductShowcase();
    
    // Initialize mobile app showcase if section exists
    if (document.querySelector('.mobile-app-section')) {
        window.dampMobileAppShowcase = new DAMPMobileAppShowcase();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DAMPProductShowcase, DAMPMobileAppShowcase };
} 