# SEO Setup for Corridor

This document outlines the comprehensive SEO metadata implementation for all pages in the Corridor web application.

## Overview

Each page now has dedicated metadata optimized for search engines and social media platforms. The metadata includes:

- **Title tags** - Optimized for search rankings and click-through rates
- **Meta descriptions** - Compelling descriptions that encourage clicks
- **Keywords** - Relevant keywords for search engine indexing
- **Open Graph tags** - Enhanced sharing on Facebook, LinkedIn, etc.
- **Twitter Cards** - Rich previews on Twitter/X
- **Canonical URLs** - Prevent duplicate content issues
- **Robots directives** - Control search engine crawling and indexing

## File Structure

```
src/app/
├── metadata.ts                                  # Home page metadata
├── layout.tsx                                   # Global metadata & template
├── sitemap.ts                                   # XML sitemap generator
├── robots.ts                                    # Robots.txt generator
├── about/
│   ├── metadata.ts                             # About page metadata
│   └── page.tsx
├── downloads/
│   ├── metadata.ts                             # Downloads hub metadata
│   ├── page.tsx
│   ├── windows/
│   │   ├── metadata.ts                         # Windows download metadata
│   │   └── page.tsx
│   ├── linux/
│   │   ├── metadata.ts                         # Linux download metadata
│   │   └── page.tsx
│   └── android/
│       ├── metadata.ts                         # Android download metadata
│       └── page.tsx
├── resources/
│   ├── metadata.ts                             # Resources hub metadata
│   ├── page.tsx
│   ├── what-is-corridor/
│   │   ├── metadata.ts                         # Explainer article metadata
│   │   └── page.tsx
│   ├── how-to-use/
│   │   ├── metadata.ts                         # Tutorial metadata
│   │   └── page.tsx
│   └── use-cases/
│       ├── metadata.ts                         # Use cases metadata
│       └── page.tsx
├── privacy/
│   ├── metadata.ts                             # Privacy policy metadata
│   └── page.tsx
└── terms/
    ├── metadata.ts                             # Terms of service metadata
    └── page.tsx
```

## Page-Specific SEO Details

### 1. Home Page (`/`)
**Title:** Corridor - Real-Time Clipboard Sync Across All Devices
**Focus Keywords:** clipboard sync, clipboard synchronization, cross-platform clipboard
**Target Audience:** Users searching for clipboard management solutions
**Optimizations:**
- Emphasizes "real-time" and "cross-platform"
- Lists all supported platforms in description
- Highlights "free" and "secure"

### 2. About Page (`/about`)
**Title:** About Corridor - Universal Clipboard Synchronization Solution
**Focus Keywords:** clipboard sync features, multi-platform sync, clipboard history
**Target Audience:** Users researching clipboard sync solutions
**Optimizations:**
- Feature-focused keywords
- Platform availability emphasis
- Benefit-oriented description

### 3. Downloads Hub (`/downloads`)
**Title:** Download Corridor - Free Clipboard Sync for Windows, Linux, Android & Web
**Focus Keywords:** download corridor, free clipboard app, clipboard sync download
**Target Audience:** Users ready to download
**Optimizations:**
- "Free" emphasized early
- All platforms listed
- Download-intent keywords

### 4. Windows Download (`/downloads/windows`)
**Title:** Corridor for Windows - Free Clipboard Sync Desktop App Download
**Focus Keywords:** Windows clipboard sync, Windows 10 clipboard, Windows 11 clipboard
**Target Audience:** Windows users
**Optimizations:**
- Windows version specificity (10/11)
- System tray and auto-start features
- File size mentioned for transparency

### 5. Linux Download (`/downloads/linux`)
**Title:** Corridor for Linux - Free Clipboard Sync for Ubuntu, Debian, Fedora
**Focus Keywords:** Linux clipboard sync, Ubuntu clipboard manager, Wayland clipboard
**Target Audience:** Linux users
**Optimizations:**
- Major distro names in title
- X11 & Wayland support highlighted
- Technical details (glibc, binary size)

### 6. Android Download (`/downloads/android`)
**Title:** Corridor for Android - Free Clipboard Sync APK Download
**Focus Keywords:** Android clipboard sync, clipboard APK, Android clipboard manager
**Target Audience:** Android users
**Optimizations:**
- APK file format emphasized
- Android version requirement (8.0+)
- Background service features

### 7. Resources Hub (`/resources`)
**Title:** Corridor Resources - Guides, Tutorials & Documentation
**Focus Keywords:** clipboard sync guide, clipboard tutorial, documentation
**Target Audience:** Users seeking help and information
**Optimizations:**
- Educational content focus
- Tutorial and guide keywords

### 8. What is Corridor (`/resources/what-is-corridor`)
**Title:** What is Corridor? - Universal Clipboard Sync Explained
**Focus Keywords:** what is corridor, clipboard sync explained, how clipboard sync works
**Target Audience:** New users learning about the product
**Optimizations:**
- Question-based title for voice search
- Explainer keywords
- Article-type Open Graph

### 9. How to Use (`/resources/how-to-use`)
**Title:** How to Use Corridor - Complete Setup Guide for All Platforms
**Focus Keywords:** how to use corridor, setup guide, installation tutorial
**Target Audience:** New users setting up the app
**Optimizations:**
- Step-by-step guide keywords
- Platform-specific tutorial terms
- Setup and installation focus

### 10. Use Cases (`/resources/use-cases`)
**Title:** Corridor Use Cases - Practical Ways to Use Clipboard Sync
**Focus Keywords:** clipboard sync use cases, clipboard sync applications
**Target Audience:** Users exploring practical applications
**Optimizations:**
- Real-world scenario keywords
- Collaboration and productivity terms

