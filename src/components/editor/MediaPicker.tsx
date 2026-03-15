"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Upload, X, Loader2, Check } from "lucide-react";

interface MediaPickerProps {
  value: string;
  onChange: (url: string) => void;
}

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
}

export default function MediaPicker({ value, onChange }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/media")
        .then((r) => r.json())
        .then(setMedia)
        .catch(() => {});
    }
  }, [open]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/media", { method: "POST", body: formData });
      const item = await res.json();
      setMedia((prev) => [item, ...prev]);
      onChange(item.url);
      setOpen(false);
    } catch {
      // handle error
    }
    setUploading(false);
  };

  return (
    <div>
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer border-2 border-dashed border-slate-700/50 rounded-xl p-4 text-center hover:border-indigo-500/50 transition-colors"
      >
        {value ? (
          <div className="relative">
            <img src={value} alt="Selected" className="max-h-32 mx-auto rounded-lg object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="py-4">
            <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Click to select image</p>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">Select Media</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-800">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload New"}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </label>
            </div>

            <div className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {media
                .filter((m) => m.mimeType?.startsWith("image/"))
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { onChange(item.url); setOpen(false); }}
                    className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      value === item.url ? "border-indigo-500" : "border-transparent hover:border-slate-600"
                    }`}
                  >
                    <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                    {value === item.url && (
                      <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              {media.filter((m) => m.mimeType?.startsWith("image/")).length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-500 text-sm">
                  No images uploaded yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
