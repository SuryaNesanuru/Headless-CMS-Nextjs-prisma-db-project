"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileText, Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface Model { id: string; name: string; slug: string; }
interface Entry {
  id: string;
  data: Record<string, unknown>;
  status: string;
  modelId: string;
  model: { name: string; slug: string };
  createdBy: { name: string };
  createdAt: string;
  updatedAt: string;
}

function ContentList() {
  const searchParams = useSearchParams();
  const preselectedModelId = searchParams.get("modelId");
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(preselectedModelId || "");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetch("/api/models").then((r) => r.json()).then(setModels);
  }, []);

  useEffect(() => {
    if (selectedModel) fetchEntries();
  }, [selectedModel, page, statusFilter]);

  const fetchEntries = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      modelId: selectedModel,
      page: String(page),
      limit: "10",
    });
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/entries?${params}`);
    const data = await res.json();
    setEntries(data.entries || []);
    setTotalPages(data.pagination?.totalPages || 1);
    setLoading(false);
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/entries/${id}`, { method: "DELETE" });
    fetchEntries();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Content Entries</h1>
          <p className="text-slate-400 mt-1">Manage your content across all models.</p>
        </div>
        {selectedModel && (
          <Link
            href={`/dashboard/content/${selectedModel}/new`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 text-sm"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <select
          value={selectedModel}
          onChange={(e) => { setSelectedModel(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-slate-900/50 border border-slate-800/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <option value="">Select a model...</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-slate-900/50 border border-slate-800/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="REVIEW">Review</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>

      {!selectedModel ? (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Select a content model</h3>
          <p className="text-slate-400">Choose a model above to view and manage its entries.</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No entries yet</h3>
          <p className="text-slate-400 mb-6">Create your first content entry for this model.</p>
          <Link
            href={`/dashboard/content/${selectedModel}/new`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Entry
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Title / Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Updated</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {(entry.data as Record<string, string>)?.title ||
                        (entry.data as Record<string, string>)?.name ||
                        "Untitled"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        entry.status === "PUBLISHED"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : entry.status === "REVIEW"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-slate-500/10 text-slate-400"
                      }`}>
                        {entry.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{entry.createdBy.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(entry.updatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/content/${entry.modelId}/${entry.id}/edit`}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="text-xs text-red-400 hover:text-red-300 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-400">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ContentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ContentList />
    </Suspense>
  );
}
