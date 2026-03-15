import Link from "next/link";
import { notFound } from "next/navigation";

interface BlogPost {
  id: string;
  title?: string;
  content?: string;
  coverImage?: string;
  tags?: string[];
  author: string;
  publishedAt: string;
  createdAt: string;
}

async function getPost(id: string): Promise<BlogPost | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/content/blog-post/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-8"
      >
        ← Back to Blog
      </Link>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, i) => (
            <span key={i} className="text-xs px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

      <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6 leading-tight">
        {post.title || "Untitled"}
      </h1>

      <div className="flex items-center gap-4 text-sm text-slate-400 mb-10 pb-10 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            {post.author?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <span>{post.author}</span>
        </div>
        <span>·</span>
        <span>
          {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      {post.coverImage && (
        <div className="rounded-2xl overflow-hidden mb-10">
          <img
            src={post.coverImage}
            alt={post.title || ""}
            className="w-full object-cover"
          />
        </div>
      )}

      <div
        className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-indigo-400 prose-strong:text-white prose-code:text-emerald-400 prose-blockquote:border-indigo-500"
        dangerouslySetInnerHTML={{ __html: post.content || "" }}
      />
    </article>
  );
}
