import {
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  FileText,
  Filter,
  IndianRupee,
  Palette,
  Plus,
  Scissors,
  Search as SearchIcon,
  Settings,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { poReceivedAPI } from "../../Api/firebasePOsReceived";
import currency from "../../Constants/Currency";
import DateFormate from "../../Constants/DateFormate";
import { useLoading } from "../../context/LoadingContext";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

/* ----------------------------- helpers ----------------------------- */

const safeText = (v: any, fallback = "—") =>
  (typeof v === "string" && v.trim().length > 0 ? v : fallback) as string;

const norm = (s?: string) => (s || "").toLowerCase();

function statusTone(status: string) {
  const s = norm(status);
  if (s.includes("paid") || s.includes("completed") || s.includes("approved"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (
    s.includes("pending") ||
    s.includes("process") ||
    s.includes("production")
  )
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (
    s.includes("overdue") ||
    s.includes("failed") ||
    s.includes("rejected") ||
    s.includes("cancel")
  )
    return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function statusIcon(status: string) {
  const s = norm(status);
  if (
    s.includes("pending") ||
    s.includes("process") ||
    s.includes("production")
  )
    return <Clock className="w-4 h-4 text-amber-600" />;
  if (s.includes("completed") || s.includes("paid") || s.includes("approved"))
    return <CheckCircle className="w-4 h-4 text-emerald-600" />;
  if (s.includes("cancel") || s.includes("reject"))
    return <X className="w-4 h-4 text-rose-600" />;
  if (s.includes("in production"))
    return <Settings className="w-4 h-4 text-sky-600" />;
  return <Circle className="w-4 h-4 text-gray-400" />;
}

const pretty = (s?: string) =>
  safeText(s ?? "")
    .replace(/-/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());

/* ----------------------------- component ----------------------------- */

const PoCustomer = () => {
  const navigate = useNavigate();
  const { setLoading } = useLoading();

  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLocalLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentView, setCurrentView] = useState<"list" | "grid">("list");

  useEffect(() => {
    const fetchPOData = async () => {
      setLoading(true);
      setLocalLoading(true);
      try {
        const data: any[] = await poReceivedAPI.getAll();
        setPurchaseOrders(data || []);
      } catch (error) {
        console.error("fetchPOData error:", error);
      } finally {
        setLocalLoading(false);
        setLoading(false);
      }
    };
    fetchPOData();
  }, [setLoading]);

  // Derived stats + filtered list
  const { filteredPOs, stats } = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtered = purchaseOrders.filter((po) => {
      const s = po?.supplier || {};
      const matchesSearch =
        !term ||
        [
          po?.poNo,
          s?.email,
          s?.phone,
          s?.gstNumber || s?.gstNUmber, // tolerate typo in legacy data
          s?.name,
        ]
          .filter(Boolean)
          .some((x: string) => x.toLowerCase().includes(term));

      const statusText = (po?.status ?? po?.paymentStatus ?? "").toString();
      const matchesStatus =
        filterStatus === "all" ||
        statusText.toLowerCase() === filterStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    let pending = 0,
      inProd = 0,
      done = 0,
      cancelled = 0,
      total = 0;

    for (const po of purchaseOrders) {
      const st = norm(po?.status ?? po?.paymentStatus ?? "");
      if (st.includes("cancel")) cancelled++;
      else if (
        st.includes("complete") ||
        st.includes("paid") ||
        st.includes("approved")
      )
        done++;
      else if (st.includes("production") || st.includes("process")) inProd++;
      else pending++;

      total += Number(po?.totalAmount ?? 0);
    }

    return {
      filteredPOs: filtered,
      stats: {
        count: purchaseOrders.length,
        value: total,
        pending,
        inProd,
        done,
        cancelled,
      },
    };
  }, [purchaseOrders, searchTerm, filterStatus]);

  /* ----------------------------- UI pieces ----------------------------- */

  const POCard = ({ po }: { po: any }) => (
    <div
      className="bg-white p-5 rounded-xl cursor-pointer shadow-sm border hover:shadow-md transition-shadow"
      onClick={() => navigate(`/po-given/${po.id}`)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h4 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
            {safeText(po.poNo)}
          </h4>
          <p className="text-sm text-gray-600 mt-0.5 truncate">
            {safeText(po?.supplier?.name, "No supplier")}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium border ${statusTone(
              po?.paymentStatus ?? po?.status
            )}`}
          >
            {pretty(po?.paymentStatus ?? po?.status)}
          </span>
          {statusIcon(po?.paymentStatus ?? po?.status)}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-lg font-semibold text-gray-900">
          {currency(Number(po?.totalAmount ?? 0))}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <span>
            {po?.products?.length ?? 0} style
            {po?.products?.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="text-xs mt-1 line-clamp-1">
          {(po?.products ?? [])
            .slice(0, 2)
            .map(
              (p: any) =>
                `${p?.name ?? p?.styleName ?? "-"}${
                  p?.color ? ` (${p.color})` : ""
                }`
            )
            .join(", ")}
          {(po?.products?.length ?? 0) > 2 &&
            ` +${po.products.length - 2} more`}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 mt-4 border-t">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>PO: {DateFormate(po?.poDate)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Truck className="w-3 h-3" />
          <span>Delivery: {DateFormate(po?.deliveryDate ?? po?.poDate)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              PO Management
            </h1>
          </div>
          <Button onClick={() => navigate("create")} className="shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            New PO Entry
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* Overview */}
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-blue-600 rounded-full" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Production Overview
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-lg border bg-gray-50 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <StatTile
                icon={<FileText className="w-5 h-5 text-gray-500" />}
                label="Total POs"
                value={stats.count}
              />
              <StatTile
                icon={<IndianRupee className="w-5 h-5 text-emerald-600" />}
                label="Total Value"
                value={currency(stats.value)}
                tone="emerald"
              />
              <StatTile
                icon={<Clock className="w-5 h-5 text-amber-600" />}
                label="Pending"
                value={stats.pending}
                tone="amber"
              />
              <StatTile
                icon={<Settings className="w-5 h-5 text-sky-600" />}
                label="In Production"
                value={stats.inProd}
                tone="sky"
              />
              <StatTile
                icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
                label="Completed"
                value={stats.done}
                tone="emeraldSoft"
              />
              <StatTile
                icon={<X className="w-5 h-5 text-rose-600" />}
                label="Cancelled"
                value={stats.cancelled}
                tone="rose"
              />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={currentView === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("grid")}
                className="rounded-md"
              >
                Grid
              </Button>
              <Button
                variant={currentView === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("list")}
                className="rounded-md"
              >
                List
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="relative flex-1 sm:w-80">
                <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search POs, buyers, styles…"
                  className="pl-9"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Production">In Production</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {currentView === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-48 rounded-xl border bg-gray-50 animate-pulse"
                  />
                ))
              : filteredPOs.map((po) => <POCard key={po.id} po={po} />)}

            {!loading && filteredPOs.length === 0 && (
              <EmptyState
                onCreate={() => navigate("create")}
                searchTerm={searchTerm}
              />
            )}
          </div>
        )}

        {/* List View */}
        {currentView === "list" && (
          <div className="rounded-xl border overflow-x-auto bg-white">
            {loading ? (
              <div className="p-6 text-sm text-gray-500">Loading…</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 sticky top-0 z-10 hover:bg-muted/30">
                    <TableHead className="w-[22%] text-gray-700">
                      Purchase Order
                    </TableHead>
                    <TableHead className="w-[26%] text-gray-700">
                      Supplier
                    </TableHead>
                    <TableHead className="w-[18%] text-gray-700">
                      Status
                    </TableHead>
                    <TableHead className="w-[18%] text-gray-700">
                      Styles
                    </TableHead>
                    <TableHead className="w-[16%] text-right text-gray-700">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredPOs.map((po) => (
                    <TableRow
                      key={po.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/po-given/${po.id}`)}
                    >
                      {/* PO */}
                      <TableCell className="align-top">
                        <div className="flex items-center gap-3">
                          {statusIcon(po?.paymentStatus ?? po?.status)}
                          <div>
                            <div className="font-semibold text-gray-900">
                              {safeText(po?.poNo)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {DateFormate(po?.poDate)}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Supplier */}
                      <TableCell className="align-top">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {safeText(po?.supplier?.name)}
                          </div>
                          <div className="text-gray-600">
                            {safeText(po?.supplier?.phone)}
                          </div>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="align-top">
                        <Badge
                          variant="outline"
                          className={`px-3 py-1 rounded-lg text-xs font-medium border ${statusTone(
                            po?.paymentStatus ?? po?.status
                          )}`}
                        >
                          {pretty(po?.paymentStatus ?? po?.status)}
                        </Badge>
                      </TableCell>

                      {/* Styles */}
                      <TableCell className="align-top">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {po?.products?.length ?? 0} style
                            {po?.products?.length === 1 ? "" : "s"}
                          </div>
                          <div className="text-gray-500 text-xs line-clamp-1">
                            {safeText(
                              po?.products?.[0]?.name ??
                                po?.products?.[0]?.styleName
                            )}
                            {(po?.products?.length ?? 0) > 1 &&
                              ` +${po.products.length - 1} more`}
                          </div>
                        </div>
                      </TableCell>

                      {/* Total */}
                      <TableCell className="align-top text-right">
                        <span className="text-base sm:text-lg font-semibold text-gray-900">
                          {currency(Number(po?.totalAmount ?? 0))}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredPOs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className="px-6 py-16">
                          <EmptyState
                            onCreate={() => navigate("create")}
                            searchTerm={searchTerm}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PoCustomer;

/* ----------------------------- small pieces ----------------------------- */

function StatTile({
  icon,
  label,
  value,
  tone = "slate",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tone?: "emerald" | "emeraldSoft" | "amber" | "sky" | "rose" | "slate";
}) {
  const map = {
    slate: "bg-gray-50 border-gray-200",
    emerald: "bg-emerald-50 border-emerald-200",
    emeraldSoft: "bg-emerald-50/60 border-emerald-200",
    amber: "bg-amber-50 border-amber-200",
    sky: "bg-sky-50 border-sky-200",
    rose: "bg-rose-50 border-rose-200",
  } as const;
  return (
    <div className={`p-4 rounded-lg border ${map[tone]}`}>
      <div className="flex items-center justify-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium text-gray-700">{label}</span>
      </div>
      <div className="text-center text-xl font-semibold">{value}</div>
    </div>
  );
}

function EmptyState({
  onCreate,
  searchTerm,
}: {
  onCreate: () => void;
  searchTerm: string;
}) {
  return (
    <div className="text-center">
      <Scissors className="w-14 h-14 text-gray-300 mx-auto mb-4" />
      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
        No purchase orders found
      </h3>
      <p className="text-gray-500 mb-4 text-sm">
        {searchTerm
          ? `No results for “${searchTerm}”. Try adjusting your search.`
          : "Get started by creating your first purchase order."}
      </p>
      {!searchTerm && (
        <Button onClick={onCreate}>
          <Plus className="w-4 h-4 mr-2" />
          New PO Entry
        </Button>
      )}
    </div>
  );
}
