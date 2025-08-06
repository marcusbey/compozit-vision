"use client";

import React, { useState } from "react";

const faqs = [
  {
    question: "How accurate are the AI-generated designs?",
    answer: "Our AI analyzes room dimensions, lighting, and existing elements to create highly accurate designs. While results may vary based on photo quality, most users find the designs realistic and implementable.",
  },
  {
    question: "Can I use my own furniture in the designs?",
    answer: "Currently, our AI creates new design suggestions with products from our curated database. However, you can use the designs as inspiration and manually replace items with your existing furniture.",
  },
  {
    question: "How accurate are the cost estimates?",
    answer: "Our cost estimates are based on real-time pricing data and are typically accurate within 10-15% of actual costs. Factors like location, installation complexity, and market fluctuations may affect final prices.",
  },
  {
    question: "Do credits expire?",
    answer: "No! Design credits never expire, so you can use them whenever you're ready. This makes them perfect for occasional users or those planning future projects.",
  },
  {
    question: "Can I share my designs?",
    answer: "Yes! You can easily share your designs via link, export them as PDFs, or collaborate with family members and contractors. Pro users get additional sharing features.",
  },
  {
    question: "What happens to my photos?",
    answer: "We take privacy seriously. Your photos are encrypted and stored securely. We only use them to generate your designs and never share them with third parties. You can delete them anytime.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! New users get 3 free designs to try the app. Pro plan users also get a 7-day free trial to test premium features before their subscription begins.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Absolutely. You can cancel your subscription at any time from your account settings. You'll continue to have access to Pro features until your current billing period ends.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about Compozit Vision
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left px-6 py-4 focus:outline-none hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
}