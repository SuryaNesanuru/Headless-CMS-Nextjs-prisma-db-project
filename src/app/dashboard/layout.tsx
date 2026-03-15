import Sidebar from "@/components/layout/Sidebar";
import Providers from "@/components/Providers";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <main className="flex-1 lg:pl-0">
          <div className="p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </Providers>
  );
}
