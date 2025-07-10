/**
 * DAMP Product Page - Universal JavaScript
 * Handles product page functionality and interactions
 */

function initializeProductPage(config) {
    // Initialize product-specific features
    setupProductImageZoom();
    setupPreOrderTracking(config);
    setupSectionObserver(config);
    console.log(`Product page initialized: ${config.name}`);
}

function setupProductImageZoom() {
    const productImage = document.querySelector('.product-image img');
    if (productImage) {
        productImage.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        productImage.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
}

function setupPreOrderTracking(config) {
    // Track add to cart clicks
    document.querySelectorAll('a[href*="cart.html"]').forEach(button => {
        button.addEventListener('click', function() {
            trackProductInteraction('add_to_cart', config);
        });
    });
}

function setupSectionObserver(config) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                trackProductInteraction('view_' + entry.target.id, config);
            }
        });
    });
    
    document.querySelectorAll('section[id]').forEach(section => {
        observer.observe(section);
    });
}

function submitPreOrder(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // Show confirmation
    alert(`Thank you for pre-ordering ${productConfig.name}! 🚀\n\nYou'll receive a confirmation email shortly with payment instructions and development updates.`);
    
    // Track analytics
    trackProductInteraction('pre_order_submitted', productConfig, data);
    
    // In a real implementation, this would send data to your backend
    console.log('Pre-order data:', data);
}

function trackProductInteraction(action, config, data = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'product_interaction', {
            'product_name': config.name,
            'product_category': config.category,
            'action': action,
            'custom_data': data
        });
    }
} 