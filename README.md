# ContentForge CMS

A developer-first headless CMS platform built with Next.js App Router, Prisma, and PostgreSQL.

![ContentForge Admin Dashboard Demo](public/demo-screenshot.png) *(Add a screenshot here)*

## Features

- **Dynamic Content Models**: Create custom content schemas with various field types (Text, Number, Boolean, Rich Text, Image, Date, Array, Select).
- **Modern Admin Dashboard**: A beautiful, dark-themed SaaS interface built with TailwindCSS and Shadcn UI.
- **Rich Text Editing**: Integrated TipTap editor with full formatting and markdown support.
- **AI Content Assistant**: Generate content, write SEO meta descriptions, summarize text, and translate into multiple languages using OpenAI or Ollama.
- **Media Library**: Upload, manage, and attach images and files to your content.
- **Webhooks**: Notify external applications when content is created, updated, or deleted.
- **Role-Based Access Control**: Admin, Editor, and Viewer roles with NextAuth authentication.
- **RESTful Content Delivery API**: Fetch published content for any frontend application with filtering, pagination, and sorting.
- **Demo Blog Frontend**: Includes a built-in example blog that consumes the CMS API.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js v4](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) (via [shadcn/ui](https://ui.shadcn.com/))
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Rich Text**: [TipTap](https://tiptap.dev/)
- **AI Integration**: [OpenAI SDK](https://platform.openai.com/docs/api-reference)

## Local Development Setup

1. **Clone the repository** (if applicable)

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your details:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `NEXTAUTH_SECRET`: Generate a strong secret (e.g., `openssl rand -base64 32`).
   - `OPENAI_API_KEY`: Your OpenAI API key if using the OpenAI provider.

4. **Database Initialization**
   Apply the Prisma schema to your database and generate the client:
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed the Database (Optional but recommended)**
   This will create an Admin user, an Editor user, sample content models (Blog Post, Product), and sample entries.
   ```bash
   npm run seed
   ```
   **Default Credentials:**
   - Admin: `admin@contentforge.com` / `admin123`
   - Editor: `editor@contentforge.com` / `editor123`

6. **Start the Development Server**
   ```bash
   npm run dev
   ```
   - Admin Dashboard: `http://localhost:3000/login`
   - Demo Blog: `http://localhost:3000/blog`

## Project Structure

```
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma       # Prisma models definition
│   └── seed.ts             # Database seeding script
├── public/                 # Static assets and local media uploads
├── src/
│   ├── app/                # Next.js App Router root
│   │   ├── (auth)/         # Login/Signup pages
│   │   ├── api/            # Backend API routes
│   │   ├── blog/           # Demo frontend application
│   │   ├── dashboard/      # Admin dashboard pages
│   │   ├── layout.tsx      # Global layout
│   │   └── page.tsx        # Landing page
│   ├── components/         # Reusable React components
│   │   ├── editor/         # Rich Text Editor, AI Assistant, Media Picker
│   │   ├── layout/         # Sidebar, Dashboard layouts
│   │   └── ui/             # Generic UI components (shadcn)
│   ├── lib/                # Utility functions and core configuration
│   │   ├── ai.ts           # OpenAI/Ollama integration
│   │   ├── auth.ts         # NextAuth configuration
│   │   ├── db.ts           # Prisma client singleton
│   │   ├── utils.ts        # Tailwind merge utilities
│   │   └── webhooks.ts     # Webhook trigger dispatcher
│   └── types/              # Global TypeScript definitions
```

## Content Delivery API

Frontend applications can consume your published content using the public REST API.

### Get Multiple Entries
`GET /api/content/:modelSlug`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `sort` (default: createdAt)
- `order` (asc or desc, default: desc)
- `[fieldName]` (Filter by specific data fields, e.g., `?category=Electronics`)

**Response:**
```json
{
  "data": [
    {
      "id": "cm...abc1",
      "modelId": "cm...xyz9",
      "title": "My First Post",
      "content": "<p>Hello world</p>",
      "status": "PUBLISHED",
      "publishedAt": "2024-05-20T10:00:00.000Z",
      "author": "Admin User",
      "createdAt": "2024-05-19T10:00:00.000Z",
      "updatedAt": "2024-05-20T10:00:00.000Z"
    }
  ],
  "pagination": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
}
```

### Get Single Entry
`GET /api/content/:modelSlug/:entryId`

## Deployment

### Docker Deployment
A `docker-compose.yml` and `Dockerfile` are provided for easy deployment.

```bash
docker-compose up -d --build
```
This will start a PostgreSQL container and the Next.js application container.

### Vercel Deployment
ContentForge is ready to be deployed on Vercel:
1. Push your code to GitHub/GitLab.
2. Import the project in Vercel.
3. Configure the Environment Variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, etc.).
   - *Note: You'll need an external PostgreSQL database (like Supabase, Neon, or Railway) instead of `localhost`.*
4. The build command (`npm run build`) automatically runs `prisma generate`.
5. Deploy.

*Note for Vercel/Serverless storage: Local media uploads (`public/uploads`) will not persist across deployments in a serverless environment. For production on Vercel, you should implement an external cloud storage provider (like AWS S3, Cloudinary, or Vercel Blob) in the `/api/media` routes.*

# Headless-CMS-Nextjs-prisma-db-project
