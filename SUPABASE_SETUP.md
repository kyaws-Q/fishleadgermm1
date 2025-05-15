# Setting Up Supabase for Fish Fin Ledger

This guide provides step-by-step instructions for setting up a new Supabase project for your Fish Fin Ledger application.

## 1. Creating a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up/sign in
2. Click "New Project"
3. Choose an organization or create a new one
4. Enter a name for your project (e.g., "fish-fin-ledger")
5. Create a strong database password (save this somewhere secure)
6. Choose a region closest to your users
7. Click "Create new project"

## 2. Getting Your API Credentials

1. In your new project dashboard, navigate to Project Settings (gear icon) → API
2. You'll find:
   - Project URL (e.g., `https://your-project-id.supabase.co`)
   - `anon` public key
3. Copy these values - you'll need them for your application's environment variables

## 3. Setting Up Database Tables

### Option 1: Using the Web Interface

1. Go to the "Table Editor" in your Supabase dashboard
2. Create the following tables:

#### `purchases` Table
```sql
create table public.purchases (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  user_id uuid not null,
  company_name text not null,
  buyer_name text not null,
  fish_name text not null,
  size_kg numeric not null,
  quantity integer not null,
  price_per_unit numeric not null,
  total numeric not null,
  date timestamp with time zone not null,
  purchase_date text not null,
  payment_status text not null default 'unpaid',
  deleted_at timestamp with time zone,
  
  constraint purchases_pkey primary key (id)
);
```

#### `users` Table
```sql
create table public.users (
  id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  currency text not null default 'USD',
  theme text not null default 'light',

  constraint users_pkey primary key (id)
);
```

### Option 2: Using SQL Editor

1. Go to the "SQL Editor" in your Supabase dashboard
2. Create a new query and paste the table creation scripts
3. Run the script

## 4. Setting Up Row Level Security (RLS)

Enable Row Level Security on all tables:

1. Go to "Authentication" → "Policies"
2. For each table, enable RLS
3. Add the following policies:

#### Purchases Table Policies

```sql
-- Allow users to select only their own purchases
create policy "Users can view their own purchases"
  on purchases for select
  using (auth.uid() = user_id);

-- Allow users to insert their own purchases
create policy "Users can insert their own purchases"
  on purchases for insert
  with check (auth.uid() = user_id);

-- Allow users to update their own purchases
create policy "Users can update their own purchases"
  on purchases for update
  using (auth.uid() = user_id);

-- Allow users to delete their own purchases
create policy "Users can delete their own purchases"
  on purchases for delete
  using (auth.uid() = user_id);
```

#### Users Table Policies

```sql
-- Allow users to select only their own user data
create policy "Users can view their own data"
  on users for select
  using (auth.uid() = id);

-- Allow users to update only their own user data
create policy "Users can update their own data"
  on users for update
  using (auth.uid() = id);
```

## 5. Authentication Settings

1. Go to "Authentication" → "Settings"
2. Under "URL Configuration":
   - Set the Site URL to your application's URL (e.g., `https://yourapp.com`)
   - Add any additional redirect URLs
3. Under "Email Templates", you can customize the emails sent to users

## 6. Setting Up Supabase Storage (Optional)

If your app uses file uploads:

1. Go to "Storage" → "Create new bucket"
2. Name it (e.g., "user-uploads")
3. Set privacy to "Private" or "Public" depending on your needs
4. Create access policies for the bucket:

```sql
-- Allow users to upload their own files
create policy "Users can upload their own files"
  on storage.objects for insert
  with check (auth.uid() = owner);

-- Allow users to view their own files
create policy "Users can view their own files"
  on storage.objects for select
  using (auth.uid() = owner);
```

## 7. Testing Your Setup

1. Update your application's environment variables with the new Supabase URL and key
2. Try signing up a new user
3. Test creating, reading, updating, and deleting purchases
4. Verify RLS is working by trying to access another user's data (should fail)

## 8. Production-Ready Considerations

1. **Backups**: Set up automatic database backups
2. **Monitoring**: Enable logging and monitoring for your project
3. **Rate Limiting**: Consider implementing rate limiting for your API endpoints
4. **Custom Domain**: Set up a custom domain for your Supabase project (Pro plan feature)
5. **CORS Configuration**: Ensure your production domain is allowed in the CORS settings

## 9. Supabase CLI (Advanced)

For more advanced setups, consider using the Supabase CLI to:

1. Manage database migrations
2. Localize development
3. Generate types
4. Deploy changes

Installation:
```bash
npm install -g supabase
```

## Need Help?

- [Supabase Documentation](https://supabase.io/docs)
- [Supabase GitHub](https://github.com/supabase/supabase)
- [Supabase Discord](https://discord.supabase.com) 