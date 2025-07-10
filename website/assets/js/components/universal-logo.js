/**
 * Universal Logo Component
 * Handles logo display across all platforms with optimal loading
 */

class UniversalLogo extends HTMLElement {
    constructor() {
        super();
        this.size = this.getAttribute('size') || 'nav';
        this.alt = this.getAttribute('alt') || 'DAMP Smart Drinkware Logo';
        this.link = this.getAttribute('link') !== 'false';
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const logoConfig = {
            nav: { src: 'logo-nav.png', webp: 'logo-nav.webp', size: '32x32' },
            header: { src: 'logo-header.png', webp: 'logo-header.webp', size: '64x64' },
            hero: { src: 'logo-hero.png', webp: 'logo-hero.webp', size: '128x128' }
        };

        const config = logoConfig[this.size] || logoConfig.nav;
        const basePath = this.getBasePath();
        
        const logoHtml = `
            <picture class="damp-logo">
                <source srcset="${basePath}assets/images/logo/${config.webp}" type="image/webp">
                <img src="${basePath}assets/images/logo/${config.src}" 
                     alt="${this.alt}" 
                     width="${config.size.split('x')[0]}" 
                     height="${config.size.split('x')[1]}"
                     loading="eager"
                     decoding="async">
            </picture>
        `;

        if (this.link) {
            this.innerHTML = `
                <a href="${basePath}index.html" class="logo-link">
                    ${logoHtml}
                    <span class="logo-text">DAMP</span>
                </a>
            `;
        } else {
            this.innerHTML = logoHtml;
        }
    }

    getBasePath() {
        const depth = parseInt(this.getAttribute('depth') || '0');
        return depth > 0 ? '../'.repeat(depth) : '';
    }
}

customElements.define('damp-logo', UniversalLogo); 