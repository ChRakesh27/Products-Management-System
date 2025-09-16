import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { vendorsAPI } from "../../Api/firebaseVendor";
import type { PartnerModel } from "../../Model/VendorModel";

import {
  BarChart3,
  Building2,
  Filter,
  Mail,
  Phone,
  Plus,
  Search,
  User,
  UsersRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
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
import { Separator } from "../ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

/* ---------------- helpers ---------------- */
const initials = (name?: string) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "—";

const tsToMs = (t: any) =>
  t?.seconds
    ? t.seconds * 1000 + (t.nanoseconds ? Math.floor(t.nanoseconds / 1e6) : 0)
    : 0;

const toneByType = (t?: string) =>
  (t || "").toLowerCase() === "customer"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-violet-50 text-violet-700 border-violet-200";

/* --------------- component --------------- */
export function VendorList() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<PartnerModel[]>([]);
  const [typeFilter, setTypeFilter] = useState<"all" | "Vendor" | "Customer">(
    "all"
  );
  const [sortBy, setSortBy] = useState<
    "name-asc" | "name-desc" | "newest" | "oldest"
  >("name-asc");

  useEffect(() => {
    vendorsAPI.list().then(setItems);
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const vendors = items.filter(
      (x) => (x.type || "").toLowerCase() === "vendor"
    ).length;
    const customers = items.filter(
      (x) => (x.type || "").toLowerCase() === "customer"
    ).length;
    return { total, vendors, customers };
  }, [items]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let data = items.filter((v) => {
      const matchesTerm =
        !term ||
        [v.name, v.email, v.phone, v.gstNumber]
          .filter(Boolean as any)
          .some((x) => String(x).toLowerCase().includes(term));
      const matchesType = typeFilter === "all" || v.type === typeFilter;
      return matchesTerm && matchesType;
    });

    switch (sortBy) {
      case "name-desc":
        data = data.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "newest":
        data = data.sort((a, b) => tsToMs(b.createdAt) - tsToMs(a.createdAt));
        break;
      case "oldest":
        data = data.sort((a, b) => tsToMs(a.createdAt) - tsToMs(b.createdAt));
        break;
      default:
        data = data.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    return data;
  }, [items, q, typeFilter, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="border-b border-gray-100 bg-white px-3 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 rounded-lg">
                <UsersRound className="h-6 w-6 text-white" />
              </div>
              Business Partners
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products, color, size..."
                className="pl-10 pr-4 py-2.5 w-full sm:w-[280px] border-gray-300 focus:border-slate-400 focus:ring-slate-400 rounded-lg"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button
              onClick={() => nav("/partners/new")}
              className="bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-6 py-2.5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Partner
            </Button>
          </div>
        </div>
      </div>
      <div className="p-0">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            <StatCard
              label="Total Partners"
              value={stats.total}
              color="slate"
            />
            <StatCard label="Vendors" value={stats.vendors} color="emerald" />
            <StatCard label="Customers" value={stats.customers} color="amber" />
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-6">
          {/* Filters */}
          <div className="flex  items-center space-x-3 ">
            <div className="inline-flex rounded-md border text-xs sm:text-base  bg-white p-1">
              <Button
                variant={typeFilter === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTypeFilter("all")}
              >
                All
              </Button>
              <Button
                variant={typeFilter === "Vendor" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTypeFilter("Vendor")}
              >
                Vendors
              </Button>
              <Button
                variant={typeFilter === "Customer" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTypeFilter("Customer")}
              >
                Customers
              </Button>
            </div>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <div className="flex items-center text-xs sm:text-base gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A → Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z → A)</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Table */}
          <div className="hidden lg:block overflow-hidden rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-900 px-6">
                    Party
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 px-6">
                    Email
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 px-6">
                    Phone
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 px-6">
                    State
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 px-6">
                    GST
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow
                    key={v.id}
                    className="hover:bg-muted/40 cursor-pointer"
                    onClick={() => nav(`/partners/${v.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          {/* If you have photos later, use <AvatarImage src={v.photoUrl} /> */}
                          <AvatarImage src={undefined} alt={v.name} />
                          <AvatarFallback>{initials(v.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{v.name}</div>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`border ${toneByType(v.type)}`}
                            >
                              {v.type || "—"}
                            </Badge>
                            {v.billingAddress.address && (
                              <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                                {v.billingAddress.address}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="align-top">
                      {v.email ? (
                        <a
                          href={`mailto:${v.email}`}
                          className="inline-flex items-center gap-1 hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5" /> {v.email}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="align-top">
                      {v.phone ? (
                        <a
                          href={`tel:${v.phone}`}
                          className="inline-flex items-center gap-1 hover:underline"
                        >
                          <Phone className="h-3.5 w-3.5" /> {v.phone}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="align-top">
                      <div className="inline-flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{v.billingAddress?.state || "—"}</span>
                      </div>
                    </TableCell>

                    <TableCell className="align-top">
                      {v.gstNumber || "—"}
                    </TableCell>
                  </TableRow>
                ))}

                {!filtered.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <div className="mx-auto w-full max-w-sm">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border bg-muted/40">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {q || typeFilter !== "all"
                            ? "No parties match your filters."
                            : "No parties yet. Create your first one."}
                        </div>
                        <div className="mt-3">
                          <Button onClick={() => nav("/vendors/new")}>
                            <Plus className=" h-4 w-4" />
                            Add Party
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
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
