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
  Search,
  Settings,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { poGivenAPI } from "../../Api/firebasePOsGiven";
import DateFormate from "../../Constants/DateFormate";
import { useLoading } from "../../context/LoadingContext";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

/* --------------------------- helpers --------------------------- */

const lc = (v: unknown) => String(v ?? "").toLowerCase();
const curSym = (po: any) => po?.currency?.symbol || "₹";
const curCode = (po: any) => po?.currency?.code || "INR";
const pretty = (s?: string) =>
  String(s ?? "")
    .replace(/-/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());

const statusBadgeClass = (status?: string) => {
  const s = lc(status);
  if (s.includes("paid") || s.includes("completed") || s.includes("approved"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s.includes("pending") || s.includes("production"))
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (
    s.includes("overdue") ||
    s.includes("failed") ||
    s.includes("rejected") ||
    s.includes("cancel")
  )
    return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
};

const getStatusIcon = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return <Clock className="w-4 h-4 text-yellow-600" />;
    case "in production":
      return <Settings className="w-4 h-4 text-blue-600" />;
    case "completed":
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "cancelled":
      return <X className="w-4 h-4 text-red-600" />;
    default:
      return <Circle className="w-4 h-4 text-gray-400" />;
  }
};

const money = (val: unknown, symbol = "₹") => {
  const n = Number(val ?? 0);
  return `${symbol} ${n.toFixed(2)}`;
};

/* ----------------------------- view ---------------------------- */

