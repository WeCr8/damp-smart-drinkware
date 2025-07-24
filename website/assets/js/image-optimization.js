// Add to hero animation script
function optimizeHeroImages() {
    const heroImages = document.querySelectorAll('.massive-reveal-logo');
    
    heroImages.forEach(img => {
        // Preload WebP if supported
        if (supportsWebP()) {
            const webpSrc = img.src.replace(/\.(png|jpg|jpeg)$/, '.webp');
            const webpImg = new Image();
            webpImg.onload = () => img.src = webpSrc;
            webpImg.src = webpSrc;
        }
        
        // Add loading optimizations
        img.decoding = 'async';
        img.loading = 'eager'; // Critical for animation
    });
}

function supportsWebP() {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
} 