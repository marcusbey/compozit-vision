import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { jest } from '@jest/globals';
import { usePlanStore, AVAILABLE_PLANS } from '../src/stores/planStore';

describe('Payment Flow Integration', () => {
  beforeEach(() => {
    // Reset plan store
    usePlanStore.getState().clearSelectedPlan();
  });

  it('should track selected plan through the user journey', () => {
    const { selectPlan, selectedPlan } = usePlanStore.getState();
    
    // User selects Pro plan
    const proPlan = AVAILABLE_PLANS.find(plan => plan.id === 'pro');
    expect(proPlan).toBeTruthy();
    
    selectPlan(proPlan!);
    
    // Verify plan is saved
    expect(usePlanStore.getState().selectedPlan?.id).toBe('pro');
    expect(usePlanStore.getState().paymentStatus).toBe('pending');
  });

  it('should handle payment status transitions correctly', () => {
    const { selectPlan, setPaymentStatus, setPaymentDetails } = usePlanStore.getState();
    
    // Select a plan
    const basicPlan = AVAILABLE_PLANS.find(plan => plan.id === 'basic');
    selectPlan(basicPlan!);
    
    expect(usePlanStore.getState().paymentStatus).toBe('pending');
    
    // Process payment
    setPaymentStatus('processing');
    expect(usePlanStore.getState().paymentStatus).toBe('processing');
    
    // Complete payment
    const paymentDetails = {
      method: 'stripe',
      planId: 'basic',
      amount: '$19',
      paymentId: 'test_payment_123'
    };
    
    setPaymentDetails(paymentDetails);
    expect(usePlanStore.getState().paymentStatus).toBe('completed');
    expect(usePlanStore.getState().paymentDetails).toEqual(paymentDetails);
  });

  it('should clear plan selection when using free tier', () => {
    const { selectPlan, clearSelectedPlan } = usePlanStore.getState();
    
    // User initially selects a plan
    const businessPlan = AVAILABLE_PLANS.find(plan => plan.id === 'business');
    selectPlan(businessPlan!);
    
    expect(usePlanStore.getState().selectedPlan).toBeTruthy();
    
    // User decides to use free credits instead
    clearSelectedPlan();
    
    expect(usePlanStore.getState().selectedPlan).toBeNull();
    expect(usePlanStore.getState().paymentStatus).toBe('none');
  });

  it('should correctly identify paid vs free plans', () => {
    const { isPaidPlan, getCreditsForPlan } = require('../src/stores/planStore');
    
    expect(isPaidPlan('basic')).toBe(true);
    expect(isPaidPlan('pro')).toBe(true);
    expect(isPaidPlan('business')).toBe(true);
    expect(isPaidPlan('free')).toBe(false);
    expect(isPaidPlan('')).toBe(false);
    
    expect(getCreditsForPlan('basic')).toBe(50);
    expect(getCreditsForPlan('pro')).toBe(200);
    expect(getCreditsForPlan('business')).toBe(999);
    expect(getCreditsForPlan('free')).toBe(3);
  });

  it('should validate plan data structure', () => {
    AVAILABLE_PLANS.forEach(plan => {
      expect(plan).toHaveProperty('id');
      expect(plan).toHaveProperty('name');
      expect(plan).toHaveProperty('price');
      expect(plan).toHaveProperty('period');
      expect(plan).toHaveProperty('designs');
      expect(plan).toHaveProperty('features');
      expect(Array.isArray(plan.features)).toBe(true);
      expect(plan.features.length).toBeGreaterThan(0);
    });
  });
});