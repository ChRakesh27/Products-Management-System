import {
  BarChart3,
  Calendar,
  CheckCircle,
  CheckCircle2,
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
  ShoppingCart,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { poGivenAPI } from "../../Api/firebasePOsGiven";
import currency from "../../Constants/Currency";
import DateFormate from "../../Constants/DateFormate";
import { useLoading } from "../../context/LoadingContext";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
  const { totalPOs, totalValue, pendingCount, receivedCount } = useMemo(() => {
    const totalPOs = purchaseOrders.length;
    const totalValue = purchaseOrders.reduce(
      (sum, po) => sum + Number(po?.totalAmount ?? 0),
      0
    );
    const pendingCount = purchaseOrders.filter(
      (po) => lc(po?.status) === "pending"
    ).length;
    const receivedCount = purchaseOrders.filter(
      (po) => lc(po?.status) === "received"
    ).length;

    return {
      totalPOs,
      totalValue,
      pendingCount,
      receivedCount,
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

      <div className="border-b border-gray-100 bg-white px-3 sticky top-0 z-40 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              PO Management (Vendor)
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search po, ..."
                className="pl-10 pr-4 py-2.5 w-full sm:w-[280px] border-gray-300 focus:border-slate-400 focus:ring-slate-400 rounded-lg"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button
              onClick={() => navigate("create")}
              className="bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-6 py-2.5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add PO Vendor
            </Button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="p-0">
        {/* Overview */}
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <StatCard
              icon={<FileText className="h-5 w-5" />}
              label="Total PO's"
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
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="Received"
              value={receivedCount}
              tone="blue"
            />
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className=" flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
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
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Received">Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                    <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                      <TableHead className="w-[18%] font-semibold text-gray-900 px-6">
                        Purchase Order
                      </TableHead>
                      <TableHead className="w-[20%] font-semibold text-gray-900 px-6">
                        Vendor
                      </TableHead>
                      <TableHead className="w-[18%] font-semibold text-gray-900 px-6">
                        Order Status
                      </TableHead>
                      <TableHead className="w-[18%] font-semibold text-gray-900 px-6">
                        Payment
                      </TableHead>
                      <TableHead className="w-[16%] font-semibold text-gray-900 px-6">
                        Dispatch
                      </TableHead>
                      <TableHead className="w-[16%] font-semibold text-gray-900 px-6">
                        Items
                      </TableHead>
                      <TableHead className="w-[12%] text-right font-semibold text-gray-900 px-6">
                        Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPOs.map((po) => {
                      return (
                        <TableRow
                          key={po.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => navigate(po.id)}
                        >
                          <TableCell className="align-top font-semibold text-gray-900 px-6">
                            <div className="font-semibold text-gray-900">
                              {po?.poNo || "—"}
                            </div>
                            <div className="text-xs text-gray-500">
                              PO: {DateFormate(po?.poDate)} · Delivery:{" "}
                              {DateFormate(po?.deliveryDate)}
                            </div>
                          </TableCell>

                          <TableCell className="align-top font-semibold text-gray-900 px-6">
                            <div className="text-sm text-gray-900">
                              <p className="font-medium">
                                {po?.supplier?.name || "—"}
                              </p>
                              <p className="text-gray-600">
                                {po?.supplier?.phone || "—"}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell className="align-top font-semibold text-gray-900 px-6">
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
                          <TableCell className="align-top font-semibold text-gray-900 px-6">
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

                          <TableCell className="align-top font-semibold text-gray-900 px-6 text-sm">
                            <div>{po?.dispatchTrough || "—"}</div>
                          </TableCell>

                          <TableCell className="align-top font-semibold text-gray-900 px-6">
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

                          <TableCell className="align-top font-semibold text-gray-900 px-6 text-right">
                            <span className="text-lg font-semibold text-gray-900">
                              {currency(
                                Number(po?.totalAmount ?? 0),
                                po?.currency?.code
                              )}
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
  tone?: "emerald" | "blue" | "amber" | "red" | "slate";
}) {
  const colorMap = {
    slate: "bg-slate-100 text-slate-800 border-slate-200",
    emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    red: "bg-red-100 text-red-800 border-red-200",
  } as const;
  const iconColorMap = {
    slate: "bg-slate-600",
    emerald: "bg-emerald-600",
    amber: "bg-amber-600",
    blue: "bg-blue-600",
    red: "bg-red-600",
  } as const;
  return (
    <div
      className={`rounded-lg border p-4 transition-all duration-200 hover:shadow-sm ${colorMap[tone]}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`shrink-0 p-2 ${iconColorMap[tone]} rounded-lg text-white`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium opacity-80 uppercase tracking-wider">
            {label}
          </div>
          <div className="text-lg sm:text-xl font-bold mt-1 truncate">
            {value}
          </div>
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
