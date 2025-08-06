import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2563eb',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://compozit-vision.vercel.app'),
  title: {
    default: "Compozit Vision - AI Interior Design App | Instant Room Makeovers & Cost Estimates",
    template: "%s | Compozit Vision - AI Interior Design"
  },
  description: "Transform any room instantly with AI-powered interior design. Get professional makeovers, accurate cost estimates, and shop curated furniture. Free trial - no credit card required!",
  keywords: [
    "AI interior design app",
    "AI room design", 
    "interior design cost calculator",
    "home renovation cost estimator",
    "AI furniture matching",
    "room makeover app",
    "AI powered home design tool",
    "interior design software",
    "home design AI",
    "room redesign app",
    "virtual interior designer",
    "automated home design",
    "AI home decorator",
    "smart interior design",
    "instant room makeover"
  ],
  authors: [{ name: "Compozit Vision Team" }],
  creator: "Compozit Vision",
  publisher: "Compozit Vision",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://compozit-vision.vercel.app',
    siteName: 'Compozit Vision',
    title: "Compozit Vision - AI Interior Design App | Instant Room Makeovers",
    description: "Transform any room instantly with AI. Get professional interior designs, accurate cost estimates, and curated furniture recommendations. Try free today!",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Compozit Vision AI Interior Design App - Before and After Room Transformation',
        type: 'image/png',
      },
      {
        url: '/og-image-square.png', 
        width: 600,
        height: 600,
        alt: 'Compozit Vision Logo - AI Interior Design',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@CompozitVision',
    creator: '@CompozitVision',
    title: "AI Interior Design App | Instant Room Makeovers - Compozit Vision",
    description: "Transform rooms instantly with AI. Professional designs + accurate cost estimates. Free trial!",
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon-57x57.png', sizes: '57x57' },
      { url: '/apple-touch-icon-114x114.png', sizes: '114x114' },
      { url: '/apple-touch-icon-180x180.png', sizes: '180x180' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#2563eb' },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://compozit-vision.vercel.app',
  },
  category: 'technology',
  classification: 'AI Interior Design Software',
  other: {
    'msapplication-TileColor': '#2563eb',
    'theme-color': '#2563eb',
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Compozit Vision",
  "applicationCategory": "DesignApplication",
  "applicationSubCategory": "Interior Design",
  "operatingSystem": ["iOS", "Android"],
  "description": "AI-powered interior design app that transforms rooms instantly with professional makeovers and accurate cost estimates",
  "url": "https://compozit-vision.vercel.app",
  "downloadUrl": "https://apps.apple.com/app/compozit-vision",
  "softwareVersion": "1.0.0",
  "datePublished": "2024-01-01",
  "publisher": {
    "@type": "Organization", 
    "name": "Compozit Vision",
    "url": "https://compozit-vision.vercel.app",
    "logo": {
      "@type": "ImageObject",
      "url": "https://compozit-vision.vercel.app/logo.png"
    }
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "category": "FreemiumModel"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "2547",
    "bestRating": "5"
  },
  "featureList": [
    "AI-powered room transformation",
    "Accurate cost estimation", 
    "Product matching and shopping",
    "Multiple design styles",
    "Project management",
    "Real-time collaboration"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={inter.className}>
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </body>
    </html>
  );
}