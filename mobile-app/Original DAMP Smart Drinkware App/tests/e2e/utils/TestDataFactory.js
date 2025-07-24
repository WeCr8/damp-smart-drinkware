/**
 * Test Data Factory
 * 
 * Utility for creating test data for E2E tests
 */

export class TestDataFactory {
  /**
   * Creates a test user with random data
   */
  static createUser() {
    const randomId = Math.floor(Math.random() * 1000000);
    return {
      email: `test-user-${randomId}@example.com`,
      password: 'TestPassword123!',
      fullName: `Test User ${randomId}`,
    };
  }

  /**
   * Creates a test user in the database
   */
  static async createTestUser(userData) {
    // In a real implementation, this would call an API to create the user
    // For now, we'll just simulate it
    console.log(`Creating test user: ${userData.email}`);
    
    // Return simulated user data
    return {
      id: `user-${Date.now()}`,
      email: userData.email,
      fullName: userData.fullName,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Creates a mock device for testing
   */
  static createMockDevice(type, overrides = {}) {
    const deviceTypes = {
      cup: {
        name: 'Coffee Cup Handle',
        batteryLevel: 85,
        firmware: '1.2.3',
      },
      bottle: {
        name: 'Baby Bottle Tracker',
        batteryLevel: 92,
        firmware: '1.1.8',
      },
      sleeve: {
        name: 'Cup Sleeve',
        batteryLevel: 78,
        firmware: '1.0.5',
      },
      bottom: {
        name: 'Silicone Bottom',
        batteryLevel: 65,
        firmware: '1.3.2',
      },
    };
    
    const baseDevice = deviceTypes[type] || deviceTypes.cup;
    
    return {
      id: `device-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      status: 'disconnected',
      signalStrength: 4,
      lastSeen: new Date(),
      isActive: true,
      ...baseDevice,
      ...overrides,
    };
  }

  /**
   * Creates a paired device for a user
   */
  static async createPairedDevice(userId, device) {
    // In a real implementation, this would call an API to create the device
    console.log(`Creating paired device for user ${userId}: ${device.name}`);
    
    // Return simulated device data
    return {
      ...device,
      userId,
      pairedAt: new Date().toISOString(),
    };
  }

  /**
   * Creates a subscription for a user
   */
  static async createSubscription(userId, plan) {
    // In a real implementation, this would call an API to create the subscription
    console.log(`Creating ${plan} subscription for user ${userId}`);
    
    const plans = {
      free: {
        priceId: null,
        status: 'active',
      },
      premium: {
        priceId: 'price_1ReWLYCcrIDahSGRUnhZ9GpV',
        status: 'active',
      },
    };
    
    const planData = plans[plan] || plans.free;
    
    // Return simulated subscription data
    return {
      userId,
      priceId: planData.priceId,
      status: planData.status,
      currentPeriodEnd: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Updates a user's subscription
   */
  static async updateSubscription(userId, updates) {
    // In a real implementation, this would call an API to update the subscription
    console.log(`Updating subscription for user ${userId}:`, updates);
    
    // Return simulated updated subscription
    return {
      userId,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Creates mock invoices for a user
   */
  static async createInvoices(userId, invoices) {
    // In a real implementation, this would call an API to create invoices
    console.log(`Creating ${invoices.length} invoices for user ${userId}`);
    
    // Return simulated invoices
    return invoices.map((invoice, index) => ({
      id: `invoice-${Date.now()}-${index}`,
      userId,
      ...invoice,
      createdAt: new Date().toISOString(),
    }));
  }

  /**
   * Creates a zone for a user
   */
  static async createZone(userId, zoneData) {
    // In a real implementation, this would call an API to create a zone
    console.log(`Creating zone for user ${userId}: ${zoneData.name}`);
    
    // Return simulated zone data
    return {
      id: `zone-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId,
      ...zoneData,
      createdAt: new Date().toISOString(),
    };
  }
}