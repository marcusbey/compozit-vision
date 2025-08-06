import React from "react";

export default function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 gradient-bg">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Ready to Transform Your Space?
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of users who have already transformed their homes with Compozit Vision. 
          Start your design journey today.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition shadow-lg">
            Download for iOS
          </button>
          <button className="bg-gray-800 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-900 transition shadow-lg">
            Download for Android
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Free to Start</h3>
            <p className="text-gray-600 text-sm">3 designs included, no credit card required</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Results</h3>
            <p className="text-gray-600 text-sm">See your transformed space in under 30 seconds</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl">💎</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Professional Quality</h3>
            <p className="text-gray-600 text-sm">AI-powered designs that rival professional work</p>
          </div>
        </div>

        <div className="mt-12 p-6 bg-white/80 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
            <span className="flex text-yellow-400">★★★★★</span>
            <span className="font-semibold">4.8/5</span>
          </div>
          <p className="text-sm text-gray-600">
            "Compozit Vision helped me redesign my entire living room. The cost estimates were spot-on!"
          </p>
          <p className="text-xs text-gray-500 mt-2">— Sarah M., Verified User</p>
        </div>
      </div>
    </section>
  );
}