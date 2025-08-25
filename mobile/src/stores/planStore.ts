import { create } from 'zustand';

export interface PlanDetails {
  id: string;
  name: string;
  price: string;
  period: string;
  designs: string;
  features: string[];
  stripeProductId?: string;
  stripePriceId?: string;
}

export interface SelectedPlanState {
  selectedPlan: PlanDetails | null;
  paymentStatus: 'none' | 'pending' | 'processing' | 'completed' | 'failed';
  paymentDetails: any | null;
  
  // Actions
  selectPlan: (plan: PlanDetails) => void;
  clearSelectedPlan: () => void;
  setPaymentStatus: (status: 'none' | 'pending' | 'processing' | 'completed' | 'failed') => void;
  setPaymentDetails: (details: any) => void;
  resetPaymentState: () => void;
}

// Available plans configuration
export const AVAILABLE_PLANS: PlanDetails[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$19',
    period: '/month',
    designs: '50 designs',
    features: [
      '50 AI design generations',
      'Basic style options',
      'Standard processing',
      'Email support'
    ],
    stripeProductId: 'prod_basic', // TODO: Replace with actual Stripe product IDs
    stripePriceId: 'price_basic_monthly'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/month',
    designs: '200 designs',
    features: [
      '200 AI design generations',
      'All premium styles',
      'Priority processing',
      'Advanced customization',
      'High-resolution exports',
      'Priority support'
    ],
    stripeProductId: 'prod_pro',
    stripePriceId: 'price_pro_monthly'
  },
  {
    id: 'business',
    name: 'Business',
    price: '$49',
    period: '/month',
    designs: 'Unlimited',
    features: [
      'Unlimited AI generations',
      'Team collaboration (5 users)',
      'Custom integrations',
      'Dedicated support',
      'White-label options',
      'API access'
    ],
    stripeProductId: 'prod_business',
    stripePriceId: 'price_business_monthly'
  }
];

export const usePlanStore = create<SelectedPlanState>((set, get) => ({
  selectedPlan: null,
  paymentStatus: 'none',
  paymentDetails: null,

  selectPlan: (plan: PlanDetails) => {
    console.log('Plan selected:', plan.name, plan.id);
    set({ 
      selectedPlan: plan,
      paymentStatus: 'pending' // User selected a plan but hasn't paid yet
    });
  },

  clearSelectedPlan: () => {
    set({ 
      selectedPlan: null,
      paymentStatus: 'none',
      paymentDetails: null 
    });
  },

  setPaymentStatus: (status) => {
    console.log('Payment status changed to:', status);
    set({ paymentStatus: status });
  },

  setPaymentDetails: (details) => {
    console.log('Payment details set:', details);
    set({ 
      paymentDetails: details,
      paymentStatus: details ? 'completed' : 'failed'
    });
  },

  resetPaymentState: () => {
    set({ 
      paymentStatus: 'none',
      paymentDetails: null 
    });
  }
}));

// Helper functions
export const getPlanById = (planId: string): PlanDetails | undefined => {
  return AVAILABLE_PLANS.find(plan => plan.id === planId);
};

export const isPaidPlan = (planId: string): boolean => {
  return planId !== 'free' && planId !== '';
};

export const getCreditsForPlan = (planId: string): number => {
  switch (planId) {
    case 'basic': return 50;
    case 'pro': return 200;
    case 'business': return 999; // Represent unlimited as a large number
    default: return 3; // Free tier
  }
};