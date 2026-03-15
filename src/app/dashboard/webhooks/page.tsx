"use client";

import { useEffect, useState } from "react";
import { Webhook, Plus, Trash2, X, Check, XCircle } from "lucide-react";

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
  _count: { logs: number };
}

const allEvents = ["content.published", "content.updated", "content.deleted"];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", events: allEvents, secret: "" });

  useEffect(() => { fetchWebhooks(); }, []);

  const fetchWebhooks = async () => {
    const res = await fetch("/api/webhooks");
    if (res.ok) setWebhooks(await res.json());
    setLoading(false);
  };

  const createWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowCreate(false);
    setForm({ name: "", url: "", events: allEvents, secret: "" });
    fetchWebhooks();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/webhooks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    fetchWebhooks();
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm("Delete this webhook?")) return;
    await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
    fetchWebhooks();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Webhooks</h1>
          <p className="text-slate-400 mt-1">Notify external apps when content changes.</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all text-sm">
          <Plus className="w-4 h-4" />New Webhook
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Create Webhook</h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={createWebhook} className="space-y-4">
              <input type="text" placeholder="Webhook Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" required />
              <input type="url" placeholder="https://example.com/webhook" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" required />
              <input type="text" placeholder="Secret (optional)" value={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Events</label>
                <div className="space-y-2">
                  {allEvents.map((event) => (
                    <label key={event} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.events.includes(event)}
                        onChange={(e) => setForm({ ...form, events: e.target.checked ? [...form.events, event] : form.events.filter((ev) => ev !== event) })}
                        className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-indigo-500" />
                      <span className="text-sm text-slate-300">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors">Create Webhook</button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : webhooks.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-12 text-center">
          <Webhook className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No webhooks configured</h3>
          <p className="text-slate-400">Create a webhook to notify external services when content changes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {webhooks.map((wh) => (
            <div key={wh.id} className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-sm font-semibold text-white">{wh.name}</h3>
                  {wh.active ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">Active</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 font-medium">Inactive</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-2 font-mono">{wh.url}</p>
                <div className="flex items-center gap-2">
                  {(wh.events as string[]).map((e) => (
                    <span key={e} className="text-xs px-2 py-0.5 bg-slate-800/80 text-slate-300 rounded-md">{e}</span>
                  ))}
                  <span className="text-xs text-slate-500 ml-2">{wh._count.logs} deliveries</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(wh.id, wh.active)}
                  className={`p-2 rounded-lg transition-colors ${wh.active ? "text-emerald-400 hover:bg-emerald-500/10" : "text-slate-400 hover:bg-slate-800"}`}>
                  {wh.active ? <Check className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </button>
                <button onClick={() => deleteWebhook(wh.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
