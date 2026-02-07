# StayOnSite

Quick lodgings finder for construction workers.

## About

StayOnSite helps construction companies find nearby accommodations for their workers. Built with modern web technologies for a fast, responsive experience.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Fast build tool
- **shadcn/ui** - Beautiful UI components
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **React Query** - Data fetching
- **Zod** - Schema validation

## Development

### Prerequisites

- Node.js 18+ (install via [nvm](https://github.com/nvm-sh/nvm))
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/Ac0AI/stayonsite.git
cd stayonsite

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Deployment

This project can be deployed to Vercel, Netlify, or any static hosting service.

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Route pages
├── hooks/          # Custom React hooks
├── contexts/       # React contexts
├── lib/            # Utility functions
├── types/          # TypeScript types
└── data/           # Static data
```

## License

Private - All rights reserved

## Contact

For questions or support, contact [kajsa@stayonsite.se](mailto:kajsa@stayonsite.se)