const PoVendor = () => {
  const { setLoading } = useLoading();
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoadingState] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentView, setCurrentView] = useState<"grid" | "list">("list");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPOData = async () => {
      setLoading(true);
      setLoadingState(true);
      try {
        const data: any[] = await poGivenAPI.getAll();
        console.log("🚀 ~ fetchPOData ~ data:", data);
        setPurchaseOrders(data || []);
      } catch (error) {
        console.error("fetchPOData error:", error);
      } finally {
        setLoading(false);
        setLoadingState(false);
      }
    };
    fetchPOData();
  }, [setLoading]);

  const filteredPOs = useMemo(() => {
    const term = lc(searchTerm);
    return purchaseOrders.filter((po) => {
      const s = po?.supplier || {};
      const matchesSearch =
        lc(po?.poNo).includes(term) ||
        lc(s?.email).includes(term) ||
        lc(s?.phone).includes(term) ||
        lc(s?.gstNumber || s?.gstNUmber).includes(term) || // tolerate typo field
        lc(s?.name).includes(term);

      const matchesStatus =
        filterStatus === "all" || lc(po?.paymentStatus) === lc(filterStatus);
      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, searchTerm, filterStatus]);

  // Stats
  const {
    totalPOs,
    totalValue,
    pendingCount,
    inProductionCount,
    completedCount,
  } = useMemo(() => {
    const totalPOs = purchaseOrders.length;
    const totalValue = purchaseOrders.reduce(
      (sum, po) => sum + Number(po?.totalAmount ?? 0),
      0
    );
    const pendingCount = purchaseOrders.filter(
      (po) => lc(po?.paymentStatus) === "pending"
    ).length;
    const inProductionCount = purchaseOrders.filter(
      (po) => lc(po?.paymentStatus) === "in production"
    ).length;
    const completedCount = purchaseOrders.filter(
      (po) => lc(po?.paymentStatus) === "completed"
    ).length;
    return {
      totalPOs,
      totalValue,
      pendingCount,
      inProductionCount,
      completedCount,
    };
  }, [purchaseOrders]);

  const POCard = ({ po }: { po: any }) => {
    const sym = curSym(po);
    const code = curCode(po);
    return (
      <div
        className="bg-white p-5 rounded-lg cursor-pointer shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
        onClick={() => navigate(po.id)}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h4 className="font-semibold text-gray-900 text-lg">
              {po?.poNo || "—"}
            </h4>
            <div className="mt-1 text-sm text-gray-600">
              {po?.supplier?.name || "—"}
              {po?.currency?.code ? (
                <span className="ml-2 text-xs text-gray-500">· {code}</span>
              ) : null}
            </div>
          </div>
          <div className="">
            <div className="flex  items-end gap-2">
              <Label>Status</Label>
              <Badge
                variant="outline"
                className={`border ${statusBadgeClass(po?.status)}`}
              >
                {pretty(po?.status || "Pending")}
              </Badge>
            </div>
            <div className="flex items-end gap-2">
              <Label>Payment </Label>
              <Badge
                variant="outline"
                className={`border ${statusBadgeClass(po?.paymentStatus)}`}
              >
                {pretty(po?.paymentStatus || "Pending")}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getStatusIcon(po?.paymentStatus)}
            <span className="text-xs text-gray-600">
              {po?.dispatchTrough ? `Dispatch: ${po.dispatchTrough}` : "—"}
            </span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {money(po?.totalAmount, sym)}
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Palette className="w-4 h-4" />
            <span>
              {po?.products?.length || 0} item
              {(po?.products?.length || 0) !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="text-xs line-clamp-2">
            {(po?.products || [])
              .slice(0, 2)
              .map(
                (item: any) =>
                  `${item?.name || item?.styleName || "—"}${
                    item?.color ? ` (${item.color})` : ""
                  }`
              )
              .join(", ")}
            {(po?.products?.length || 0) > 2 &&
              ` +${po.products.length - 2} more`}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>PO: {DateFormate(po?.poDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Truck className="w-3 h-3" />
            <span>Delivery: {DateFormate(po?.deliveryDate)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 sticky top-0 z-40">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              PO Management (Vendor)
            </h1>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none md:w-80">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search PO no., vendor, phone, GST..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm ? (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="px-4 md:px-6 py-6">
        {/* Overview */}
        <div className="bg-white rounded-lg p-4 md:p-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-7 bg-blue-600 rounded-full" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                PO Overview
              </h2>
            </div>
            <div className="text-xs md:text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4">
            <StatCard
              icon={<FileText className="h-5 w-5" />}
              label="Total POs"
              value={totalPOs}
              tone="slate"
            />
            <StatCard
              icon={<IndianRupee className="h-5 w-5" />}
              label="Total Value"
              value={money(totalValue)}
              tone="emerald"
            />
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="Pending"
              value={pendingCount}
              tone="amber"
            />
            <StatCard
              icon={<Settings className="h-5 w-5" />}
              label="In Production"
              value={inProductionCount}
              tone="indigo"
            />
            <StatCard
              icon={<CheckCircle className="h-5 w-5" />}
              label="Completed"
              value={completedCount}
              tone="emerald"
            />
            <StatCard
              icon={<X className="h-5 w-5" />}
              label="Other / Cancelled"
              value={Math.max(
                totalPOs - completedCount - inProductionCount - pendingCount,
                0
              )}
              tone="rose"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentView("grid")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "grid"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setCurrentView("list")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                List View
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Production">In Production</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => navigate("create")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            New PO Entry
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-lg border bg-slate-50 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Grid View */}
        {!loading && currentView === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPOs.map((po) => (
              <POCard key={po.id} po={po} />
            ))}
            {filteredPOs.length === 0 && (
              <EmptyState
                onCreate={() => navigate("create")}
                searchTerm={searchTerm}
              />
            )}
          </div>
        )}

        {/* List View */}
        {!loading && currentView === "list" && (
          <>
            {/* Desktop table */}
            <div className="hidden md:block border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 sticky top-0 z-10 hover:bg-muted/30">
                    <TableHead className="w-[18%] text-gray-700">
                      Purchase Order
                    </TableHead>
                    <TableHead className="w-[20%] text-gray-700">
                      Vendor
                    </TableHead>
                    <TableHead className="w-[18%] text-gray-700">
                      Order Status
                    </TableHead>
                    <TableHead className="w-[18%] text-gray-700">
                      Payment
                    </TableHead>
                    <TableHead className="w-[16%] text-gray-700">
                      Dispatch / Currency
                    </TableHead>
                    <TableHead className="w-[16%] text-gray-700">
                      Items
                    </TableHead>
                    <TableHead className="w-[12%] text-right text-gray-700">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPOs.map((po) => {
                    const sym = curSym(po);
                    return (
                      <TableRow
                        key={po.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(po.id)}
                      >
                        <TableCell className="align-top">
                          <div className="font-semibold text-gray-900">
                            {po?.poNo || "—"}
                          </div>
                          <div className="text-xs text-gray-500">
                            PO: {DateFormate(po?.poDate)} · Delivery:{" "}
                            {DateFormate(po?.deliveryDate)}
                          </div>
                        </TableCell>

                        <TableCell className="align-top">
                          <div className="text-sm text-gray-900">
                            <p className="font-medium">
                              {po?.supplier?.name || "—"}
                            </p>
                            <p className="text-gray-600">
                              {po?.supplier?.phone || "—"}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="align-top">
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="outline"
                              className={`px-2 py-1 rounded-lg text-xs border ${statusBadgeClass(
                                po?.status
                              )}`}
                            >
                              {pretty(po?.status || "Pending")}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="outline"
                              className={`px-2 py-1 rounded-lg text-xs border ${statusBadgeClass(
                                po?.paymentStatus
                              )}`}
                            >
                              {pretty(po?.paymentStatus || "Pending")}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell className="align-top text-sm">
                          <div>{po?.dispatchTrough || "—"}</div>
                          <div className="text-xs text-gray-500">
                            {curCode(po)} {curSym(po)}
                          </div>
                        </TableCell>

                        <TableCell className="align-top">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {po?.products?.length || 0} item
                              {(po?.products?.length || 0) !== 1 ? "s" : ""}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {po?.products?.[0]?.name ||
                                po?.products?.[0]?.styleName ||
                                "—"}
                              {(po?.products?.length || 0) > 1 &&
                                ` +${po.products.length - 1} more`}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="align-top text-right">
                          <span className="text-lg font-semibold text-gray-900">
                            {money(Number(po?.totalAmount ?? 0), sym)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {filteredPOs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className="px-6 py-16 text-center">
                          <Scissors className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No purchase orders found
                          </h3>
                          <p className="text-gray-500 mb-4">
                            {searchTerm
                              ? `No results for "${searchTerm}". Try adjusting your search.`
                              : "Get started by creating your first purchase order."}
                          </p>
                          {!searchTerm && (
                            <Button onClick={() => navigate("create")}>
                              New PO Entry
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {filteredPOs.map((po) => (
                <POCard key={po.id} po={po} />
              ))}
              {filteredPOs.length === 0 && (
                <EmptyState
                  onCreate={() => navigate("create")}
                  searchTerm={searchTerm}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PoVendor;

/* --------------------------- minis --------------------------- */

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
    <div className={`rounded-lg border p-4 ${map[tone]}`}>
      <div className="flex items-center gap-3">
        <div className="shrink-0">{icon}</div>
        <div>
          <div className="text-xs font-medium opacity-80">{label}</div>
          <div className="text-lg font-semibold">{value}</div>
        </div>
      </div>
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
    <div className="col-span-full text-center py-16">
      <Scissors className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No purchase orders found
      </h3>
      <p className="text-gray-500 mb-4">
        {searchTerm
          ? `No results for "${searchTerm}". Try adjusting your search.`
          : "Get started by creating your first purchase order."}
      </p>
      {!searchTerm && (
        <button
          onClick={onCreate}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          New PO Entry
        </button>
      )}
    </div>
  );
}
