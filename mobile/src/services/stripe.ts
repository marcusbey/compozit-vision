// Stripe service for React Native (client-side operations)
import { Alert } from 'react-native';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY!;

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing Stripe publishable key');
}

export interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval?: 'month' | 'year';
  metadata?: Record<string, string>;
}

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface Subscription {
  id: string;
  customer_id: string;
  price_id: string;
  status: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

// API endpoints (these would be implemented in your backend)
const API_BASE_URL = process.env.API_BASE_URL || 'https://your-api-domain.com/api';

export class StripeService {
  private static instance: StripeService;
  
  static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  // Create payment intent for one-time purchases
  async createPaymentIntent(
    amount: number, 
    currency: string = 'usd',
    metadata?: Record<string, string>
  ): Promise<PaymentIntent | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/stripe/payment-intents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      return data.paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      Alert.alert('Payment Error', 'Failed to initialize payment. Please try again.');
      return null;
    }
  }

  // Create subscription
  async createSubscription(
    customerId: string,
    priceId: string,
    metadata?: Record<string, string>
  ): Promise<Subscription | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/stripe/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          price_id: priceId,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const data = await response.json();
      return data.subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      Alert.alert('Subscription Error', 'Failed to start subscription. Please try again.');
      return null;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/stripe/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      Alert.alert('Success', 'Subscription cancelled successfully');
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
      return false;
    }
  }

  // Get customer subscriptions
  async getCustomerSubscriptions(customerId: string): Promise<Subscription[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/stripe/customers/${customerId}/subscriptions`);

      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      const data = await response.json();
      return data.subscriptions || [];
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }
  }

  // Get available products/prices
  async getProducts(): Promise<StripeProduct[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/stripe/products`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  // Purchase credits
  async purchaseCredits(
    customerId: string,
    creditPackageId: string,
    paymentMethodId?: string
  ): Promise<PaymentIntent | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/stripe/purchase-credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          credit_package_id: creditPackageId,
          payment_method_id: paymentMethodId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to purchase credits');
      }

      const data = await response.json();
      return data.paymentIntent;
    } catch (error) {
      console.error('Error purchasing credits:', error);
      Alert.alert('Purchase Error', 'Failed to purchase credits. Please try again.');
      return null;
    }
  }

  // Create customer (if not exists)
  async createCustomer(email: string, name?: string): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/stripe/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      const data = await response.json();
      return data.customer.id;
    } catch (error) {
      console.error('Error creating customer:', error);
      return null;
    }
  }
}

// Predefined products based on PROJECT_DESCRIPTION.md pricing
export const COMPOZIT_PRODUCTS = {
  PRO_MONTHLY: {
    name: 'Compozit Vision Pro',
    price: 29,
    interval: 'month' as const,
    features: [
      'Unlimited designs',
      'All premium styles',
      'Priority processing',
      'Advanced customization',
      'High-resolution exports',
      'Email support'
    ]
  },
  BUSINESS_MONTHLY: {
    name: 'Compozit Vision Business',
    price: 49,
    interval: 'month' as const,
    features: [
      'Everything in Pro',
      'Team collaboration (up to 5 users)',
      'API access',
      'White-label options',
      'Dedicated support',
      'Custom integrations'
    ]
  },
  CREDITS_10: {
    name: 'Design Credits - 10 Pack',
    price: 25,
    credits: 10,
    savings: '16%'
  },
  CREDITS_25: {
    name: 'Design Credits - 25 Pack',
    price: 59,
    credits: 25,
    savings: '21%'
  },
  CREDITS_50: {
    name: 'Design Credits - 50 Pack',
    price: 99,
    credits: 50,
    savings: '34%'
  }
};

export default StripeService;