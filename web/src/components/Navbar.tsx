"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold gradient-text">Compozit Vision</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-700 hover:text-primary-600 transition">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-700 hover:text-primary-600 transition">
              How it Works
            </Link>
            <Link href="#pricing" className="text-gray-700 hover:text-primary-600 transition">
              Pricing
            </Link>
            <Link href="#faq" className="text-gray-700 hover:text-primary-600 transition">
              FAQ
            </Link>
            <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition">
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-b">
            <Link href="#features" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
              Features
            </Link>
            <Link href="#how-it-works" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
              How it Works
            </Link>
            <Link href="#pricing" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
              Pricing
            </Link>
            <Link href="#faq" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
              FAQ
            </Link>
            <button className="w-full text-left bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}