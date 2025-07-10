/**
 * Professional Test Suite for ProductCard Component
 */

describe('ProductCard Component', () => {
    let container;
    
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        
        // Mock fetch for testing
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    products: [{
                        id: 'test-product',
                        name: 'Test Product',
                        price: '$29.99',
                        features: ['Feature 1', 'Feature 2']
                    }]
                })
            })
        );
    });

    afterEach(() => {
        document.body.removeChild(container);
        jest.restoreAllMocks();
    });

    test('renders loading state initially', () => {
        const productCard = document.createElement('product-card');
        productCard.setAttribute('product-id', 'test-product');
        container.appendChild(productCard);
        
        expect(productCard.innerHTML).toContain('product-card--loading');
    });

    test('renders product data after loading', async () => {
        const productCard = document.createElement('product-card');
        productCard.setAttribute('product-id', 'test-product');
        container.appendChild(productCard);
        
        // Wait for async loading
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(productCard.innerHTML).toContain('Test Product');
        expect(productCard.innerHTML).toContain('$29.99');
    });

    test('handles error states gracefully', async () => {
        global.fetch.mockRejectedValueOnce(new Error('Network error'));
        
        const productCard = document.createElement('product-card');
        productCard.setAttribute('product-id', 'invalid-product');
        container.appendChild(productCard);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(productCard.innerHTML).toContain('product-card--error');
        expect(productCard.innerHTML).toContain('Unable to load product');
    });
}); 