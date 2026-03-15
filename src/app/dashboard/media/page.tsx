"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Upload, Trash2, Loader2 } from "lucide-react";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
  uploadedBy: { name: string };
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchMedia(); }, []);

  const fetchMedia = async () => {
    const res = await fetch("/api/media");
    setMedia(await res.json());
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      await fetch("/api/media", { method: "POST", body: formData });
    }
    e.target.value = "";
    await fetchMedia();
    setUploading(false);
  };

  const deleteMedia = async (id: string) => {
    if (!confirm("Delete this file?")) return;
    await fetch(`/api/media/${id}`, { method: "DELETE" });
    fetchMedia();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Media Library</h1>
          <p className="text-slate-400 mt-1">Upload and manage your media files.</p>
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 text-sm cursor-pointer">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Uploading..." : "Upload Files"}
          <input type="file" multiple onChange={handleUpload} className="hidden" accept="image/*,video/*,application/pdf" />
        </label>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : media.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-12 text-center">
          <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No media files yet</h3>
          <p className="text-slate-400">Upload your first file to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {media.map((item) => (
            <div key={item.id} className="group bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden hover:border-slate-700/50 transition-all">
              <div className="aspect-square bg-slate-800 relative">
                {item.mimeType?.startsWith("image/") ? (
                  <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-slate-600" />
                  </div>
                )}
                <button
                  onClick={() => deleteMedia(item.id)}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/80 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-white truncate">{item.filename}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{formatSize(item.size)} · {item.uploadedBy.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
