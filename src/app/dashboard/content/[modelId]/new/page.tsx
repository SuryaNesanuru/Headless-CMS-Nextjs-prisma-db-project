"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import MediaPicker from "@/components/editor/MediaPicker";
import AIAssistant from "@/components/editor/AIAssistant";

const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor"), { ssr: false });

interface FieldDef {
  name: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface ModelData {
  id: string;
  name: string;
  fields: FieldDef[];
}

export default function NewEntryPage({ params }: { params: Promise<{ modelId: string }> }) {
  const { modelId } = use(params);
  const router = useRouter();
  const [model, setModel] = useState<ModelData | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [status, setStatus] = useState("DRAFT");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/models/${modelId}`)
      .then((r) => r.json())
      .then((data) => {
        setModel(data);
        const initial: Record<string, unknown> = {};
        data.fields.forEach((f: FieldDef) => {
          switch (f.type) {
            case "boolean": initial[f.name] = false; break;
            case "number": initial[f.name] = 0; break;
            case "array": initial[f.name] = []; break;
            default: initial[f.name] = "";
          }
        });
        setFormData(initial);
      });
  }, [modelId]);

  const updateField = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (submitStatus: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId,
          data: formData,
          status: submitStatus,
          scheduledAt: scheduledAt || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error);
        setLoading(false);
        return;
      }
      router.push("/dashboard/content?modelId=" + modelId);
    } catch {
      setError("Failed to create entry");
      setLoading(false);
    }
  };

  if (!model) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const richTextContent = Object.entries(formData)
    .filter(([key]) => model.fields.find((f) => f.name === key)?.type === "richText")
    .map(([, val]) => String(val))
    .join(" ");

  return (
    <div>
      <div className="mb-8">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Entries
        </button>
        <h1 className="text-3xl font-bold text-white tracking-tight">New {model.name}</h1>
        <p className="text-slate-400 mt-1">Create a new entry for {model.name}.</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}

        <AIAssistant
          currentContent={richTextContent}
          onInsert={(text) => {
            const rtField = model.fields.find((f) => f.type === "richText");
            if (rtField) updateField(rtField.name, text);
          }}
        />

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 space-y-5">
          {model.fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {field.name}
                {field.required && <span className="text-red-400 ml-1">*</span>}
                <span className="text-xs text-slate-500 ml-2 font-normal">({field.type})</span>
              </label>

              {field.type === "text" && (
                <input
                  type="text"
                  value={String(formData[field.name] || "")}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  required={field.required}
                />
              )}

              {field.type === "number" && (
                <input
                  type="number"
                  value={String(formData[field.name] || "")}
                  onChange={(e) => updateField(field.name, parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  required={field.required}
                />
              )}

              {field.type === "boolean" && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData[field.name]}
                    onChange={(e) => updateField(field.name, e.target.checked)}
                    className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-indigo-500 focus:ring-indigo-500/50"
                  />
                  <span className="text-sm text-slate-300">Enabled</span>
                </label>
              )}

              {field.type === "richText" && (
                <RichTextEditor
                  content={String(formData[field.name] || "")}
                  onChange={(val) => updateField(field.name, val)}
                />
              )}

              {field.type === "image" && (
                <MediaPicker
                  value={String(formData[field.name] || "")}
                  onChange={(val) => updateField(field.name, val)}
                />
              )}

              {field.type === "date" && (
                <input
                  type="datetime-local"
                  value={String(formData[field.name] || "")}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              )}

              {field.type === "array" && (
                <div className="space-y-2">
                  {(Array.isArray(formData[field.name]) ? (formData[field.name] as string[]) : []).map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const arr = [...(formData[field.name] as string[])];
                          arr[i] = e.target.value;
                          updateField(field.name, arr);
                        }}
                        className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const arr = (formData[field.name] as string[]).filter((_, idx) => idx !== i);
                          updateField(field.name, arr);
                        }}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => updateField(field.name, [...(Array.isArray(formData[field.name]) ? (formData[field.name] as string[]) : []), ""])}
                    className="text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    + Add item
                  </button>
                </div>
              )}

              {field.type === "select" && (
                <select
                  value={String(formData[field.name] || "")}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Schedule Publication</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
          <p className="text-xs text-slate-500 mt-1">Optional: schedule when this entry should be published.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSubmit("DRAFT")}
            disabled={loading}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors text-sm disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit("REVIEW")}
            disabled={loading}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition-colors text-sm disabled:opacity-50"
          >
            Submit for Review
          </button>
          <button
            onClick={() => handleSubmit("PUBLISHED")}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-sm disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
