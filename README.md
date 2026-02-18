# Smart Bookmark App

A simple bookmark manager built as a machine task to demonstrate authentication, data privacy, and real-time updates using modern full stack tools.

The focus of this project is on correctness, backend security, and clean UX rather than over-engineering.


## Features

- Google OAuth login (no email/password)
- Add bookmarks with title and URL
- Bookmarks are private to each user
- Realtime updates without page refresh
- Delete your own bookmarks
- Responsive UI for mobile and desktop

 

## Tech Stack

- Next.js (App Router)
- Supabase (Auth, Database, Realtime)
- PostgreSQL with Row Level Security (RLS)
- Tailwind CSS
- Vercel (deployment)

 

## Authentication & Security

Authentication is handled using Google OAuth via Supabase.  
All data access is enforced at the database level using Row Level Security (RLS), ensuring users can only read, insert, and delete their own bookmarks. No frontend-only security checks are used.

 

## Realtime Behavior

Supabase Realtime listens for changes on the bookmarks table.  
When a bookmark is added or deleted, updates are reflected instantly across tabs or devices without refreshing the page.



## Routing

Routing is handled under the `app/` directory using `page.tsx` and `layout.tsx`, with no use of the legacy `pages/` router.


## Problems Faced & Solutions

- OAuth redirects initially pointed to production even when testing locally. This was fixed by configuring additional redirect URLs in Supabase and explicitly setting the redirect target using window.location.origin.
- Duplicate API calls occurred after login due to overlapping effects. This was resolved by using a single auth state listener and letting the realtime subscription handle data updates.
- The bookmark form was not usable on mobile screens. A mobile-first layout was applied so inputs stack vertically on smaller screens and align horizontally on larger screens.

## Live Demo

https://supabase-bookmarks-pearl.vercel.app

- You can log in using any Google account.

## Running locally

```bash
# Clone the repo
git clone https://github.com/ansifar88/supabase-bookmarks
cd supabase-bookmarks

# Install dependencies
npm install

# Create env variables (create a file named .env.local and add the following)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start the dev server
npm run dev