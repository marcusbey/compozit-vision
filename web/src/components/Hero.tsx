import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 gradient-bg">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Transform Your Space with{" "}
              <span className="gradient-text">AI-Powered Design</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Snap a photo, choose a style, and instantly see your room transformed. 
              Get accurate cost estimates and shop for everything you need in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition shadow-lg">
                Download App
              </button>
              <Link
                href="#how-it-works"
                className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition"
              >
                See How It Works
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center lg:justify-start gap-8">
              <div>
                <p className="text-2xl font-bold text-gray-900">50K+</p>
                <p className="text-gray-600">Happy Users</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">100K+</p>
                <p className="text-gray-600">Designs Created</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">4.8★</p>
                <p className="text-gray-600">App Rating</p>
              </div>
            </div>
          </div>
          <div className="relative h-[600px] rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-secondary-100" />
            <div className="relative z-10 p-8 flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-64 h-96 bg-white rounded-3xl shadow-xl mx-auto mb-4 flex items-center justify-center">
                  <p className="text-gray-400">App Preview</p>
                </div>
                <p className="text-gray-600">Available on iOS & Android</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}