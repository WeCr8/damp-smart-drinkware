import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Star, 
  Truck, 
  Shield, 
  CreditCard,
  X,
  Package,
  Zap,
  Droplets,
  Coffee,
  Baby
} from 'lucide-react-native';
import BaseModal from './BaseModal';
import CategorySlider from '@/components/CategorySlider';
import { BaseModalProps } from '@/types/settings';
import { supabase } from '@/lib/supabase';

interface StoreModalProps extends BaseModalProps {}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: 'handles' | 'sleeves' | 'bottles' | 'accessories' | 'bundles';
  features: string[];
  inStock: boolean;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isBestseller?: boolean;
  freeShipping?: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

const { width: screenWidth } = Dimensions.get('window');

export default function StoreModal({ visible, onClose }: StoreModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (visible) {
      loadProducts();
    }
  }, [visible]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from your API
      const mockProducts: Product[] = [
        {
          id: 'damp-cup-pro',
          name: 'DAMP Smart Cup Pro',
          description: 'Premium smart cup with advanced tracking, temperature control, and premium materials.',
          price: 89.99,
          originalPrice: 119.99,
          images: [
            'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=800'
          ],
          category: 'bundles',
          features: ['Built-in tracking', 'Temperature control', 'Premium ceramic', '30-day battery'],
          inStock: true,
          rating: 4.8,
          reviewCount: 127,
          isBestseller: true,
          freeShipping: true,
        },
        {
          id: 'smart-handle-v2',
          name: 'Smart Handle v2.0',
          description: 'Universal smart handle that attaches to any mug or cup with enhanced sensors.',
          price: 34.99,
          images: [
            'https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=800'
          ],
          category: 'handles',
          features: ['Universal fit', 'Enhanced sensors', 'Waterproof', '45-day battery'],
          inStock: true,
          rating: 4.6,
          reviewCount: 89,
          freeShipping: true,
        },
        {
          id: 'premium-sleeve',
          name: 'Premium Cup Sleeve',
          description: 'Insulated smart sleeve with tracking capabilities for any drinkware.',
          price: 24.99,
          originalPrice: 29.99,
          images: [
            'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800'
          ],
          category: 'sleeves',
          features: ['Universal fit', 'Insulation', 'Spill detection', 'Machine washable'],
          inStock: true,
          rating: 4.4,
          reviewCount: 156,
        },
        {
          id: 'baby-bottle-tracker',
          name: 'Baby Bottle Tracker',
          description: 'Safe, smart tracking for baby bottles with feeding reminders and temperature alerts.',
          price: 39.99,
          images: [
            'https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=800'
          ],
          category: 'bottles',
          features: ['BPA-free materials', 'Feeding reminders', 'Temperature alerts', 'Safe for babies'],
          inStock: true,
          rating: 4.9,
          reviewCount: 203,
          isNew: true,
          freeShipping: true,
        },
        {
          id: 'family-bundle',
          name: 'Family Bundle (4 devices)',
          description: 'Complete family package with 4 smart devices and premium features.',
          price: 149.99,
          originalPrice: 199.99,
          images: [
            'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=800'
          ],
          category: 'bundles',
          features: ['4 smart devices', 'Family sharing', 'Premium support', 'Free shipping'],
          inStock: true,
          rating: 4.7,
          reviewCount: 78,
          isBestseller: true,
          freeShipping: true,
        },
        {
          id: 'charging-dock',
          name: 'Wireless Charging Dock',
          description: 'Elegant wireless charging station for all your DAMP devices.',
          price: 49.99,
          images: [
            'https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=800'
          ],
          category: 'accessories',
          features: ['Wireless charging', 'Multiple devices', 'LED indicators', 'Premium design'],
          inStock: false,
          rating: 4.5,
          reviewCount: 34,
        },
      ];

      setProducts(mockProducts);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Products', icon: <Package size={16} color="#0277BD" /> },
    { id: 'bundles', name: 'Bundles', icon: <Star size={16} color="#0277BD" /> },
    { id: 'handles', name: 'Handles', icon: <Coffee size={16} color="#0277BD" /> },
    { id: 'sleeves', name: 'Sleeves', icon: <Droplets size={16} color="#0277BD" /> },
    { id: 'bottles', name: 'Bottles', icon: <Baby size={16} color="#0277BD" /> },
    { id: 'accessories', name: 'Accessories', icon: <Zap size={16} color="#0277BD" /> },
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        Alert.alert('Authentication Required', 'Please log in to complete your purchase.');
        return;
      }

      // Create line items for Stripe
      const lineItems = cart.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description,
            images: item.images,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      }));

      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stripe-store-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          line_items: lineItems,
          success_url: `${window.location.origin}/store/success`,
          cancel_url: `${window.location.origin}/store`,
          mode: 'payment',
          metadata: {
            cart_items: JSON.stringify(cart.map(item => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price
            }))),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      Alert.alert('Checkout Error', err.message || 'Failed to start checkout process');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'handles': return <Coffee size={12} color="#0277BD" />;
      case 'sleeves': return <Droplets size={12} color="#0277BD" />;
      case 'bottles': return <Baby size={12} color="#0277BD" />;
      case 'accessories': return <Zap size={12} color="#0277BD" />;
      case 'bundles': return <Star size={12} color="#0277BD" />;
      default: return <Package size={12} color="#0277BD" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        color={i < Math.floor(rating) ? "#FFD700" : "#E0E0E0"}
        fill={i < Math.floor(rating) ? "#FFD700" : "transparent"}
      />
    ));
  };

  const renderProductCard = (product: Product) => {
    const cartItem = cart.find(item => item.id === product.id);
    const isDiscounted = product.originalPrice && product.originalPrice > product.price;

    return (
      <TouchableOpacity
        key={product.id}
        style={styles.productCard}
        onPress={() => setSelectedProduct(product)}
        activeOpacity={0.9}
        testID={`product-card`}
        accessibilityLabel={product.name}
      >
        {/* Product Badges */}
        <View style={styles.badgeContainer}>
          {product.isNew && (
            <View style={[styles.badge, styles.newBadge]}>
              <Text style={styles.badgeText}>NEW</Text>
            </View>
          )}
          {product.isBestseller && (
            <View style={[styles.badge, styles.bestsellerBadge]}>
              <Text style={styles.badgeText}>BESTSELLER</Text>
            </View>
          )}
          {isDiscounted && (
            <View style={[styles.badge, styles.saleBadge]}>
              <Text style={styles.badgeText}>SALE</Text>
            </View>
          )}
        </View>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.images[0] }} 
            style={styles.productImage} 
            testID="product-image"
          />
          {!product.inStock && (
            <View style={styles.outOfStockOverlay} testID="out-of-stock">
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.categoryTag} testID="product-category">
            {getCategoryIcon(product.category)}
            <Text style={styles.categoryText}>
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </Text>
          </View>

          <Text style={styles.productName} numberOfLines={2} testID="product-name">
            {product.name}
          </Text>

          <Text style={styles.productDescription} numberOfLines={2} testID="product-description">
            {product.description}
          </Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.stars} testID="product-rating">
              {renderStars(product.rating)}
            </View>
            <Text style={styles.ratingText}>
              {product.rating} ({product.reviewCount})
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer} testID="product-features">
            {product.features.slice(0, 2).map((feature, index) => (
              <View key={index} style={styles.featureTag}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Price and Actions */}
          <View style={styles.priceContainer}>
            <View style={styles.priceInfo}>
              <Text style={styles.price} testID="product-price">${product.price}</Text>
              {isDiscounted && (
                <Text style={styles.originalPrice} testID="product-original-price">${product.originalPrice}</Text>
              )}
            </View>

            {product.freeShipping && (
              <View style={styles.shippingTag} testID="free-shipping-badge">
                <Truck size={10} color="#4CAF50" />
                <Text style={styles.shippingText}>Free Ship</Text>
              </View>
            )}
          </View>

          {/* Add to Cart */}
          {product.inStock ? (
            <View style={styles.cartActions}>
              {cartItem ? (
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => removeFromCart(product.id)}
                    testID="quantity-decrease"
                  >
                    <Minus size={16} color="#0277BD" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText} testID="quantity-value">{cartItem.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => addToCart(product)}
                    testID="quantity-increase"
                  >
                    <Plus size={16} color="#0277BD" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addToCartButton}
                  onPress={() => addToCart(product)}
                  testID="add-to-cart-button"
                >
                  <ShoppingCart size={16} color="#FFFFFF" />
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.outOfStockButton}>
              <Text style={styles.outOfStockButtonText} testID="out-of-stock-button">Out of Stock</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <BaseModal visible={visible} onClose={onClose} title="DAMP Store">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0277BD" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="DAMP Store"
      presentationStyle="fullScreen"
    >
      <LinearGradient colors={['#E0F7FF', '#F8FCFF']} style={styles.container} testID="store-modal">
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.storeTitle}>DAMP Store</Text>
              <Text style={styles.storeSubtitle}>Premium smart drinkware</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#0277BD" />
            </TouchableOpacity>
          </View>

          {/* Categories - Using the reusable CategorySlider component */}
          <View testID="categories-container">
            <CategorySlider
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </View>

          {/* Products */}
          <ScrollView
            style={styles.productsContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productsContent}
          >
            <View style={styles.productsGrid}>
              {filteredProducts.map(renderProductCard)}
            </View>
          </ScrollView>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <View style={styles.cartSummary} testID="cart-summary">
              <LinearGradient
                colors={['#0277BD', '#0288D1']}
                style={styles.cartSummaryGradient}
              >
                <View style={styles.cartInfo}>
                  <View style={styles.cartDetails}>
                    <Text style={styles.cartItemCount} testID="cart-item-count">
                      {getCartItemCount()} item{getCartItemCount() > 1 ? 's' : ''}
                    </Text>
                    <Text style={styles.cartTotal} testID="cart-total">
                      ${getCartTotal().toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.cartBenefits}>
                    <View style={styles.benefit}>
                      <Shield size={12} color="#FFFFFF" />
                      <Text style={styles.benefitText}>Secure</Text>
                    </View>
                    <View style={styles.benefit}>
                      <Truck size={12} color="#FFFFFF" />
                      <Text style={styles.benefitText}>Free Ship $50+</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.checkoutButton}
                  onPress={handleCheckout}
                  disabled={checkoutLoading}
                  testID="checkout-button"
                >
                  {checkoutLoading ? (
                    <ActivityIndicator size="small" color="#0277BD" />
                  ) : (
                    <>
                      <CreditCard size={20} color="#0277BD" />
                      <Text style={styles.checkoutButtonText}>Checkout</Text>
                    </>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>
    </BaseModal>
  );
}

