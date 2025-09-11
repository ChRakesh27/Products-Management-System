import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { vendorsAPI } from "../../Api/firebaseVendor";
import type { PartnerModel } from "../../Model/VendorModel";

import {
  Building2,
  Filter,
  Mail,
  Phone,
  Plus,
  User,
  UsersRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <UsersRound className="h-6 w-6" /> Parties
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage vendors & customers for POs and invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, phone…"
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
          <Button onClick={() => nav("/partners/new")}>
            <Plus className=" h-4 w-4" /> Add Party
          </Button>
        </div>
      </div>

      {/* Overview tiles */}
      <Card className="overflow-hidden">
        <CardHeader className="py-3">
          <CardTitle className="text-base">Directory Overview</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-3 gap-3">
            <Tile label="Total" value={stats.total} />
            <Tile label="Vendors" value={stats.vendors} tone="violet" />
            <Tile label="Customers" value={stats.customers} tone="emerald" />
          </div>
        </CardContent>
      </Card>

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

      <div className="p-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 sticky top-0 z-10 hover:bg-muted/30">
                <TableHead className="w-[28%]">Party</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>State</TableHead>
                <TableHead>GST</TableHead>
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
  );
}

/* --- compact tile --- */
function Tile({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "slate" | "violet" | "emerald";
}) {
  const map = {
    slate: "border-slate-200",
    violet: "border-violet-200 bg-violet-50",
    emerald: "border-emerald-200 bg-emerald-50",
  } as const;
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${map[tone]}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}
