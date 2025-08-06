import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Compozit Vision - AI-Powered Interior Design & Renovation",
  description: "Transform your space with AI. Get instant design suggestions and accurate renovation cost estimates.",
  keywords: ["interior design", "AI design", "renovation", "home improvement", "cost estimation"],
  openGraph: {
    title: "Compozit Vision - AI Interior Design",
    description: "Transform any space with AI-powered design suggestions",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}