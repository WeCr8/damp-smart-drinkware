// FIXED: Multi-product pre-order system
document.addEventListener('DOMContentLoaded', function() {
    const products = {
        'damp-handle': { name: 'DAMP Handle v1.0', price: 49.99, originalPrice: 69.99, savings: 20.00 },
        'silicone-bottom': { name: 'DAMP Silicone Bottom', price: 29.99, originalPrice: 39.99, savings: 10.00 },
        'cup-sleeve': { name: 'DAMP Cup Sleeve', price: 34.99, originalPrice: 44.99, savings: 10.00 }
        // Removed baby-bottle for medical device compliance
    };

    let selectedProducts = {};

    // Product selection
    document.querySelectorAll('input[name="products"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const productId = this.value;
            const quantitySection = this.closest('.product-option').querySelector('.quantity-section');
            
            if (this.checked) {
                selectedProducts[productId] = {
                    quantity: 1,
                    color: this.closest('.product-option').querySelector('.color-select').value
                };
                quantitySection.style.display = 'block';
            } else {
                delete selectedProducts[productId];
                quantitySection.style.display = 'none';
            }
            
            updateOrderSummary();
        });
    });

    // Quantity controls
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.product;
            const input = this.parentElement.querySelector('.qty-input');
            const isPlus = this.classList.contains('plus');
            
            if (isPlus && input.value < 10) {
                input.value = parseInt(input.value) + 1;
            } else if (!isPlus && input.value > 1) {
                input.value = parseInt(input.value) - 1;
            }
            
            if (selectedProducts[productId]) {
                selectedProducts[productId].quantity = parseInt(input.value);
                updateOrderSummary();
            }
        });
    });

    // Direct quantity input
    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', function() {
            const productId = this.dataset.product;
            if (selectedProducts[productId]) {
                selectedProducts[productId].quantity = parseInt(this.value);
                updateOrderSummary();
            }
        });
    });

    // Color selection
    document.querySelectorAll('.color-select').forEach(select => {
        select.addEventListener('change', function() {
            const productId = this.dataset.product;
            if (selectedProducts[productId]) {
                selectedProducts[productId].color = this.value;
            }
        });
    });

    // Update order summary
    function updateOrderSummary() {
        const orderSummary = document.getElementById('orderSummary');
        const orderItems = document.getElementById('orderItems');
        const customerInfo = document.querySelector('.customer-info');
        
        if (Object.keys(selectedProducts).length === 0) {
            orderSummary.style.display = 'none';
            customerInfo.style.display = 'none';
            return;
        }

        orderSummary.style.display = 'block';
        customerInfo.style.display = 'block';

        let subtotal = 0;
        let totalSavings = 0;
        let itemsHTML = '';

        Object.entries(selectedProducts).forEach(([productId, details]) => {
            const product = products[productId];
            const itemTotal = product.price * details.quantity;
            const itemSavings = product.savings * details.quantity;
            
            subtotal += itemTotal;
            totalSavings += itemSavings;

            itemsHTML += `
                <div class="order-item">
                    <div class="item-details">
                        <span class="item-name">${product.name}</span>
                        <span class="item-specs">Color: ${details.color}, Qty: ${details.quantity}</span>
                    </div>
                    <div class="item-price">$${itemTotal.toFixed(2)}</div>
                </div>
            `;
        });

        orderItems.innerHTML = itemsHTML;
        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('totalSavings').textContent = `-$${totalSavings.toFixed(2)}`;
        document.getElementById('finalTotal').textContent = `$${subtotal.toFixed(2)}`;
    }

    // Form submission
    document.getElementById('preOrderForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const orderData = {
            products: selectedProducts,
            customer: {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value
            },
            timestamp: new Date().toISOString()
        };

        // Calculate total for checkout
        let total = 0;
        Object.entries(selectedProducts).forEach(([productId, details]) => {
            total += products[productId].price * details.quantity;
        });

        // Redirect to checkout with cart data
        const checkoutUrl = `stripe-checkout.html?${new URLSearchParams({
            cart: JSON.stringify(selectedProducts),
            total: total.toFixed(2)
        })}`;
        
        window.location.href = checkoutUrl;
    });
}); 