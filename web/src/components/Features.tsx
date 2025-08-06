import React from "react";

const features = [
  {
    title: "AI-Powered Design",
    description: "Our advanced AI instantly transforms your space with professional-quality designs tailored to your style.",
    icon: "🎨",
  },
  {
    title: "Accurate Cost Estimation",
    description: "Get detailed breakdowns of furniture, materials, and labor costs specific to your location.",
    icon: "💰",
  },
  {
    title: "Product Matching",
    description: "Find exact or similar products from our curated database of thousands of furniture pieces.",
    icon: "🛋️",
  },
  {
    title: "Multiple Styles",
    description: "Choose from modern, classic, minimalist, and more. Mix and match to find your perfect look.",
    icon: "✨",
  },
  {
    title: "Project Management",
    description: "Save designs, track purchases, and manage your entire renovation from concept to completion.",
    icon: "📋",
  },
  {
    title: "Share & Collaborate",
    description: "Share your designs with family, friends, or contractors. Get feedback and iterate together.",
    icon: "🤝",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to <span className="gradient-text">Transform Your Space</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From AI-powered visualization to accurate cost estimates, we've got you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}