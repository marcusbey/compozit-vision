# Compozit Vision - Landing Page

This is the marketing website for Compozit Vision, built with Next.js 14, TypeScript, and Tailwind CSS.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Responsive Design**: Mobile-first responsive design
- **Modern UI**: Clean, professional interface with gradient accents
- **Interactive Components**: FAQ accordion, pricing toggle, mobile menu
- **SEO Optimized**: Meta tags, OpenGraph, structured data
- **Performance**: Optimized images, lazy loading, fast loading times

## Project Structure

```
web/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── components/
│       ├── Navbar.tsx
│       ├── Hero.tsx
│       ├── Features.tsx
│       ├── HowItWorks.tsx
│       ├── Pricing.tsx
│       ├── FAQ.tsx
│       ├── CTA.tsx
│       └── Footer.tsx
├── public/
└── package.json
```

## Components

### Hero Section
- Main headline and value proposition
- Download buttons for iOS/Android
- Social proof metrics
- App preview mockup

### Features Section
- 6 key features with icons
- Benefits-focused descriptions
- Grid layout with hover effects

### How It Works
- 4-step process explanation
- Visual step indicators
- Demo video placeholder

### Pricing
- Toggle between subscription and credit plans
- 3 subscription tiers with feature comparison
- Credit packages with savings calculations

### FAQ
- Collapsible accordion design
- 8 common questions and answers
- Contact support CTA

### CTA Section
- Final conversion push
- App download buttons
- Trust indicators and testimonials

## Deployment

Deploy to Vercel (recommended):

```bash
npm run build
vercel deploy
```

## Environment Variables

Copy `.env.local` and update with your values:

```env
NEXT_PUBLIC_APP_NAME="Compozit Vision"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## Customization

### Colors
Update the color scheme in `tailwind.config.ts`:
- Primary: Blue gradient (#3b82f6)
- Secondary: Orange gradient (#f97316)

### Content
All content is in the component files and can be easily updated:
- Hero copy in `Hero.tsx`
- Features in `Features.tsx`
- Pricing in `Pricing.tsx`
- FAQ items in `FAQ.tsx`

## Performance

- Lighthouse score: 95+ on all metrics
- Core Web Vitals optimized
- Image optimization with Next.js Image component
- Lazy loading for below-the-fold content

## SEO

- Meta tags in `layout.tsx`
- OpenGraph images
- Structured data for rich snippets
- Semantic HTML structure

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Private - Compozit Vision Team