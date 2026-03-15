"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical, ArrowLeft } from "lucide-react";

const fieldTypes = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "richText", label: "Rich Text" },
  { value: "image", label: "Image" },
  { value: "date", label: "Date" },
  { value: "array", label: "Array" },
  { value: "select", label: "Select" },
];

interface Field {
  name: string;
  type: string;
  required: boolean;
  options?: string[];
}

export default function EditModelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/models/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setName(data.name);
        setDescription(data.description || "");
        setFields(data.fields);
      });
  }, [id]);

  const addField = () => setFields([...fields, { name: "", type: "text", required: false }]);
  const removeField = (index: number) => setFields(fields.filter((_, i) => i !== index));
  const updateField = (index: number, updates: Partial<Field>) => {
    const nf = [...fields];
    nf[index] = { ...nf[index], ...updates };
    setFields(nf);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validFields = fields.filter((f) => f.name.trim());
    if (validFields.length === 0) {
      setError("Add at least one field");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/models/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, fields: validFields }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error);
        setLoading(false);
        return;
      }
      router.push("/dashboard/models");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Models
        </button>
        <h1 className="text-3xl font-bold text-white tracking-tight">Edit Model</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Model Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none" rows={2} />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Fields</h2>
            <button type="button" onClick={addField} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Add Field
            </button>
          </div>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={index} className="flex items-start gap-3 bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
                <div className="pt-2.5 text-slate-600"><GripVertical className="w-4 h-4" /></div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Field Name</label>
                    <input type="text" value={field.name} onChange={(e) => updateField(index, { name: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Type</label>
                    <select value={field.type} onChange={(e) => updateField(index, { type: e.target.value })} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all">
                      {fieldTypes.map((ft) => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={field.required} onChange={(e) => updateField(index, { required: e.target.checked })} className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-indigo-500" />
                      <span className="text-sm text-slate-300">Required</span>
                    </label>
                  </div>
                  {field.type === "select" && (
                    <div className="col-span-full">
                      <label className="block text-xs text-slate-500 mb-1">Options (comma separated)</label>
                      <input type="text" value={field.options?.join(", ") || ""} onChange={(e) => updateField(index, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => removeField(index)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 text-sm">
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors text-sm">Cancel</button>
        </div>
      </form>
    </div>
  );
}
