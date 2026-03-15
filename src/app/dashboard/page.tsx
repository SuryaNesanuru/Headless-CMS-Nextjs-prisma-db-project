import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Database,
  FileText,
  Image as ImageIcon,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [modelCount, entryCount, mediaCount, userCount, recentEntries] =
    await Promise.all([
      prisma.contentModel.count(),
      prisma.contentEntry.count(),
      prisma.media.count(),
      prisma.user.count(),
      prisma.contentEntry.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: {
          model: { select: { name: true } },
          createdBy: { select: { name: true } },
        },
      }),
    ]);

  const stats = [
    {
      label: "Content Models",
      value: modelCount,
      icon: Database,
      color: "from-indigo-500 to-blue-600",
      shadow: "shadow-indigo-500/20",
      href: "/dashboard/models",
    },
    {
      label: "Content Entries",
      value: entryCount,
      icon: FileText,
      color: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/20",
      href: "/dashboard/content",
    },
    {
      label: "Media Files",
      value: mediaCount,
      icon: ImageIcon,
      color: "from-orange-500 to-amber-600",
      shadow: "shadow-orange-500/20",
      href: "/dashboard/media",
    },
    {
      label: "Users",
      value: userCount,
      icon: Users,
      color: "from-purple-500 to-pink-600",
      shadow: "shadow-purple-500/20",
      href: "/dashboard/users",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Welcome back, {session.user.name}. Here&apos;s your content overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-6 hover:border-slate-700/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${stat.color} ${stat.shadow} shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-xs text-slate-500">
                <TrendingUp className="w-3 h-3" />
                <span>View all</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl">
        <div className="px-6 py-4 border-b border-slate-800/50">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Recent Activity
          </h2>
        </div>
        <div className="divide-y divide-slate-800/50">
          {recentEntries.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No content entries yet. Create a content model to get started.</p>
            </div>
          ) : (
            recentEntries.map((entry) => (
              <div key={entry.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors">
                <div>
                  <p className="text-sm font-medium text-white">
                    {(entry.data as Record<string, string>)?.title || (entry.data as Record<string, string>)?.name || "Untitled"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {entry.model.name} · by {entry.createdBy.name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    entry.status === "PUBLISHED"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : entry.status === "REVIEW"
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-slate-500/10 text-slate-400"
                  }`}>
                    {entry.status.toLowerCase()}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(entry.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
