import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@contentforge.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@contentforge.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create editor user
  const editorPassword = await bcrypt.hash("editor123", 12);
  const editor = await prisma.user.upsert({
    where: { email: "editor@contentforge.com" },
    update: {},
    create: {
      name: "Editor User",
      email: "editor@contentforge.com",
      password: editorPassword,
      role: "EDITOR",
    },
  });
  console.log("✅ Editor user created:", editor.email);

  // Create Blog Post model
  const blogModel = await prisma.contentModel.upsert({
    where: { slug: "blog-post" },
    update: {},
    create: {
      name: "Blog Post",
      slug: "blog-post",
      description: "Blog articles and posts",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "content", type: "richText", required: true },
        { name: "coverImage", type: "image", required: false },
        { name: "tags", type: "array", required: false },
        { name: "published", type: "boolean", required: false },
      ],
      createdById: admin.id,
    },
  });
  console.log("✅ Blog Post model created");

  // Create Product model
  const productModel = await prisma.contentModel.upsert({
    where: { slug: "product" },
    update: {},
    create: {
      name: "Product",
      slug: "product",
      description: "Product catalog items",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "description", type: "richText", required: true },
        { name: "price", type: "number", required: true },
        { name: "images", type: "image", required: false },
        { name: "inStock", type: "boolean", required: false },
        { name: "category", type: "select", required: false, options: ["Electronics", "Clothing", "Books", "Home", "Other"] },
      ],
      createdById: admin.id,
    },
  });
  console.log("✅ Product model created");

  // Create sample blog entries
  await prisma.contentEntry.createMany({
    data: [
      {
        modelId: blogModel.id,
        data: {
          title: "Getting Started with ContentForge CMS",
          content: "<h2>Welcome to ContentForge</h2><p>ContentForge is a modern, developer-first headless CMS built with Next.js. It provides a powerful admin dashboard for managing content and exposes REST APIs that any frontend can consume.</p><h3>Key Features</h3><ul><li>Dynamic content model builder</li><li>Rich text editing with TipTap</li><li>AI-powered content generation</li><li>Webhook integrations</li><li>Role-based access control</li></ul><p>Let's explore how you can use ContentForge to power your next project.</p>",
          tags: ["tutorial", "cms", "next.js"],
          published: true,
        },
        status: "PUBLISHED",
        publishedAt: new Date(),
        createdById: admin.id,
      },
      {
        modelId: blogModel.id,
        data: {
          title: "Building APIs with Headless CMS",
          content: "<h2>The Power of Headless Architecture</h2><p>A headless CMS decouples your content management from your frontend presentation layer. This means you can use any framework - React, Vue, Svelte, or even mobile apps - to display your content.</p><p>ContentForge provides REST APIs out of the box with support for filtering, pagination, and sorting.</p><h3>Example API Call</h3><p>Fetch all published blog posts:</p><p><code>GET /api/content/blog-post?page=1&limit=10&sort=createdAt&order=desc</code></p>",
          tags: ["api", "headless", "architecture"],
          published: true,
        },
        status: "PUBLISHED",
        publishedAt: new Date(),
        createdById: editor.id,
      },
      {
        modelId: blogModel.id,
        data: {
          title: "AI Content Generation in CMS Workflows",
          content: "<h2>Supercharge Your Content</h2><p>ContentForge includes an AI content assistant powered by OpenAI or local models through Ollama. Use it to generate blog posts, create SEO descriptions, summarize long articles, or translate content into multiple languages.</p><p>The AI assistant is integrated directly into the content editor, making it easy to enhance your workflow.</p>",
          tags: ["ai", "content", "productivity"],
          published: false,
        },
        status: "DRAFT",
        createdById: admin.id,
      },
    ],
  });
  console.log("✅ Sample blog entries created");

  // Create sample product entries
  await prisma.contentEntry.createMany({
    data: [
      {
        modelId: productModel.id,
        data: {
          name: "Premium Headphones",
          description: "<p>High-quality wireless headphones with noise cancellation and 30-hour battery life.</p>",
          price: 299.99,
          inStock: true,
          category: "Electronics",
        },
        status: "PUBLISHED",
        publishedAt: new Date(),
        createdById: admin.id,
      },
      {
        modelId: productModel.id,
        data: {
          name: "Developer T-Shirt",
          description: "<p>Comfortable cotton t-shirt with a witty developer quote. Available in multiple sizes.</p>",
          price: 29.99,
          inStock: true,
          category: "Clothing",
        },
        status: "PUBLISHED",
        publishedAt: new Date(),
        createdById: editor.id,
      },
    ],
  });
  console.log("✅ Sample product entries created");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Login Credentials:");
  console.log("  Admin: admin@contentforge.com / admin123");
  console.log("  Editor: editor@contentforge.com / editor123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
