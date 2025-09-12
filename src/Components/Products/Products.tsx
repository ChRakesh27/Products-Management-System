import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productsAPI } from "../../Api/firebaseProducts";
import currency from "../../Constants/Currency";
import type { ProductModel } from "../../Model/ProductModel";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import {
  CheckCircle2,
  Clock,
  Cog,
  FileText,
  IndianRupee,
  PackageSearch,
  Plus,
} from "lucide-react";

/* ----------------------------- helpers ----------------------------- */
const toNum = (v: unknown) => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

// compute estimated price from product fields
function estimatePrice(p: ProductModel) {
  const raw = toNum(p.totalRawAmount);
  const transport = toNum(p.transport);
  const misc = toNum(p.miscellaneous);
  const wastagePct = toNum(p.wastage);
  const marginPct = toNum(p.margin);

  const wastageVal = raw * (wastagePct / 100);
  const base = raw + transport + misc + wastageVal;
  const marginVal = raw * (marginPct / 100);
  return base + marginVal; // suggested price
}

const prettyStatus = (s?: string) =>
  (s ?? "—").replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

// map status -> badge tone
function statusBadgeClass(status?: string) {
  const s = (status || "").toLowerCase();
  if (["pending", "on-hold"].includes(s))
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (["in production", "processing"].includes(s))
    return "bg-sky-50 text-sky-700 border-sky-200";
  if (["completed", "approved", "active"].includes(s))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (["cancelled", "canceled", "archived"].includes(s))
    return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

/* ------------------------------ component ------------------------------ */
export default function ProductList() {
  const navigate = useNavigate();
  const [list, setList] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const items = await productsAPI.list();
      setList(items);
      setLoading(false);
    })();
  }, []);

  // Overview stats like the PO page
  const stats = useMemo(() => {
    const total = list.length;
    const totalValue = list.reduce((acc, p) => acc + estimatePrice(p), 0);

    const by = (label: string) =>
      list.filter((p) => (p.status || "").toLowerCase() === label).length;

    return {
      total,
      totalValue,
      pending: by("on-hold"),
      approved: by("approved"),
      rejected: by("rejected"),
    };
  }, [list]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return list.filter((p) => {
      const matchesTerm =
        !term ||
        [p.name, p.color, p.size, p.unitType]
          .filter(Boolean)
          .some((x) => String(x).toLowerCase().includes(term));

      return matchesTerm;
    });
  }, [list, searchTerm]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <PackageSearch className="h-6 w-6" /> Product Management
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products, color, size…"
              className="pl-8 w-[260px] "
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-2 top-3 h-4 w-4 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <Button onClick={() => navigate("/products/new")}>
            <Plus className=" h-4 w-4" />
            Product
          </Button>
        </div>
      </div>

      {/* Overview tiles */}
      <Card className="overflow-hidden">
        <CardHeader className="py-3">
          <CardTitle className="text-base">Production Overview</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard
              icon={<FileText className="h-5 w-5" />}
              label="Total Products"
              value={stats.total}
            />
            <StatCard
              icon={<IndianRupee className="h-5 w-5" />}
              label="Total Est. Value"
              value={currency(stats.totalValue)}
              tone="emerald"
            />
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="On-Hold"
              value={stats.pending}
              tone="amber"
            />
            <StatCard
              icon={<Cog className="h-5 w-5" />}
              label="Approved"
              value={stats.approved}
              tone="indigo"
            />
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="Rejected"
              value={stats.rejected}
              tone="rose"
            />
          </div>
        </CardContent>
      </Card>

      <div className="border rounded-md overflow-x-auto">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-[20%]">Product</TableHead>
                <TableHead className="w-[10%]">Unq Id</TableHead>
                <TableHead className="w-[14%]">Size</TableHead>
                <TableHead className="w-[14%]">Color</TableHead>
                <TableHead className="w-[16%]">Status</TableHead>
                <TableHead className="w-[14%]">Materials</TableHead>
                <TableHead className="w-[10%] text-right">Est. Price</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((p) => {
                const est = estimatePrice(p);
                const rmCount = p.rawMaterials?.length ?? 0;
                return (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer hover:bg-muted/20"
                    onClick={() => navigate(`/products/${p.id}`)}
                  >
                    {/* Product */}
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <div>
                          <div className="font-semibold text-gray-900">
                            {p.name}
                          </div>
                          {p.description ? (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {p.description}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="align-top">{p.uid || "-"}</TableCell>
                    {/* Size */}
                    <TableCell className="align-top">{p.size || "-"}</TableCell>

                    {/* Color */}
                    <TableCell className="align-top">
                      {p.color || "-"}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="align-top">
                      <Badge
                        variant="outline"
                        className={`px-3 py-1 rounded-lg text-xs font-medium border ${statusBadgeClass(
                          p.status
                        )}`}
                      >
                        {prettyStatus(p.status)}
                      </Badge>
                    </TableCell>

                    {/* Materials summary */}
                    <TableCell className="align-top">
                      {rmCount} material{rmCount !== 1 ? "s" : ""}
                    </TableCell>

                    {/* Est. Price */}
                    <TableCell className="align-top text-right">
                      <span className="text-lg font-semibold text-gray-900">
                        {currency(est)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}

              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No products found
                    {searchTerm ? ` for “${searchTerm}”` : ""}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

/* --- small stat card --- */
function StatCard({
  icon,
  label,
  value,
  tone = "slate",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tone?: "emerald" | "indigo" | "amber" | "rose" | "slate";
}) {
  const map = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    rose: "bg-rose-50 border-rose-200 text-rose-800",
    slate: "bg-slate-50 border-slate-200 text-slate-800",
  } as const;
  return (
    <div className={`rounded-lg border  p-4 ${map[tone]}`}>
      <div className="flex items-center gap-3">
        <div className="shrink-0">{icon}</div>
        <div>
          <div className="text-xs font-medium opacity-80">{label}</div>
          <div className="sm:text-lg text-sm font-semibold">{value}</div>
        </div>
      </div>
    </div>
  );
}
