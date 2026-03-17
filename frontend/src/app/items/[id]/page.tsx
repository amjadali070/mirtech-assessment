"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Box, Calendar, AlertCircle, Shield } from "lucide-react";
import { Transaction } from "@/components/data-table";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ItemDetail() {
  const { id } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    axios.get(`${API_BASE}/api/transactions/${id}`)
      .then(res => setData(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-white p-4 md:p-8 font-sans relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-8 relative z-10 animate-pulse">
          <div className="w-32 h-10 bg-slate-200/60 rounded-xl mb-8"></div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden relative p-8 md:p-12">
            <div className="flex justify-between gap-6 mb-10">
              <div>
                <div className="h-4 w-32 bg-slate-200/80 rounded-md mb-3"></div>
                <div className="h-10 w-96 bg-slate-200 rounded-xl"></div>
              </div>
              <div className="h-10 w-32 bg-slate-200 rounded-2xl"></div>
            </div>
            
            <div className="bg-slate-100 rounded-3xl p-8 md:p-10 mb-12 h-48 w-full"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 h-28 rounded-3xl border border-slate-100"></div>
              <div className="bg-slate-50 h-28 rounded-3xl border border-slate-100"></div>
              <div className="bg-slate-50 h-28 rounded-3xl border border-slate-100"></div>
              <div className="bg-slate-50 h-28 rounded-3xl border border-slate-100"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-800">Transaction Not Found</h2>
          <button onClick={() => router.back()} className="text-blue-600 hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const amountFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(data.amount);

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-white p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white backdrop-blur-md rounded-xl text-slate-500 hover:text-blue-600 transition-all shadow-sm border border-slate-200/50 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Grid
        </button>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
          
          <div className="p-6 md:p-12 relative z-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6 mb-8 md:mb-10">
              <div>
                <p className="text-blue-600 font-mono text-xs md:text-sm font-semibold tracking-wider mb-2 md:mb-3 uppercase">Transaction #{data.id}</p>
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">{data.product_name}</h1>
              </div>
              <div className="shrink-0 flex self-start md:self-auto">
                <span
                  className={cn(
                    "inline-flex items-center justify-center px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold capitalize shadow-sm border",
                    data.status === "completed" && "bg-emerald-50 text-emerald-700 border-emerald-200/50 shadow-emerald-100",
                    data.status === "pending" && "bg-amber-50 text-amber-700 border-amber-200/50 shadow-amber-100",
                    data.status === "failed" && "bg-rose-50 text-rose-700 border-rose-200/50 shadow-rose-100"
                  )}
                >
                  <div className={cn(
                    "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-2",
                    data.status === "completed" && "bg-emerald-500",
                    data.status === "pending" && "bg-amber-500",
                    data.status === "failed" && "bg-rose-500"
                  )}></div>
                  {data.status}
                </span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl md:rounded-3xl p-6 md:p-10 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden mb-8 md:mb-12">
              <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              <p className="text-slate-400 font-medium text-sm md:text-base mb-1 md:mb-2">Total Amount</p>
              <div className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
                {amountFormatted}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50/50 group hover:bg-white transition-colors p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-blue-100/50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <CreditCard className="w-6 h-6"/>
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">User Identifier</p>
                  <p className="font-bold text-xl text-slate-800">{data.user_id}</p>
                </div>
              </div>

              <div className="bg-slate-50/50 group hover:bg-white transition-colors p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-indigo-100/50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Box className="w-6 h-6"/>
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Product Category</p>
                  <p className="font-bold text-xl text-slate-800">{data.category}</p>
                </div>
              </div>

              <div className="bg-slate-50/50 group hover:bg-white transition-colors p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-purple-100/50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Calendar className="w-6 h-6"/>
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Timestamp</p>
                  <p className="font-bold text-lg text-slate-800">{new Date(data.created_at).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}</p>
                </div>
              </div>

              <div className={cn(
                "group transition-colors p-6 rounded-3xl border shadow-sm flex items-start gap-4",
                data.is_fraudulent 
                  ? "bg-rose-50/50 hover:bg-rose-50 border-rose-100" 
                  : "bg-emerald-50/50 hover:bg-emerald-50 border-emerald-100"
              )}>
                <div className={cn(
                  "p-3 rounded-2xl transition-colors",
                  data.is_fraudulent 
                    ? "bg-rose-100/50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white" 
                    : "bg-emerald-100/50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white"
                )}>
                  <Shield className="w-6 h-6"/>
                </div>
                <div>
                  <p className={cn("text-sm font-medium mb-1", data.is_fraudulent ? "text-rose-600/70" : "text-emerald-600/70")}>Security Analysis</p>
                  <p className={cn(
                    "font-bold text-xl",
                    data.is_fraudulent ? "text-rose-700" : "text-emerald-700"
                  )}>
                    {data.is_fraudulent ? "Flagged as Risk" : "Verified Safe"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
