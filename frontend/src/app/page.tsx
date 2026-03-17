import { DataTable } from "@/components/data-table";
import { Shield, Zap, Database } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-white text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-10">

        {/* Premium Header Header */}
        <header className="flex flex-col md:flex-row shadow-sm bg-white/60 backdrop-blur-xl border border-white/50 p-6 md:p-8 rounded-2xl md:rounded-3xl items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="relative z-10 w-full md:w-auto">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-2 md:mb-3">
              MirTech Assessment
            </h1>
            <p className="text-slate-500 text-base md:text-lg max-w-xl">
              Seamlessly visualizing over{" "}
              <strong className="text-slate-700 font-semibold">100,000+ cached transactions</strong>{" "}
              using native DOM virtualization & Redis caching.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-4 text-xs md:text-sm font-medium w-full md:w-auto mt-2 md:mt-0">
            <div className="flex items-center gap-1.5 md:gap-2 bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 text-slate-600 shrink-0">
              <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500" />
              <span>&lt; 100ms API</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 text-slate-600 shrink-0">
              <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500" />
              <span>60 FPS UI</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 text-slate-600 shrink-0">
              <Database className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
              <span className="hidden sm:inline">Virtualized DOM</span>
              <span className="sm:hidden">Virtual</span>
            </div>
          </div>
        </header>

        {/* Data Table Boundary */}
        <section className="relative group w-full max-w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 rounded-[1.5rem] blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white rounded-2xl md:rounded-[1.5rem] shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 overflow-hidden w-full max-w-full">
            <DataTable />
          </div>
        </section>
      </div>
    </main>
  );
}
