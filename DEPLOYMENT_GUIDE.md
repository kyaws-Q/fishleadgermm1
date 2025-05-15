# Fish Fin Ledger - Deployment Guide

This guide provides instructions on how to deploy the Fish Fin Ledger application to production with proper Supabase authentication.

## Prerequisites

- A Supabase account and project
- Node.js (v16 or later)
- A hosting service (Vercel, Netlify, etc.)

## 1. Setting Up Supabase

### Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign in
2. Create a new project
3. Note down your project URL and anon key from the API settings

### Database Setup

1. Create the necessary tables using the SQL scripts in the `supabase` folder
2. Set up RLS (Row Level Security) policies for your tables

## 2. Environment Configuration

Create environment variables on your hosting platform with the following values:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For local development, create a `.env.local` file in your project root with these same values.

## 3. Updating the Supabase Client

The application uses the Supabase client in `src/integrations/supabase/client.ts`. Make sure it's properly configured to use your environment variables:

```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: 'fish-fin-ledger-auth',
  },
});
```

## 4. Building for Production

Run the following commands to build the application:

```bash
npm install
npm run build
```

This will create a production-ready build in the `dist` folder.

## 5. Deployment Options

### Deploying to Vercel

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Connect the repository to Vercel
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Set the environment variables in the Vercel project settings

### Deploying to Netlify

1. Push your code to a Git repository
2. Connect the repository to Netlify
3. Configure build settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
4. Set the environment variables in the Netlify project settings

### Deploying to a Traditional Web Server

1. Build the application with `npm run build`
2. Upload the contents of the `dist` folder to your web server
3. Configure your web server to serve the application and handle client-side routing

## 6. Testing the Deployment

After deployment, visit your deployed application and test:

1. User authentication (signup, login, logout)
2. Data fetching from Supabase
3. Data creation and updates

## 7. Common Issues and Solutions

### CORS Issues

If you encounter CORS issues, make sure:
- Your Supabase project has the correct origins listed in the Authentication settings
- Your application URL is included in the allowed origins

### Authentication Issues

- Ensure your database has the correct tables and RLS policies
- Check that your environment variables are correctly set

### Data Not Showing Up

- Verify the Supabase connection is working
- Check the console for any errors
- Verify that the user has the correct permissions to access the data

## 8. Production Checklist

Before going live, ensure:

- [ ] Environment variables are properly set in production
- [ ] Authentication flows work correctly
- [ ] Database connections are secure
- [ ] Error handling is robust
- [ ] Logging is appropriate (not too verbose, not too sparse)
- [ ] Performance is optimized

## 9. Monitoring and Maintenance

- Set up monitoring for your application
- Regularly back up your Supabase database
- Keep dependencies updated

## Need Help?

For additional assistance, check the Supabase documentation or reach out to the community forums. 