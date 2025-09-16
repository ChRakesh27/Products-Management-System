import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { rawMaterialsAPI } from "../../Api/firebaseRawMaterial";
import currency from "../../Constants/Currency";
import type { RawMaterialModel } from "../../Model/RawMaterial";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
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

import { Filter, Package2, Palette, Plus, Ruler, Search } from "lucide-react";

type RM = RawMaterialModel & { id: string };

/* ---------- helpers ---------- */
const toNum = (v: unknown) => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const availableQty = (m: RM) =>
  Math.max(
    toNum(m.quantity) - toNum(m.quantityUsed) - toNum(m.quantityWastage),
    0
  );

const LOW_STOCK_THRESHOLD = 5;

// Classic material indicators
const getMaterialIndicator = (index: number) => {
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

export default function RawMaterialList() {
  const navigate = useNavigate();
  const [list, setList] = useState<RM[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    | "name-asc"
    | "name-desc"
    | "price-asc"
    | "price-desc"
    | "gst-asc"
    | "gst-desc"
  >("name-asc");

  const load = async () => {
    setLoading(true);
    const items = await rawMaterialsAPI.list();
    setList(items as RM[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Overview stats
  const stats = useMemo(() => {
    const total = list.length;
    const totalEstValue = list.reduce(
      (acc, m) => acc + toNum(m.estimatedPrice),
      0
    );
    const totalActualValue = list.reduce(
      (acc, m) => acc + toNum(m.actualPrice),
      0
    );
    const avgGst =
      list.length > 0
        ? list.reduce((acc, m) => acc + toNum(m.gst), 0) / list.length
        : 0;
    const lowStock = list.filter(
      (m) => availableQty(m) <= LOW_STOCK_THRESHOLD
    ).length;

    return {
      total,
      totalEstValue,
      totalActualValue,
      avgGst,
      lowStock,
    };
  }, [list]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let data = list.filter((m) => {
      const matchesTerm =
        !term ||
        [m.name, m.color, m.size, m.unitType]
          .filter(Boolean)
          .some((x) => String(x).toLowerCase().includes(term));
      return matchesTerm;
    });

    // sort
    data = [...data];
    switch (sortBy) {
      case "name-desc":
        data.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "price-asc":
        data.sort((a, b) => toNum(a.estimatedPrice) - toNum(b.estimatedPrice));
        break;
      case "price-desc":
        data.sort((a, b) => toNum(b.estimatedPrice) - toNum(a.estimatedPrice));
        break;
      case "gst-asc":
        data.sort((a, b) => toNum(a.gst) - toNum(b.gst));
        break;
      case "gst-desc":
        data.sort((a, b) => toNum(b.gst) - toNum(a.gst));
        break;
      default:
        data.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    return data;
  }, [list, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="border-b border-gray-100 bg-white  px-3 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 rounded-lg">
                <Package2 className="h-6 w-6 text-white" />
              </div>
              Materials Management
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, color, size..."
                className="pl-10 pr-4 py-2.5 w-full sm:w-[280px] border-gray-300 focus:border-slate-400 focus:ring-slate-400 rounded-lg"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button
              onClick={() => navigate("/materials/new")}
              className="bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-6 py-2.5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </div>
        </div>
      </div>

      <div className="p-0">
        {/* Materials Section */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Package2 className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">
                Materials ({filtered.length})
              </h3>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-[160px] border-gray-300 focus:border-slate-400 focus:ring-slate-400">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A → Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z → A)</SelectItem>
                  <SelectItem value="price-asc">Price (Low → High)</SelectItem>
                  <SelectItem value="price-desc">Price (High → Low)</SelectItem>
                  <SelectItem value="gst-asc">GST (Low → High)</SelectItem>
                  <SelectItem value="gst-desc">GST (High → Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
              <span className="ml-3 text-gray-600">Loading materials...</span>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-4">
                {filtered.map((m, index) => (
                  <Card
                    key={m.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300"
                    onClick={() => navigate(`/materials/${m.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${getMaterialIndicator(
                            index
                          )} flex-shrink-0 mt-2`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {m.name}
                              </h4>
                              <p className="text-sm text-gray-600 truncate">
                                UID: {m.uid || "No ID"}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                            {m.size && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                                <Ruler className="h-3 w-3" />
                                {m.size}
                              </span>
                            )}
                            {m.color && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md border border-purple-200">
                                <Palette className="h-3 w-3" />
                                {m.color}
                              </span>
                            )}
                            <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded-md border border-gray-200">
                              {m.unitType || "No unit"}
                            </span>
                            <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
                              {toNum(m.gst) || 0}% GST
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <span className="text-gray-600">Est: </span>
                              <span className="font-semibold text-gray-900">
                                {currency(m.estimatedPrice)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Actual: </span>
                              <span className="font-semibold text-gray-900">
                                {currency(m.actualPrice)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-hidden rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                      <TableHead className="font-semibold text-gray-900  px-6">
                        Material
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 px-4">
                        ID
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 px-4">
                        Size
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 px-4">
                        Color
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 px-4">
                        Unit
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 px-4">
                        Est. Price
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 px-4">
                        Actual Price
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 px-6">
                        GST
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filtered.map((m, index) => (
                      <TableRow
                        key={m.id}
                        className="cursor-pointer hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                        onClick={() => navigate(`/materials/${m.id}`)}
                      >
                        <TableCell className=" px-6">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-3 h-3 rounded-full ${getMaterialIndicator(
                                index
                              )} flex-shrink-0 mt-2`}
                            />
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 truncate max-w-[200px]">
                                {m.name}
                              </div>
                              {m.description && (
                                <div className="text-sm text-gray-600 line-clamp-1 max-w-[200px]">
                                  {m.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className=" px-4">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-800">
                            {m.uid || "-"}
                          </code>
                        </TableCell>

                        <TableCell className=" px-4">
                          {m.size ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm border border-blue-200">
                              <Ruler className="h-3 w-3" />
                              {m.size}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>

                        <TableCell className=" px-4">
                          {m.color ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-sm border border-purple-200">
                              <Palette className="h-3 w-3" />
                              {m.color}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>

                        <TableCell className=" px-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                            {m.unitType || "-"}
                          </span>
                        </TableCell>

                        <TableCell className=" px-4">
                          <span className="font-semibold text-blue-700">
                            {currency(m.estimatedPrice)}
                          </span>
                        </TableCell>

                        <TableCell className=" px-4">
                          <span className="font-semibold text-emerald-700">
                            {currency(m.actualPrice)}
                          </span>
                        </TableCell>

                        <TableCell className=" px-6">
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200">
                            {toNum(m.gst) || 0}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}

                    {!loading && filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-6 bg-gray-100 rounded-full">
                              <Package2 className="h-12 w-12 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-gray-900">
                                No materials found
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {searchTerm
                                  ? `No results for "${searchTerm}"`
                                  : "Get started by adding your first material"}
                              </p>
                            </div>
                            {!searchTerm && (
                              <Button
                                onClick={() => navigate("/materials/new")}
                                className="mt-2 bg-slate-900 hover:bg-slate-800"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Material
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
