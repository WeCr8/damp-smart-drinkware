// Google-style Web Component
class DAMPHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav role="navigation" aria-label="Main navigation">
                <div class="nav-container">
                    <a href="#" class="logo" aria-label="DAMP Smart Drinkware Home">
                        <img src="assets/images/logo/icon.png" alt="" width="32" height="32">
                        DAMP
                    </a>
                    <ul class="nav-links" role="menubar">
                        <li><a href="#features">Features</a></li>
                        <li><a href="#products">Products</a></li>
                        <li><a href="#app">App</a></li>
                        <li><a href="pages/support.html">Support</a></li>
                        <li><a href="pages/about.html">About</a></li>
                        <li><a href="pages/cart.html">Cart</a></li>
                    </ul>
                    <button class="hamburger" onclick="toggleMobileMenu()" aria-label="Toggle mobile menu">
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </nav>
        `;
    }
}
customElements.define('damp-header', DAMPHeader); 