"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import axios from "axios";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, FilterX, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export type Transaction = {
  id: number;
  user_id: number;
  product_name: string;
  category: string;
  amount: number;
  status: string;
  is_fraudulent: boolean;
  created_at: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function DataTable() {
  const router = useRouter();

  // State
  const [data, setData] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);

  // Infinite Scroll Pagination State
  const [page, setPage] = useState(1);
  const limit = 100;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== debouncedSearch) {
        setDebouncedSearch(search);
        setPage(1); // Reset to page 1 on new search
        setData([]); // Clear data to show loading feeling
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [search, debouncedSearch]);

  // Fetch data
  const fetchData = useCallback(
    async (currentPage: number, currentSearch: string, currentSort: SortingState, currentCategory: string, currentStatus: string) => {
      setLoading(true);
      try {
        const sortParam = currentSort.length > 0 ? currentSort[0].id : "created_at";
        const descParam = currentSort.length > 0 ? currentSort[0].desc : true;

        const res = await axios.get(`${API_BASE}/api/transactions`, {
          params: {
            page: currentPage,
            limit,
            search: currentSearch || undefined,
            sort_by: sortParam,
            sort_desc: descParam,
            category: currentCategory || undefined,
            status: currentStatus || undefined,
          },
        });

        if (currentPage === 1) {
          setData(res.data.data);
        } else {
          setData((prev) => [...prev, ...res.data.data]);
        }
        setTotalCount(res.data.total);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial load and dependency triggers
  useEffect(() => {
    fetchData(page, debouncedSearch, sorting, categoryFilter, statusFilter);
  }, [page, debouncedSearch, sorting, categoryFilter, statusFilter, fetchData]);

  // Handle sorting changes properly
  const handleSortingChange = (updater: import("@tanstack/react-table").Updater<SortingState>) => {
    setSorting(updater);
    setPage(1);
    setData([]);
  };

  // Handle filter changes
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setPage(1);
    setData([]);
  };

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 100,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            #{row.getValue("id")}
          </span>
        ),
      },
      {
        accessorKey: "product_name",
        header: "Product Detail",
        size: 380,
        cell: ({ row }) => (
          <div className="flex flex-col max-w-[340px]">
            <span className="font-bold text-slate-900 truncate">
              {row.getValue("product_name")}
            </span>
            <span className="text-xs text-slate-400 font-medium truncate mt-0.5">
              Ref: UX-{row.original.user_id}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        size: 180,
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center px-4 py-1.5 min-w-[110px] rounded-full text-xs font-bold bg-white border border-slate-200 shadow-sm text-slate-700">
            {row.getValue("category")}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: "Net Amount",
        size: 160,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("amount"));
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(amount);
          return (
            <div className="font-extrabold text-slate-900 tabular-nums tracking-tight">
              {formatted}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Current State",
        size: 160,
        cell: ({ row }) => {
          const status = String(row.getValue("status"));
          return (
            <span
              className={cn(
                "inline-flex items-center justify-center px-4 py-1.5 min-w-[110px] rounded-full text-xs font-bold capitalize shadow-sm border",
                status === "completed" && "bg-emerald-50 text-emerald-700 border-emerald-200/50 shadow-emerald-100",
                status === "pending" && "bg-amber-50 text-amber-700 border-amber-200/50 shadow-amber-100",
                status === "failed" && "bg-rose-50 text-rose-700 border-rose-200/50 shadow-rose-100"
              )}
            >
              <span className={cn(
                "w-1.5 h-1.5 rounded-full mr-2 shrink-0",
                status === "completed" && "bg-emerald-500",
                status === "pending" && "bg-amber-500",
                status === "failed" && "bg-rose-500"
              )}></span>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Timestamp",
        size: 220,
        cell: ({ row }) => {
          return (
            <span className="text-sm font-medium text-slate-500">
              {new Date(row.getValue("created_at")).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  // Virtualization setup
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Row height
    overscan: 20,
  });

  // Infinite scroll detection
  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;

    const handleScroll = () => {
      const scrollBottom =
        parent.scrollHeight - parent.scrollTop - parent.clientHeight;
      if (scrollBottom < 200 && !loading && data.length < totalCount) {
        setPage((prev) => prev + 1);
      }
    };

    parent.addEventListener("scroll", handleScroll);
    return () => parent.removeEventListener("scroll", handleScroll);
  }, [loading, data.length, totalCount]);

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[500px] w-full bg-white/40 backdrop-blur-2xl rounded-2xl md:rounded-[1.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden text-slate-900 group-hover:border-blue-200/80 transition-colors duration-500 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>

      {/* Premium Search Header */}
      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 md:p-6 border-b border-slate-200/60 bg-white/60 z-10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] gap-4">
        <div className="relative w-full sm:max-w-md group/search shrink-0">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-md opacity-0 group-focus-within/search:opacity-20 transition duration-500"></div>
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 md:left-5 md:w-5 md:h-5 text-slate-400 group-focus-within/search:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 md:pl-14 md:pr-5 py-3 md:py-3.5 text-sm font-semibold bg-white border border-slate-200/80 rounded-xl md:rounded-2xl outline-none focus:border-transparent focus:ring-0 shadow-sm transition-all text-slate-800 placeholder:text-slate-400 focus:shadow-[0_4px_20px_-5px_rgba(6,81,237,0.15)]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-4 shrink-0">

          {loading && (
            <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-50/80 backdrop-blur-md rounded-lg md:rounded-xl border border-blue-100/50 shadow-sm">
              <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin text-blue-600" />
              <span className="text-[10px] md:text-xs font-bold text-blue-700 uppercase tracking-widest hidden sm:inline">Syncing Data</span>
              <span className="text-[10px] md:text-xs font-bold text-blue-700 uppercase tracking-widest sm:hidden">Sync</span>
            </div>
          )}

          {/* Faceted Filters */}
          <div className="flex items-center gap-2 mr-2">
            <div className="relative group/select">
              <select
                value={categoryFilter}
                onChange={(e) => handleFilterChange(setCategoryFilter, e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/60 text-xs font-bold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 cursor-pointer transition-all hover:bg-white"
              >
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Home">Home</option>
                <option value="Toys">Toys</option>
                <option value="Books">Books</option>
                <option value="Beauty">Beauty</option>
                <option value="Sports">Sports</option>
                <option value="Automotive">Automotive</option>
                <option value="Health">Health</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover/select:text-slate-600" />
            </div>

            <div className="relative group/select">
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/60 text-xs font-bold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 cursor-pointer transition-all hover:bg-white"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover/select:text-slate-600" />
            </div>

            {(categoryFilter || statusFilter || search) && (
              <button
                onClick={() => {
                  setSearch("");
                  setDebouncedSearch("");
                  handleFilterChange(setCategoryFilter, "");
                  handleFilterChange(setStatusFilter, "");
                }}
                className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100/50 shadow-sm hover:bg-rose-100 transition-colors tooltip items-center justify-center flex"
                title="Clear all filters"
              >
                <FilterX className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="px-3 md:px-5 py-2 md:py-2.5 bg-white/80 backdrop-blur-md rounded-lg md:rounded-xl border border-slate-200/60 text-xs md:text-sm font-medium text-slate-500 shadow-sm flex items-center gap-2">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
            <span className="truncate max-w-[120px] md:max-w-none"><span className="text-slate-900 font-extrabold">{totalCount.toLocaleString()}</span> <span className="hidden sm:inline">Matches</span></span>
          </div>
        </div>
      </div>

      {/* Table Container for Virtualization */}
      <div
        ref={parentRef}
        className="flex-1 overflow-x-auto overflow-y-auto relative rounded-b-2xl md:rounded-b-[1.5rem] custom-scrollbar bg-slate-50/20 z-0 w-full"
      >
        <div className="min-w-[1000px] w-full text-sm text-left">
          {/* Header */}
          <div className="sticky top-0 z-30 flex w-full bg-white border-b border-slate-200/80 shadow-sm min-w-[1000px]">
            {table.getHeaderGroups().map((headerGroup) => (
              <div key={headerGroup.id} className="flex w-full">
                {headerGroup.headers.map((header) => {
                  const size = header.column.getSize();
                  const canSort = header.column.getCanSort();
                  const getSortDir = header.column.getIsSorted();

                  return (
                    <div
                      key={header.id}
                      style={{
                        width: size,
                        flex: `${size} 0 ${size}px`
                      }}
                      className={cn(
                        "px-8 py-5 flex-shrink-0 select-none whitespace-nowrap text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center",
                        canSort && "cursor-pointer hover:bg-slate-100/80 hover:text-slate-900 transition-colors"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-3 group/header w-full">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {canSort && (
                          <div className={cn(
                            "flex flex-col opacity-0 group-hover/header:opacity-50 transition-[opacity_transform] group-hover/header:-translate-y-px",
                            getSortDir && "opacity-100 group-hover/header:opacity-100 -translate-y-px"
                          )}>

                            {{
                              asc: <ArrowUp className="w-4 h-4 text-blue-600 drop-shadow-sm" />,
                              desc: <ArrowDown className="w-4 h-4 text-blue-600 drop-shadow-sm" />,
                            }[getSortDir as string] ?? <ArrowUpDown className="w-4 h-4" />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Body */}
          <div
            className="relative w-full"
            style={{
              height: `${virtualizer.getTotalSize()}px`,
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = table.getRowModel().rows[virtualRow.index];
              return (
                <div
                  key={row.id}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className="absolute left-0 top-0 flex w-full border-b border-slate-100/60 hover:bg-white transition-all cursor-pointer group hover:shadow-[0_8px_30px_-12px_rgba(6,81,237,0.2)] hover:-translate-y-[1px] z-10 hover:z-20 bg-transparent"
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  onClick={() => router.push(`/items/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => {
                    const size = cell.column.getSize();
                    return (
                      <div
                        key={cell.id}
                        className="px-8 py-5 flex-shrink-0 flex items-center whitespace-nowrap font-medium text-slate-600 group-hover:text-slate-900 transition-colors truncate"
                        style={{
                          width: size,
                          flex: `${size} 0 ${size}px`
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* States Area (Loading, Empty, Error) */}
        {!loading && data.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10 transition-all duration-500">
            <div className="bg-white p-10 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center max-w-md ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[1.5rem] flex items-center justify-center mb-6 text-blue-600 shadow-inner">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No Matches Found</h3>
              <p className="text-slate-500 leading-relaxed text-base font-medium">We combed through all {totalCount.toLocaleString()} records but couldn't find any transactions matching your parameters.</p>
            </div>
          </div>
        )}

        {loading && data.length === 0 && (
          <div className="absolute inset-0 flex flex-col bg-white/90 backdrop-blur-sm z-20">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="flex px-8 py-5 border-b border-slate-100/60 w-full animate-pulse">
                <div className="w-[100px] shrink-0 pr-4"><div className="h-4 w-12 bg-slate-200 rounded-md"></div></div>
                <div className="w-[380px] shrink-0 pr-4"><div className="h-4 w-48 bg-slate-200 rounded-md mb-2"></div><div className="h-3 w-32 bg-slate-100 rounded-md"></div></div>
                <div className="w-[180px] shrink-0 pr-4"><div className="h-6 w-24 bg-slate-200 rounded-xl"></div></div>
                <div className="w-[160px] shrink-0 pr-4"><div className="h-5 w-20 bg-slate-200 rounded-md"></div></div>
                <div className="w-[160px] shrink-0 pr-4"><div className="h-6 w-24 bg-slate-200 rounded-full"></div></div>
                <div className="w-[220px] shrink-0 pr-4"><div className="h-4 w-32 bg-slate-200 rounded-md"></div></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
