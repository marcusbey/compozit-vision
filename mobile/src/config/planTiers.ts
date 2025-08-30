// Plan tiers configuration for multi-tier subscription system
export interface PlanTier {
  id: 'basic' | 'pro' | 'enterprise';
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  description: string;
  popular?: boolean;
  badge?: string;
  color: string;
  icon: string;
}

export const PLAN_TIERS: Record<string, PlanTier> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: 14,
    yearlyPrice: 140, // ~17% savings
    description: 'Perfect for getting started with AI design',
    features: [
      '100 AI generations per month',
      'Up to 5 projects',
      'Basic design styles',
      'Email support',
      'Standard resolution exports'
    ],
    color: '#4CAF50',
    icon: 'leaf-outline'
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 29,
    yearlyPrice: 290, // ~17% savings
    description: 'Ideal for professionals and design enthusiasts',
    popular: true,
    badge: 'Most Popular',
    features: [
      '500 AI generations per month',
      'Unlimited projects',
      'All design styles',
      'Priority email support',
      'High resolution exports',
      'Design history & variations',
      'Advanced room analysis'
    ],
    color: '#2196F3',
    icon: 'diamond-outline'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 49,
    yearlyPrice: 490, // ~17% savings
    description: 'For architects and professional designers',
    badge: 'Best Value',
    features: [
      'Unlimited AI generations',
      'Team collaboration features',
      'Premium & exclusive styles',
      '24/7 priority support',
      'Ultra high resolution exports',
      'API access',
      'Batch processing',
      'Custom branding options',
      'Advanced analytics'
    ],
    color: '#FF9800',
    icon: 'business-outline'
  }
};

// Helper function to calculate weekly price
export const getWeeklyPrice = (monthlyPrice: number): string => {
  return (monthlyPrice / 4.33).toFixed(2);
};

// Helper function to calculate yearly savings
export const getYearlySavings = (monthlyPrice: number, yearlyPrice: number): number => {
  const yearlyFromMonthly = monthlyPrice * 12;
  return Math.round(((yearlyFromMonthly - yearlyPrice) / yearlyFromMonthly) * 100);
};

// Payment product mapping for Apple/Google Pay
export const getPaymentProductId = (planTier: string, frequency: string): string => {
  // Weekly maps to monthly for payment processing simplicity
  const actualFrequency = frequency === 'weekly' ? 'monthly' : frequency;
  return `compozit_${planTier}_${actualFrequency}`;
};

export type PaymentFrequency = 'weekly' | 'monthly' | 'yearly';
export type PlanTierId = 'basic' | 'pro' | 'enterprise';