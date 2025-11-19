# TinyLink – URL Shortener

TinyLink is a simple and clean URL shortener built with **Next.js** and **Supabase**.  
Users can shorten long URLs, use custom short codes, track clicks, and view stats.  

---

## Features

- Create short links with **your own custom code**
- Redirect using `/:code` with a **302 redirect**
- Track:
  - Total clicks  
  - Last clicked time
- View link stats at `/code/:code`
- Delete links
- Search & filter in the dashboard
- Clean and responsive UI (Material UI)
- `/healthz` system health endpoint

---

## Tech Stack

- **Next.js (Pages Router)**
- **React**
- **Material UI**
- **Supabase (Postgres)**
- **Vercel** for deployment

---

## Getting Started

Install dependencies:

```bash
npm install

```
```bash
npm run dev

```
## env.example 
``` bash
cp .env.example .env.local
```
```bash
cd .env.example
```
``` bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

```
## Database
---
## TableName - Links
Fields: id, code, target, clicks, last_clicked, created_at



