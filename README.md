# WellnessForge

Forge Your Path to Better Health: Discover, Share, and Thrive. A community-driven platform for wellness kits.

## Project Description
A Next.js 15 app with Express.js backend and MongoDB, featuring public landing/products pages and protected add-product functionality using NextAuth.js.

## Setup & Installation Instructions
1. Clone the repo.
2. Install dependencies: `npm install`
3. Set up `.env` with required variables.
4. Run locally: Frontend - `npm run dev`; Backend - `npm start`

## Route Summary
- `/`: Landing page (Navbar, Hero, Kit Highlights, Footer)
- `/login`: Google login, redirects to `/kits`
- `/kits`: Public list of kits
- `/kits/[id]`: Public kit details
- `/dashboard/add-kit`: Protected form to add kit (with spinner and toast)

Live Site: [Frontend on Firebase](<your-firebase-url>) | [Backend on Vercel](<your-vercel-url>)


