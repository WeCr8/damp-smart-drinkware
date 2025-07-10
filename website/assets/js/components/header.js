// Google-style Web Component for DAMP Navigation
class DAMPHeader extends HTMLElement {
    constructor() {
        super();
        this.isSubPage = false;
        this.basePath = '';
    }

    connectedCallback() {
        // Detect if we're on a subpage or index page
        this.isSubPage = window.location.pathname.includes('/pages/');
        this.basePath = this.isSubPage ? '../' : '';
        
        this.innerHTML = `
            <nav role="navigation" aria-label="Main navigation">
                <div class="nav-container">
                    <a href="${this.basePath}index.html" class="logo" aria-label="DAMP Smart Drinkware Home">
                        <img src="${this.basePath}assets/images/logo/icon.png" alt="" width="32" height="32">
                        DAMP
                    </a>
                    <ul class="nav-links" role="menubar">
                        <li><a href="${this.basePath}index.html#features">Features</a></li>
                        <li><a href="${this.basePath}index.html#products">Products</a></li>
                        <li><a href="${this.basePath}index.html#app">App</a></li>
                        <li><a href="${this.basePath}pages/support.html">Support</a></li>
                        <li><a href="${this.basePath}pages/about.html">About</a></li>
                        <li><a href="${this.basePath}pages/cart.html">Cart</a></li>
                    </ul>
                    <button class="hamburger" aria-label="Toggle mobile menu" aria-expanded="false" aria-controls="mobile-menu">
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </nav>
            
            <!-- Mobile Menu -->
            <div class="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-heading">
                <button class="mobile-close" aria-label="Close mobile menu">&times;</button>
                <h2 id="mobile-menu-heading" class="sr-only">Mobile Navigation Menu</h2>
                <a href="${this.basePath}index.html">Home</a>
                <a href="${this.basePath}index.html#features">Features</a>
                <a href="${this.basePath}index.html#products">Products</a>
                <a href="${this.basePath}index.html#app">App</a>
                <a href="${this.basePath}pages/support.html">Support</a>
                <a href="${this.basePath}pages/about.html">About</a>
                <a href="${this.basePath}pages/cart.html">Cart</a>
            </div>
        `;
        
        // Initialize navigation functionality
        this.initializeNavigation();
    }

    initializeNavigation() {
        const hamburger = this.querySelector('.hamburger');
        const mobileMenu = this.querySelector('.mobile-menu');
        const mobileClose = this.querySelector('.mobile-close');
        
        if (hamburger && mobileMenu) {
            // Hamburger click event
            hamburger.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
            
            // Close button click event
            if (mobileClose) {
                mobileClose.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            }
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.contains(e.target) && mobileMenu.classList.contains('active')) {
                    this.closeMobileMenu();
                }
            });
            
            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                    this.closeMobileMenu();
                }
            });
            
            // Close menu when clicking mobile menu links
            const mobileLinks = mobileMenu.querySelectorAll('a');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    setTimeout(() => {
                        this.closeMobileMenu();
                    }, 100);
                });
            });
        }
    }

    toggleMobileMenu() {
        const hamburger = this.querySelector('.hamburger');
        const mobileMenu = this.querySelector('.mobile-menu');
        
        if (hamburger && mobileMenu) {
            const isOpen = mobileMenu.classList.contains('active');
            
            if (isOpen) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }
    }

    openMobileMenu() {
        const hamburger = this.querySelector('.hamburger');
        const mobileMenu = this.querySelector('.mobile-menu');
        
        if (hamburger && mobileMenu) {
            mobileMenu.classList.add('active');
            hamburger.classList.add('active');
            hamburger.setAttribute('aria-expanded', 'true');
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            // Focus first menu item
            const firstLink = mobileMenu.querySelector('a');
            if (firstLink) {
                setTimeout(() => {
                    firstLink.focus();
                }, 300);
            }
        }
    }

    closeMobileMenu() {
        const hamburger = this.querySelector('.hamburger');
        const mobileMenu = this.querySelector('.mobile-menu');
        
        if (hamburger && mobileMenu) {
            mobileMenu.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            
            // Restore body scroll
            document.body.style.overflow = '';
            
            // Return focus to hamburger
            hamburger.focus();
        }
    }
}

// Define the custom element
customElements.define('damp-header', DAMPHeader);

// Global function for backward compatibility
window.toggleMobileMenu = function() {
    const header = document.querySelector('damp-header');
    if (header) {
        header.toggleMobileMenu();
    }
}; 