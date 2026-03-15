"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Database, Plus, Trash2, Edit, MoreVertical } from "lucide-react";

interface ContentModel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fields: { name: string; type: string; required: boolean }[];
  createdAt: string;
  createdBy: { name: string };
  _count: { entries: number };
}

export default function ModelsPage() {
  const [models, setModels] = useState<ContentModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    const res = await fetch("/api/models");
    const data = await res.json();
    setModels(data);
    setLoading(false);
  };

  const deleteModel = async (id: string) => {
    if (!confirm("Delete this model and all its entries?")) return;
    await fetch(`/api/models/${id}`, { method: "DELETE" });
    fetchModels();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Content Models</h1>
          <p className="text-slate-400 mt-1">Define the structure of your content types.</p>
        </div>
        <Link
          href="/dashboard/models/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 text-sm"
        >
          <Plus className="w-4 h-4" />
          New Model
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : models.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-12 text-center">
          <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No content models yet</h3>
          <p className="text-slate-400 mb-6">Create your first content model to start managing content.</p>
          <Link
            href="/dashboard/models/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Model
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {models.map((model) => (
            <div
              key={model.id}
              className="group bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-6 hover:border-slate-700/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                  <Database className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/dashboard/models/${model.id}/edit`}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => deleteModel(model.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-1">{model.name}</h3>
              <p className="text-sm text-slate-500 mb-4">/{model.slug}</p>

              {model.description && (
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{model.description}</p>
              )}

              <div className="flex flex-wrap gap-1.5 mb-4">
                {model.fields.slice(0, 5).map((field) => (
                  <span
                    key={field.name}
                    className="text-xs px-2 py-1 bg-slate-800/80 text-slate-300 rounded-md"
                  >
                    {field.name}
                    <span className="text-slate-500 ml-1">({field.type})</span>
                  </span>
                ))}
                {model.fields.length > 5 && (
                  <span className="text-xs px-2 py-1 bg-slate-800/80 text-slate-500 rounded-md">
                    +{model.fields.length - 5} more
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                <span className="text-xs text-slate-500">
                  {model._count.entries} {model._count.entries === 1 ? "entry" : "entries"}
                </span>
                <Link
                  href={`/dashboard/content?modelId=${model.id}`}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  View entries →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
