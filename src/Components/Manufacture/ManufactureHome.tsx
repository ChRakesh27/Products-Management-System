// src/components/manufactures/ManufactureList.tsx
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Factory,
  Pencil,
  PlayCircle,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { manufacturesAPI } from "../../Api/firebaseManufacture";
import DateFormate from "../../Constants/DateFormate";
import type { ManufactureModel } from "../../Model/DailyProductionModel";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ToastMSG from "../ui/Toaster";

// Helper function to determine status based on dates
function getManufactureStatus(startDate: any, endDate: any) {
  try {
    const now = new Date();
    const start = startDate?.toDate?.() || new Date(startDate);
    const end = endDate?.toDate?.() || new Date(endDate);

    if (now < start) return "pending";
    if (now >= start && now <= end) return "in-progress";
    if (now > end) return "completed";
    return "unknown";
  } catch {
    return "unknown";
  }
}

// Status badge styling
function getStatusBadgeClass(status: string) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
    case "in-progress":
      return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "pending":
      return <Clock className="h-3 w-3" />;
    case "in-progress":
      return <PlayCircle className="h-3 w-3" />;
    case "completed":
      return <CheckCircle2 className="h-3 w-3" />;
    default:
      return <AlertCircle className="h-3 w-3" />;
  }
}

function prettyStatus(status: string) {
  switch (status) {
    case "pending":
      return "Pending";
    case "in-progress":
      return "In Progress";
    case "completed":
      return "Completed";
    default:
      return "Unknown";
  }
}

// Classic manufacture indicators
const getManufactureIndicator = (index: number) => {
  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-pink-500",
  ];
  return colors[index % colors.length];
};

export default function ManufactureHome() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ManufactureModel[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const list = await manufacturesAPI.getAll();
      console.log("🚀 ~ load ~ list:", list);
      setRows(list ?? []);
    } catch (e) {
      console.error(e);
      ToastMSG?.("error", "Failed to load manufactures");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Overview stats
  const stats = useMemo(() => {
    const total = rows.length;
    const statuses = rows.map((r) =>
      getManufactureStatus(r.startDate, r.endDate)
    );
    const pending = statuses.filter((s) => s === "pending").length;
    const inProgress = statuses.filter((s) => s === "in-progress").length;
    const completed = statuses.filter((s) => s === "completed").length;

    return {
      total,
      pending,
      inProgress,
      completed,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) =>
      [r.remarks, r.poNo].some((f) => (f ?? "").toLowerCase().includes(term))
    );
  }, [rows, q]);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this manufacture?")) return;
    try {
      await manufacturesAPI.delete(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      ToastMSG?.("success", "Deleted");
    } catch (e) {
      console.error(e);
      ToastMSG?.("error", "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-100 bg-white px-3 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 rounded-lg">
                <Factory className="h-6 w-6 text-white" />
              </div>
              Work Orders
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by PO or remarks..."
                className="pl-10 pr-4 py-2.5 w-full sm:w-[280px] border-gray-300 focus:border-slate-400 focus:ring-slate-400 rounded-lg"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate("/manufactures/new")}
                className="bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-6 py-2.5"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Order
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-0">
        {/* Stats Section */}
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<ClipboardList className="h-5 w-5" />}
              label="Total Orders"
              value={stats.total}
              color="slate"
            />
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="Pending"
              value={stats.pending}
              color="amber"
            />
            <StatCard
              icon={<PlayCircle className="h-5 w-5" />}
              label="In Progress"
              value={stats.inProgress}
              color="blue"
            />
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="Completed"
              value={stats.completed}
              color="emerald"
            />
          </div>
        </div>

        {/* Manufactures Section */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-6">
            <Factory className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">
              Manufacturing Orders ({filtered.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
              <span className="ml-3 text-gray-600">Loading orders...</span>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-4">
                {filtered.map((r, index) => {
                  const status = getManufactureStatus(r.startDate, r.endDate);
                  return (
                    <Card
                      key={r.id}
                      className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300"
                      onClick={() => navigate(`/manufactures/${r.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${getManufactureIndicator(
                              index
                            )} flex-shrink-0 mt-2`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  PO: {r.poNo || "No PO"}
                                </h4>
                              </div>
                              <Badge
                                variant="outline"
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${getStatusBadgeClass(
                                  status
                                )} flex items-center gap-1`}
                              >
                                {getStatusIcon(status)}
                                {prettyStatus(status)}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                                <Calendar className="h-3 w-3" />
                                Start: {DateFormate(r.startDate)}
                              </div>
                              <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md border border-purple-200">
                                <Calendar className="h-3 w-3" />
                                End: {DateFormate(r.endDate)}
                              </div>
                            </div>

                            {r.remarks && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                {r.remarks}
                              </p>
                            )}

                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/manufactures/${r.id}/edit`);
                                }}
                                className="border-gray-300 hover:border-gray-400"
                              >
                                <Pencil className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(r.id);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-hidden rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                      <TableHead className="font-semibold text-gray-900 px-6">
                        PO Number
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 px-4">
                        Start Date
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 px-4">
                        End Date
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 px-4">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 px-4">
                        Remarks
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 px-6 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filtered.map((r, index) => {
                      const status = getManufactureStatus(
                        r.startDate,
                        r.endDate
                      );
                      return (
                        <TableRow
                          key={r.id}
                          className="cursor-pointer hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                          onClick={() => navigate(`/manufactures/${r.id}`)}
                        >
                          <TableCell className=" px-6">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-3 h-3 rounded-full ${getManufactureIndicator(
                                  index
                                )} flex-shrink-0`}
                              />
                              <div className="font-semibold text-gray-900">
                                {r.poNo || "-"}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className=" px-4">
                            <div className="flex items-center gap-1 text-sm text-gray-700">
                              <Calendar className="h-3 w-3 text-gray-500" />
                              {DateFormate(r.startDate)}
                            </div>
                          </TableCell>

                          <TableCell className=" px-4">
                            <div className="flex items-center gap-1 text-sm text-gray-700">
                              <Calendar className="h-3 w-3 text-gray-500" />
                              {DateFormate(r.endDate)}
                            </div>
                          </TableCell>

                          <TableCell className=" px-4">
                            <Badge
                              variant="outline"
                              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${getStatusBadgeClass(
                                status
                              )} flex items-center gap-1 w-fit`}
                            >
                              {getStatusIcon(status)}
                              {prettyStatus(status)}
                            </Badge>
                          </TableCell>

                          <TableCell className=" px-4 max-w-[300px]">
                            <span className="text-sm text-gray-700 truncate block">
                              {r.remarks || "-"}
                            </span>
                          </TableCell>

                          <TableCell className=" px-6">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/manufactures/${r.id}/edit`);
                                }}
                                className="border-gray-300 hover:border-gray-400"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(r.id);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {!loading && filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-6 bg-gray-100 rounded-full">
                              <Factory className="h-12 w-12 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-gray-900">
                                No manufacturing orders found
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {q
                                  ? `No results for "${q}"`
                                  : "Get started by creating your first manufacturing order"}
                              </p>
                            </div>
                            {!q && (
                              <Button
                                onClick={() => navigate("/manufactures/new")}
                                className="mt-2 bg-slate-900 hover:bg-slate-800"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Order
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* --- Classic stat card --- */
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  color: "slate" | "emerald" | "amber" | "blue" | "red";
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
      className={`rounded-lg border p-4 transition-all duration-200 hover:shadow-sm ${colorMap[color]}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`shrink-0 p-2 ${iconColorMap[color]} rounded-lg text-white`}
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
