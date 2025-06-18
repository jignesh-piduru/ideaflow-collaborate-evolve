// Subscription API service for subscription and billing management
interface Subscription {
  id: string;
  userId: string;
  planName: string;
  plan: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  features: string[];
  paymentMethod?: string;
  nextBillingDate?: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: { empty: boolean; unsorted: boolean; sorted: boolean };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  sort: { empty: boolean; unsorted: boolean; sorted: boolean };
  numberOfElements: number;
  empty: boolean;
}

// Mock data
const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    userId: 'afde270f-a1c4-4b75-a3d7-ba861609df0c',
    planName: 'Premium Plan',
    plan: 'PREMIUM',
    status: 'ACTIVE',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    price: 99.99,
    currency: 'USD',
    billingCycle: 'YEARLY',
    features: ['Advanced Analytics', 'Priority Support', 'Custom Integrations', 'Unlimited Projects'],
    paymentMethod: 'Credit Card (**** 1234)',
    nextBillingDate: '2025-01-01T00:00:00Z',
    autoRenew: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    userId: 'afde270f-a1c4-4b75-a3d7-ba861609df0c',
    planName: 'Basic Plan',
    plan: 'BASIC',
    status: 'INACTIVE',
    startDate: '2023-01-01T00:00:00Z',
    endDate: '2023-12-31T23:59:59Z',
    price: 29.99,
    currency: 'USD',
    billingCycle: 'YEARLY',
    features: ['Basic Analytics', 'Email Support', '5 Projects'],
    paymentMethod: 'Credit Card (**** 5678)',
    nextBillingDate: null,
    autoRenew: false,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-12-31T23:59:59Z'
  }
];

// Storage keys for localStorage
const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'subscriptions_data'
};

// Helper functions
function loadFromStorage<T>(key: string, defaultData: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultData;
  } catch {
    return defaultData;
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

function createMockResponse<T>(data: T[], page = 0, size = 20): ApiResponse<T> {
  return {
    content: data,
    pageable: {
      pageNumber: page,
      pageSize: size,
      sort: { empty: false, unsorted: false, sorted: true },
      offset: page * size,
      unpaged: false,
      paged: true
    },
    last: true,
    totalElements: data.length,
    totalPages: 1,
    first: true,
    size: size,
    number: page,
    sort: { empty: false, unsorted: false, sorted: true },
    numberOfElements: data.length,
    empty: data.length === 0
  };
}

// Helper function to validate and normalize subscription data
function validateSubscription(sub: any): Subscription {
  return {
    ...sub,
    id: sub.id || Date.now().toString(),
    userId: sub.userId || 'afde270f-a1c4-4b75-a3d7-ba861609df0c',
    planName: sub.planName || 'Basic Plan',
    planType: sub.planType || 'BASIC',
    status: sub.status || 'PENDING',
    startDate: sub.startDate || new Date().toISOString(),
    endDate: sub.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    price: typeof sub.price === 'number' ? sub.price : 0,
    currency: sub.currency && sub.currency.length === 3 ? sub.currency.toUpperCase() : 'USD',
    billingCycle: sub.billingCycle || 'MONTHLY',
    features: Array.isArray(sub.features) ? sub.features : [],
    paymentMethod: sub.paymentMethod,
    nextBillingDate: sub.nextBillingDate,
    autoRenew: typeof sub.autoRenew === 'boolean' ? sub.autoRenew : false,
    createdAt: sub.createdAt || new Date().toISOString(),
    updatedAt: sub.updatedAt || new Date().toISOString()
  };
}

// Initialize mock data in localStorage
if (typeof window !== 'undefined') {
  if (!localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS)) {
    saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, mockSubscriptions);
  }
}

// Feature flag to enable/disable mock API
export const USE_MOCK_SUBSCRIPTION_API = false; // Set to false to use real backend API at http://localhost:8080

