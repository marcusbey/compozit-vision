"use client";

import React, { useState } from "react";

const plans = [
  {
    name: "Free",
    price: "0",
    period: "forever",
    features: [
      "3 designs per month",
      "Basic styles",
      "Standard processing",
      "View cost estimates",
      "Save to device",
    ],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Pro",
    price: "29",
    period: "month",
    features: [
      "Unlimited designs",
      "All premium styles",
      "Priority processing",
      "Advanced customization",
      "High-resolution exports",
      "Email support",
      "Cloud storage",
    ],
    cta: "Start Free Trial",
    featured: true,
  },
  {
    name: "Business",
    price: "49",
    period: "month",
    features: [
      "Everything in Pro",
      "Team collaboration (5 users)",
      "API access",
      "White-label options",
      "Dedicated support",
      "Custom integrations",
      "Analytics dashboard",
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

const creditPackages = [
  { credits: 1, price: 2.99, save: 0 },
  { credits: 10, price: 25, save: 16 },
  { credits: 25, price: 59, save: 21 },
  { credits: 50, price: 99, save: 34 },
];

export default function Pricing() {
  const [billingType, setBillingType] = useState<"subscription" | "credits">("subscription");

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Choose the plan that works best for you. No hidden fees.
          </p>
          
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingType("subscription")}
              className={`px-6 py-2 rounded-md transition ${
                billingType === "subscription"
                  ? "bg-white text-primary-600 shadow-md"
                  : "text-gray-600"
              }`}
            >
              Monthly Plans
            </button>
            <button
              onClick={() => setBillingType("credits")}
              className={`px-6 py-2 rounded-md transition ${
                billingType === "credits"
                  ? "bg-white text-primary-600 shadow-md"
                  : "text-gray-600"
              }`}
            >
              Pay As You Go
            </button>
          </div>
        </div>

        {billingType === "subscription" ? (
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-8 ${
                  plan.featured
                    ? "bg-primary-600 text-white shadow-2xl scale-105"
                    : "bg-gray-50"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-secondary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.featured ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.featured ? "text-white" : "text-gray-900"}`}>
                    ${plan.price}
                  </span>
                  <span className={`text-lg ${plan.featured ? "text-primary-100" : "text-gray-600"}`}>
                    /{plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className={`w-5 h-5 mr-2 mt-0.5 ${
                          plan.featured ? "text-primary-100" : "text-primary-600"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className={plan.featured ? "text-primary-50" : "text-gray-600"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    plan.featured
                      ? "bg-white text-primary-600 hover:bg-primary-50"
                      : "bg-primary-600 text-white hover:bg-primary-700"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Design Credits</h3>
              <p className="text-gray-600 mb-8">
                Perfect for occasional users. Credits never expire and work with all design styles.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {creditPackages.map((pkg, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-primary-600 transition"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {pkg.credits} {pkg.credits === 1 ? "Credit" : "Credits"}
                      </h4>
                      {pkg.save > 0 && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                          Save {pkg.save}%
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">${pkg.price}</p>
                    <p className="text-sm text-gray-600 mb-4">
                      ${(pkg.price / pkg.credits).toFixed(2)} per design
                    </p>
                    <button className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition">
                      Buy Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}