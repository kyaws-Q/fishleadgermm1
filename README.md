# FishLedger - Fish Purchase and Shipment Management

## Project info

**URL**: https://lovable.dev/projects/c7ab77e5-197c-4afb-8d4d-9833fb1ffbf7

## Features

- Dashboard with analytics and charts
- Purchase management
- Shipment tracking
- Export functionality
- User authentication
- Theme customization
- Internationalization
- Accessibility features
- Feature flags for gradual rollouts
- Comprehensive test coverage
- CI/CD pipeline
- Performance monitoring

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c7ab77e5-197c-4afb-8d4d-9833fb1ffbf7) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Zod for validation
- Jest for testing
- GitHub Actions for CI/CD

## Project Structure

```
src/
├── components/         # UI components
│   ├── ui/             # Base UI components
│   ├── layout/         # Layout components
│   └── [feature]/      # Feature-specific components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── lib/                # Utility libraries
│   ├── utils.ts        # General utilities
│   ├── validations/    # Zod validation schemas
│   └── [feature]/      # Feature-specific utilities
├── pages/              # Page components
├── services/           # API services
├── styles/             # Global styles
│   ├── globals.css     # Global CSS
│   └── theme.ts        # Theme definitions
├── types/              # TypeScript type definitions
│   ├── index.ts        # Type exports
│   └── [domain].ts     # Domain-specific types
├── utils/              # Utility functions
├── App.tsx             # Main App component
└── main.tsx            # Entry point
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run update-browserslist` - Update browserslist database

## Design System

The application uses a consistent design system with:

- Color palette with light and dark themes
- Typography system
- Spacing system
- Component library
- Animation system

For more details, see the [Design System Documentation](src/docs/design-system.md).

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c7ab77e5-197c-4afb-8d4d-9833fb1ffbf7) and click on Share -> Publish.

## Troubleshooting Guide

### Fixing Data Issues

If you're experiencing issues where your data isn't updating or you're seeing 403 Forbidden errors, follow these steps:

#### 1. Fix Supabase Row Level Security (RLS) Policies

When you see errors like:

- "Failed to load resource: the server responded with a status of 403 ()"
- "Error adding multiple purchases: Object"
- "AppContext: Error adding multiple purchases via service Object"

These are typically caused by Row Level Security (RLS) problems in your Supabase database.

To fix:

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to SQL Editor in the sidebar
4. Create a new query
5. Copy the entire content of the `fix-rls-policy.sql` file provided
6. Run the SQL query

This will:

- Enable Row Level Security on your purchases table
- Create policies allowing users to access only their own data
- Add indexes for better performance
- Create stored procedures for soft delete and recover functionality

#### 2. Verify Environment Variables

Check your environment files:

1. `.env.development.local` or `.env` file in the project root
2. Ensure it contains valid Supabase URL and anon key values:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

#### 3. Clear Browser Cache and Data

1. Open developer tools (F12 or right-click → Inspect)
2. Go to Application tab → Storage
3. Clear Site Data including:
   - Local Storage
   - Session Storage
   - IndexedDB
   - Cookies

#### 4. Restart Development Server

```sh
npm run dev
```

#### 5. Additional Troubleshooting

If issues persist, check:

1. Supabase Database Logs in your Supabase Dashboard
2. Browser Console for specific error messages
3. Browser Network tab when performing operations
4. Application server logs

For more detailed logging, check your Supabase dashboard under "Database" → "Logs".

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
#   f i s h l e d g e r m m 
 
 
