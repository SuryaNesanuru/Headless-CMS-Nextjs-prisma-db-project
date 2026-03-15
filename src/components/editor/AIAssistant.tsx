"use client";

import { useState } from "react";
import { Sparkles, FileText, Search, Languages, Loader2, X } from "lucide-react";

interface AIAssistantProps {
  onInsert: (text: string) => void;
  currentContent?: string;
}

export default function AIAssistant({ onInsert, currentContent }: AIAssistantProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("Spanish");

  const runAction = async (action: string) => {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          prompt,
          content: currentContent || prompt,
          language,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setResult(`Error: ${data.error}`);
      } else {
        setResult(data.result);
      }
    } catch {
      setResult("Failed to generate content. Check your AI configuration.");
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 text-violet-400 hover:text-violet-300 hover:border-violet-500/30 rounded-xl text-sm font-medium transition-all"
      >
        <Sparkles className="w-4 h-4" />
        AI Assistant
      </button>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-violet-500/20 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          AI Content Assistant
        </h3>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
          placeholder="Describe what you want to generate..."
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => runAction("generate")}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          <FileText className="w-3.5 h-3.5" />
          Generate Content
        </button>
        <button
          type="button"
          onClick={() => runAction("seo")}
          disabled={loading || !currentContent}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          <Search className="w-3.5 h-3.5" />
          SEO Description
        </button>
        <button
          type="button"
          onClick={() => runAction("summarize")}
          disabled={loading || !currentContent}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          <FileText className="w-3.5 h-3.5" />
          Summarize
        </button>
        <div className="flex items-center gap-1.5">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-2 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-xs focus:outline-none"
          >
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
            <option>Japanese</option>
            <option>Chinese</option>
            <option>Hindi</option>
            <option>Arabic</option>
          </select>
          <button
            type="button"
            onClick={() => runAction("translate")}
            disabled={loading || !currentContent}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Languages className="w-3.5 h-3.5" />
            Translate
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-violet-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating...
        </div>
      )}

      {result && (
        <div className="space-y-2">
          <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-3 text-sm text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
            {result}
          </div>
          <button
            type="button"
            onClick={() => { onInsert(result); setResult(""); setOpen(false); }}
            className="px-3 py-1.5 bg-violet-500 hover:bg-violet-600 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Insert into Editor
          </button>
        </div>
      )}
    </div>
  );
}
