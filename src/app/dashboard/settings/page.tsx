"use client";

import { Settings, Key, Cpu, Globe } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-slate-400 mt-1">Configure your CMS platform.</p>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">General</h2>
              <p className="text-sm text-slate-400">Platform information</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Site Name</label>
              <input type="text" defaultValue="ContentForge CMS" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Site URL</label>
              <input type="text" defaultValue="http://localhost:3000" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">API</h2>
              <p className="text-sm text-slate-400">API endpoints for frontend consumption</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Content API Base URL</p>
              <code className="text-sm text-emerald-400 font-mono">/api/content/&#123;modelSlug&#125;</code>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Single Entry API</p>
              <code className="text-sm text-emerald-400 font-mono">/api/content/&#123;modelSlug&#125;/&#123;entryId&#125;</code>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Query Parameters</p>
              <code className="text-sm text-slate-300 font-mono">?page=1&limit=20&sort=createdAt&order=desc</code>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">AI Configuration</h2>
              <p className="text-sm text-slate-400">Configure AI content generation</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">AI Provider</label>
              <select defaultValue="openai" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all">
                <option value="openai">OpenAI (GPT-4o Mini)</option>
                <option value="ollama">Ollama (Local)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">OpenAI API Key</label>
              <input type="password" placeholder="sk-..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
              <p className="text-xs text-slate-500 mt-1">Set via OPENAI_API_KEY environment variable</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Ollama Base URL</label>
              <input type="text" defaultValue="http://localhost:11434" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
            </div>
          </div>
        </div>

        <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all text-sm">
          Save Settings
        </button>
      </div>
    </div>
  );
}
