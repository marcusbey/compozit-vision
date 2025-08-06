import React from "react";

const steps = [
  {
    number: "01",
    title: "Capture Your Space",
    description: "Take a photo of any room using our guided camera interface. Multiple angles for better results.",
    color: "bg-primary-100 text-primary-600",
  },
  {
    number: "02", 
    title: "Choose Your Style",
    description: "Select from modern, classic, minimalist, or other design styles. Customize colors and preferences.",
    color: "bg-secondary-100 text-secondary-600",
  },
  {
    number: "03",
    title: "AI Magic Happens", 
    description: "Our AI analyzes your space and generates stunning design variations in under 30 seconds.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    number: "04",
    title: "Explore & Customize",
    description: "Browse products, adjust your budget, swap items, and get accurate cost estimates instantly.", 
    color: "bg-green-100 text-green-600",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 gradient-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your space in four simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center mb-4 font-bold text-xl`}>
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-full w-full -ml-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="2" d="M9 6l6 6-6 6" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-3xl shadow-xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                See the Magic in Action
              </h3>
              <p className="text-gray-600 mb-6">
                Watch how Compozit Vision transforms a simple bedroom into a stunning modern sanctuary in seconds.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Processing Time</p>
                  <p className="font-semibold text-gray-900">&lt; 30 seconds</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Design Variations</p>
                  <p className="font-semibold text-gray-900">5+ options</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Product Matches</p>
                  <p className="font-semibold text-gray-900">20+ items</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Cost Accuracy</p>
                  <p className="font-semibold text-gray-900">95%+</p>
                </div>
              </div>
              <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition">
                Try Demo
              </button>
            </div>
            <div className="bg-gray-100 rounded-2xl h-96 flex items-center justify-center">
              <p className="text-gray-400">Demo Video Placeholder</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}