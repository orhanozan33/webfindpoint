# FindPoint - Modern Web Design Agency Website

A premium, modern web design agency website built with Next.js, TypeScript, and Tailwind CSS. Designed for Canadian businesses with full multilingual support (English, French, Turkish).

## 🚀 Features

- **Modern Tech Stack**: Next.js 14 with App Router, TypeScript, and Turbopack
- **Multilingual Support**: Full i18n with English (EN), French (FR), and Turkish (TR)
- **Responsive Design**: Mobile-first, fully responsive across all devices
- **Performance Optimized**: Fast page loads and smooth transitions
- **SEO Friendly**: Optimized metadata and structure
- **Accessibility**: WCAG compliant with proper focus states and semantic HTML
- **TypeORM Ready**: Database configuration included for future use

## 📋 Pages

- **Home**: Hero section, services overview, and call-to-action
- **Portfolio**: Showcase of projects with grid layout
- **Services**: Detailed service descriptions
- **Contact**: Contact form with validation

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Bundler**: Turbopack
- **ORM**: TypeORM (configured, ready for use)
- **i18n**: Custom middleware-based routing

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🌍 Language Support

The website supports three languages:
- English (EN) - Default: `/en`
- French (FR): `/fr`
- Turkish (TR): `/tr`

The middleware automatically redirects to the default locale if none is specified.

## 🎨 Design System

- **Primary Color**: Blue (#0ea5e9)
- **Neutral Colors**: Gray scale
- **Typography**: Inter font family
- **Spacing**: Consistent spacing scale
- **Animations**: Smooth fade-in and slide-up effects

## 📁 Project Structure

```
├── app/
│   ├── [locale]/          # Locale-based routes
│   │   ├── layout.tsx     # Locale layout with Header/Footer
│   │   ├── page.tsx       # Home page
│   │   ├── portfolio/     # Portfolio page
│   │   ├── services/      # Services page
│   │   ├── contact/       # Contact page
│   │   └── not-found.tsx  # 404 page
│   ├── api/
│   │   └── contact/       # Contact form API route
│   │       └── route.ts
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Root redirect
│   ├── not-found.tsx      # Global 404
│   ├── robots.ts          # SEO robots.txt
│   └── sitemap.ts         # SEO sitemap
├── components/
│   ├── layout/            # Layout components
│   │   ├── Header.tsx    # Navigation header
│   │   └── Footer.tsx    # Footer component
│   ├── ui/               # Reusable UI components
│   │   └── Button.tsx    # Button component
│   ├── sections/         # Page sections
│   │   ├── Hero.tsx
│   │   ├── ServicesOverview.tsx
│   │   ├── FeaturedPortfolio.tsx
│   │   ├── WhyFindPoint.tsx
│   │   ├── CallToAction.tsx
│   │   ├── PortfolioGrid.tsx
│   │   └── ServicesDetail.tsx
│   └── forms/            # Form components
│       └── ContactForm.tsx
├── lib/
│   ├── i18n/            # Internationalization
│   │   ├── index.ts     # Locale config
│   │   └── get-messages.ts
│   ├── db/              # Database
│   │   └── database.ts  # TypeORM PostgreSQL config
│   └── utils/           # Utilities
│       └── index.ts
├── entities/            # TypeORM entities
│   ├── BaseEntity.ts
│   ├── Portfolio.ts
│   └── Contact.ts
├── messages/            # Translation files
│   ├── en.json
│   ├── fr.json
│   └── tr.json
└── middleware.ts        # i18n middleware
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for database configuration (if using TypeORM with PostgreSQL):

```env
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=findpoint
DB_SSL=false

# Optional: Site URL for SEO
NEXT_PUBLIC_SITE_URL=https://findpoint.ca
```

**Note:** The contact form will work even without a database connection. If the database is not configured, form submissions will be logged to the console.

### TypeORM & PostgreSQL

TypeORM is configured with PostgreSQL support. The contact form API route (`app/api/contact/route.ts`) will attempt to save submissions to the database, but will gracefully handle cases where the database is not configured.

**To set up the database:**

1. Install PostgreSQL locally or use a cloud service (e.g., Supabase, Neon, Railway)
2. Create a database named `findpoint` (or update `DB_NAME` in `.env.local`)
3. The schema will be automatically created on first run (in development mode)
4. For production, use migrations to manage schema changes

**Entities:**
- `Portfolio` - Stores portfolio projects
- `Contact` - Stores contact form submissions

## 🚀 Deployment

The site can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Any Node.js hosting**

Make sure to set up environment variables in your hosting platform.

## 📝 Customization

### Adding New Languages

1. Add the locale to `lib/i18n.ts`
2. Create a new translation file in `messages/[locale].json`
3. Update the locale names in `localeNames`

### Modifying Content

All content is stored in JSON files in the `messages/` directory. Edit these files to update website content.

## 🎯 Performance

- Optimized images (when added)
- Code splitting
- Fast page transitions
- Minimal JavaScript bundle
- CSS optimization with Tailwind

## 📄 License

This project is proprietary and confidential.

## 👥 Contact

FindPoint - Modern web design and development for Canadian businesses.

---

Built with ❤️ using Next.js and TypeScript