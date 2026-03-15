import Link from "next/link";

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

async function getPosts(): Promise<BlogPost[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/content/blog-post?limit=50`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-white tracking-tight mb-4">
          The Blog
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Explore insights, tutorials, and stories powered by ContentForge CMS.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-500 text-lg mb-4">No blog posts published yet.</p>
          <p className="text-slate-600">
            Create a &quot;Blog Post&quot; content model in the{" "}
            <Link href="/dashboard/models" className="text-indigo-400 hover:text-indigo-300">
              dashboard
            </Link>{" "}
            and publish some entries.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="group bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden hover:border-slate-700/50 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300"
            >
              {post.coverImage && (
                <div className="aspect-video bg-slate-800 overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title || ""}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6">
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                  {post.title || "Untitled"}
                </h2>
                {post.content && (
                  <p className="text-sm text-slate-400 line-clamp-3 mb-4"
                    dangerouslySetInnerHTML={{
                      __html: post.content.replace(/<[^>]*>/g, "").substring(0, 200),
                    }}
                  />
                )}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>By {post.author}</span>
                  <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
