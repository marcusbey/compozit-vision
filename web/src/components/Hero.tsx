import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 gradient-bg">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <article className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Transform Your <span className="sr-only">Home</span>Space with{" "}
              <span className="gradient-text">AI-Powered Interior Design</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              <strong>Instant room makeovers</strong> with professional AI interior design. 
              Snap a photo, choose your style, and get accurate <em>renovation cost estimates</em> 
              with curated furniture shopping lists. <strong>Free trial</strong> - no credit card required!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start" role="group" aria-label="Main actions">
              <button 
                className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition shadow-lg focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Download Compozit Vision AI interior design app"
              >
                Download App - Free Trial
              </button>
              <Link
                href="#how-it-works"
                className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Learn how AI interior design works"
              >
                See How AI Design Works
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center lg:justify-start gap-8" role="region" aria-label="Social proof statistics">
              <div>
                <p className="text-2xl font-bold text-gray-900" aria-label="Fifty thousand happy users">50K+</p>
                <p className="text-gray-600">Happy Users</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900" aria-label="One hundred thousand AI designs created">100K+</p>
                <p className="text-gray-600">AI Designs Created</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900" aria-label="Four point eight star app rating">4.8★</p>
                <p className="text-gray-600">App Store Rating</p>
              </div>
            </div>
          </article>
          <aside className="relative h-[600px] rounded-2xl overflow-hidden shadow-2xl" aria-label="App preview showcase">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-secondary-100" />
            <div className="relative z-10 p-8 flex items-center justify-center h-full">
              <figure className="text-center">
                <div className="w-64 h-96 bg-white rounded-3xl shadow-xl mx-auto mb-4 flex items-center justify-center" role="img" aria-label="Mobile app preview showing AI interior design transformation">
                  <p className="text-gray-400">AI Design App Preview</p>
                </div>
                <figcaption className="text-gray-600">Available on iOS & Android - Free Download</figcaption>
              </figure>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}