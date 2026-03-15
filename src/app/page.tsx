import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

      {/* Decorative gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/30 mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>

        <h1 className="text-6xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
          Content<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Forge</span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-400 mb-4 font-light">
          Developer-First Headless CMS Platform
        </p>

        <p className="text-base text-slate-500 mb-12 max-w-2xl mx-auto">
          Create dynamic content models, manage content through a modern dashboard,
          and expose REST APIs that any frontend can consume.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-2xl shadow-indigo-500/25 transition-all duration-300 hover:scale-105 text-lg"
          >
            Open Dashboard
          </Link>
          <Link
            href="/blog"
            className="px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur text-white font-semibold rounded-2xl border border-slate-700/50 transition-all duration-300 hover:scale-105 text-lg"
          >
            View Blog Demo
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Content Models", desc: "Dynamic schemas" },
            { label: "REST API", desc: "Filter & paginate" },
            { label: "AI Assistant", desc: "OpenAI & Ollama" },
            { label: "Webhooks", desc: "Real-time events" },
          ].map((feat) => (
            <div key={feat.label} className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5 text-center">
              <p className="text-sm font-semibold text-white mb-1">{feat.label}</p>
              <p className="text-xs text-slate-500">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
