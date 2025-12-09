# AI Safety Website

This is the Next.js implementation of aisafety.com, migrated from WebFlow.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## Environment Variables

Create a `.env.local` file with your Airtable credentials:

```
AIRTABLE_TOKEN=your_personal_access_token_here
AIRTABLE_BASE_ID=your_base_id_here
```

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Airtable** - Data source
- **ESLint + Prettier** - Code quality and formatting
- **Husky** - Git hooks for pre-commit checks

## Deployment

Deploy to Vercel for automatic builds and deployments from git pushes.