### 11. Privacy Policy (`/privacy`)
**Title:** Privacy Policy - Corridor Clipboard Sync
**Focus Keywords:** corridor privacy policy, clipboard security, data privacy
**Target Audience:** Privacy-conscious users
**Optimizations:**
- Trust-building keywords
- Security and privacy emphasis

### 12. Terms of Service (`/terms`)
**Title:** Terms of Service - Corridor Clipboard Sync
**Focus Keywords:** corridor terms, acceptable use policy, service terms
**Target Audience:** Users reviewing legal terms
**Optimizations:**
- Legal compliance keywords
- Standard TOS terminology

## Global SEO Enhancements

### Root Layout (`layout.tsx`)
- **Title Template:** `%s | Corridor` - Automatically appends brand name to all pages
- **Default Title:** Full descriptive title for homepage
- **Meta Description:** 155-character optimized description
- **Keywords:** 12 high-value keywords
- **Category:** "productivity" for app categorization

### Sitemap (`sitemap.ts`)
- Dynamic XML sitemap generation
- Priority weighting:
  - Homepage: 1.0
  - Downloads: 0.9
  - About/Platform pages: 0.8
  - Resources: 0.7
  - Legal pages: 0.5
- Change frequencies optimized per page type
- Auto-updates with current date

### Robots.txt (`robots.ts`)
- Allows all user agents
- Disallows API routes and Next.js internal paths
- References sitemap location
- Optimized for crawler efficiency

## Open Graph & Social Media

All pages include:

### Open Graph Tags
- `og:type` - website/article as appropriate
- `og:locale` - en_US
- `og:url` - Canonical page URL
- `og:site_name` - Corridor
- `og:title` - Page-specific title
- `og:description` - Page-specific description
- `og:image` - 1200x630px preview image (needs creation)

### Twitter Card Tags
- `twitter:card` - summary_large_image
- `twitter:title` - Page-specific title
- `twitter:description` - Page-specific description
- `twitter:image` - Preview image
- `twitter:creator` - @corridor (needs setup)

## Robots & Crawling Directives

All pages include:
- `index: true` - Allow indexing
- `follow: true` - Follow links
- Google-specific directives for rich snippets
- Max video/image/snippet previews enabled

## Technical SEO Features

### Canonical URLs
- Each page has a canonical URL to prevent duplicate content
- Uses `alternates.canonical` metadata

### Structured Data Opportunities
Consider adding JSON-LD structured data for:
- SoftwareApplication schema for download pages
- Article schema for resource pages
- Organization schema for global layout
- BreadcrumbList for navigation

### Performance Optimizations
- Next.js automatic optimization
- Metadata in separate files for code splitting
- Lazy loading of social preview images

## Next Steps & Recommendations

### 1. Create Social Preview Images
Create the following Open Graph images (1200x630px):
- `/public/og-image.png` - Homepage
- `/public/og-about.png` - About page
- `/public/og-downloads.png` - Downloads hub
- `/public/og-windows.png` - Windows download
- `/public/og-linux.png` - Linux download
- `/public/og-android.png` - Android download
- `/public/og-resources.png` - Resources hub
- `/public/og-what-is.png` - What is Corridor
- `/public/og-how-to.png` - How to use
- `/public/og-use-cases.png` - Use cases
- `/public/og-privacy.png` - Privacy policy
- `/public/og-terms.png` - Terms of service

### 2. Set Up Social Media Accounts
- Create Twitter/X account and update `twitter:creator`
- Verify Open Graph previews using Facebook Debugger
- Test Twitter Card previews using Twitter Card Validator

### 3. Add JSON-LD Structured Data
Example for download pages:
```typescript
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Corridor",
  "operatingSystem": "Windows 10, Windows 11",
  "applicationCategory": "UtilitiesApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

### 4. Google Search Console Setup
- Verify site ownership
- Submit sitemap.xml
- Monitor search performance
- Check for indexing issues

### 5. Analytics Implementation
- Google Analytics 4 (optional, privacy-conscious)
- Track page views and user flows
- Monitor download button clicks
- A/B test title variations

### 6. Performance Monitoring
- Use Lighthouse for SEO audits
- Monitor Core Web Vitals
- Test mobile usability
- Check page speed scores

### 7. Content Updates
- Update `publishedTime` when content changes
- Keep keywords fresh and relevant
- Monitor search trends for new keyword opportunities
- Update metadata based on analytics insights

## SEO Checklist

✅ Title tags (50-60 characters)
✅ Meta descriptions (150-160 characters)
✅ Keywords (relevant and specific)
✅ Open Graph tags
✅ Twitter Card tags
✅ Canonical URLs
✅ Sitemap.xml
✅ Robots.txt
✅ Mobile-friendly viewport
✅ HTTPS (via Cloudflare)
✅ Fast loading times (Next.js)
✅ Semantic HTML structure
✅ Descriptive URLs
✅ Image alt texts (in components)

⏳ Social preview images (need creation)
⏳ JSON-LD structured data (recommended)
⏳ Google Search Console verification
⏳ Social media account setup
⏳ Google verification code in metadata

## Monitoring & Maintenance

### Weekly
- Check Google Search Console for errors
- Monitor ranking changes for target keywords
- Review organic traffic in analytics

### Monthly
- Update content based on search trends
- Refresh metadata if needed
- Add new keywords based on search queries
- Check for broken links

### Quarterly
- Comprehensive SEO audit
- Competitor analysis
- Update structured data
- Review and optimize underperforming pages

## Resources

- [Next.js Metadata Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Google Search Central](https://developers.google.com/search)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org](https://schema.org/)

---

**Implementation Date:** November 2, 2024
**Last Updated:** November 2, 2024
**Status:** ✅ Complete - Ready for deployment