// Mock API service
export const mockSubscriptionApi = {
  async getSubscriptions(): Promise<ApiResponse<Subscription>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const subscriptions = loadFromStorage(STORAGE_KEYS.SUBSCRIPTIONS, mockSubscriptions);

    // Ensure all subscriptions have valid data
    const validatedSubscriptions = subscriptions.map(validateSubscription);

    return createMockResponse(validatedSubscriptions);
  },

  async getSubscriptionById(id: string): Promise<Subscription> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const subscriptions = loadFromStorage(STORAGE_KEYS.SUBSCRIPTIONS, mockSubscriptions);
    const subscription = subscriptions.find(sub => sub.id === id);
    if (!subscription) throw new Error('Subscription not found');
    return subscription;
  },

  async createSubscription(data: Partial<Subscription>): Promise<Subscription> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const subscriptions = loadFromStorage(STORAGE_KEYS.SUBSCRIPTIONS, mockSubscriptions);
    const newSubscription = validateSubscription({
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    subscriptions.push(newSubscription);
    saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
    return newSubscription;
  },

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const subscriptions = loadFromStorage(STORAGE_KEYS.SUBSCRIPTIONS, mockSubscriptions);
    const index = subscriptions.findIndex(sub => sub.id === id);
    if (index === -1) throw new Error('Subscription not found');
    
    subscriptions[index] = { ...subscriptions[index], ...data, updatedAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
    return subscriptions[index];
  },

  async deleteSubscription(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const subscriptions = loadFromStorage(STORAGE_KEYS.SUBSCRIPTIONS, mockSubscriptions);
    const filteredSubscriptions = subscriptions.filter(sub => sub.id !== id);
    saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, filteredSubscriptions);
  },

  async cancelSubscription(id: string): Promise<Subscription> {
    return this.updateSubscription(id, { 
      status: 'CANCELLED', 
      autoRenew: false,
      updatedAt: new Date().toISOString()
    });
  },

  async renewSubscription(id: string): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id);
    const newEndDate = new Date(subscription.endDate);
    if (subscription.billingCycle === 'YEARLY') {
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    } else {
      newEndDate.setMonth(newEndDate.getMonth() + 1);
    }
    
    return this.updateSubscription(id, {
      status: 'ACTIVE',
      endDate: newEndDate.toISOString(),
      nextBillingDate: newEndDate.toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
};

// Real API service for subscription management
export const realSubscriptionApi = {
  async getSubscriptions(): Promise<ApiResponse<Subscription>> {
    const response = await fetch('http://localhost:8080/api/subscriptions', {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch subscriptions: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    // Ensure all fields have valid defaults
    if (result.content) {
      result.content = result.content.map(validateSubscription);
    }
    return result;
  },

  async getSubscriptionById(id: string): Promise<Subscription> {
    const response = await fetch(`http://localhost:8080/api/subscriptions/${id}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`Failed to get subscription: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    return validateSubscription(result);
  },

  async createSubscription(data: Partial<Subscription>): Promise<Subscription> {
    const requestData = {
      ...data,
      features: Array.isArray(data.features) ? data.features : []
    };
    
    const response = await fetch('http://localhost:8080/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create subscription: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const result = await response.json();
    return validateSubscription(result);
  },

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription> {
    const response = await fetch(`http://localhost:8080/api/subscriptions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update subscription: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const result = await response.json();
    return validateSubscription(result);
  },

  async deleteSubscription(id: string): Promise<void> {
    const response = await fetch(`http://localhost:8080/api/subscriptions/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete subscription: ${response.status} ${response.statusText} - ${errorText}`);
    }
  },

  async cancelSubscription(id: string): Promise<Subscription> {
    const response = await fetch(`http://localhost:8080/api/subscriptions/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to cancel subscription: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const result = await response.json();
    return validateSubscription(result);
  },

  async renewSubscription(id: string): Promise<Subscription> {
    const response = await fetch(`http://localhost:8080/api/subscriptions/${id}/renew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to renew subscription: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const result = await response.json();
    return validateSubscription(result);
  }
};

// Main API service that switches between mock and real API
export const subscriptionApi = USE_MOCK_SUBSCRIPTION_API ? mockSubscriptionApi : realSubscriptionApi;

// Export default API service for easy importing
export default subscriptionApi;

export type { Subscription, ApiResponse };