// Use StyleSheet from react-native directly
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1F5FE',
  },
  headerLeft: {
    flex: 1,
  },
  storeTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#0277BD',
  },
  storeSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FCFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productsContainer: {
    flex: 1,
  },
  productsContent: {
    padding: 20,
  },
  productsGrid: {
    gap: 20,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
    gap: 6,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  newBadge: {
    backgroundColor: '#4CAF50',
  },
  bestsellerBadge: {
    backgroundColor: '#FF9800',
  },
  saleBadge: {
    backgroundColor: '#F44336',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  productInfo: {
    padding: 20,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#0277BD',
    marginLeft: 4,
  },
  productName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#0277BD',
    marginBottom: 8,
    lineHeight: 24,
  },
  productDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    lineHeight: 20,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  featureTag: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  featureText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#4CAF50',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#0277BD',
  },
  originalPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64B5F6',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  shippingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  shippingText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#4CAF50',
    marginLeft: 4,
  },
  cartActions: {
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCFF',
    borderRadius: 12,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0277BD',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    justifyContent: 'center',
    width: '100%',
  },
  addToCartText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  outOfStockButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  outOfStockButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9E9E9E',
  },
  cartSummary: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E1F5FE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cartSummaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  cartInfo: {
    flex: 1,
  },
  cartDetails: {
    marginBottom: 8,
  },
  cartItemCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  cartTotal: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  cartBenefits: {
    flexDirection: 'row',
    gap: 16,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginLeft: 4,
    opacity: 0.9,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginLeft: 16,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0277BD',
    marginLeft: 8,
  },
});