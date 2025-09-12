import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { rawMaterialsAPI } from "../../Api/firebaseRawMaterial";
import currency from "../../Constants/Currency";
import type { RawMaterialModel } from "../../Model/RawMaterial";

import { Filter, Plus, Search } from "lucide-react";

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
    <div className="space-y-5 p-4 sm:p-6">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Materials Management</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8 w-[240px] sm:w-[260px]"
              placeholder="Search name, color, size…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => navigate("/materials/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Material
          </Button>
        </div>
      </div>

      {/* filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 ml-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-[160px]">
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

      {/* DESKTOP TABLE */}
      <div className="border rounded-md overflow-x-auto hidden md:block">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-[16%]">Unq Id</TableHead>
                <TableHead className="w-[20%]">Material</TableHead>
                <TableHead className="w-[12%]">Size</TableHead>
                <TableHead className="w-[12%]">Color</TableHead>
                <TableHead className="w-[12%]">Unit</TableHead>
                <TableHead className="w-[12%]" title="Estimated or Actual">
                  Estimated Price
                </TableHead>
                <TableHead className="w-[10%]" title="Actual price">
                  Actual Price
                </TableHead>
                <TableHead className="w-[10%]" title="GST (%)">
                  GST
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((m) => {
                return (
                  <TableRow
                    key={m.id}
                    className="cursor-pointer hover:bg-muted/20"
                    onClick={() => navigate(`/materials/${m.id}`)}
                  >
                    <TableCell>{m.uid || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{m.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{m.size || "-"}</TableCell>
                    <TableCell>{m.color || "-"}</TableCell>
                    <TableCell>{m.unitType || "-"}</TableCell>
                    <TableCell>{currency(m.estimatedPrice)}</TableCell>
                    <TableCell>{currency(m.actualPrice)}</TableCell>
                    <TableCell>{toNum(m.gst) || 0}%</TableCell>
                  </TableRow>
                );
              })}

              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No materials found{searchTerm ? ` for “${searchTerm}”` : ""}
                    .
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* MOBILE LIST */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading…</div>
        ) : filtered.length ? (
          filtered.map((m) => {
            return (
              <div
                key={m.id}
                className="rounded-lg border p-4 bg-white shadow-sm"
                onClick={() => navigate(`/materials/${m.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{m.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground truncate">
                      UID: {m.uid || "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md border p-2">
                    <div className="text-xs text-muted-foreground">Size</div>
                    <div className="font-medium">{m.size || "—"}</div>
                  </div>
                  <div className="rounded-md border p-2">
                    <div className="text-xs text-muted-foreground">Color</div>
                    <div className="font-medium">{m.color || "—"}</div>
                  </div>
                  <div className="rounded-md border p-2">
                    <div className="text-xs text-muted-foreground">Unit</div>
                    <div className="font-medium">{m.unitType || "—"}</div>
                  </div>
                  <div className="rounded-md border p-2">
                    <div className="text-xs text-muted-foreground">GST</div>
                    <div className="font-medium">{toNum(m.gst) || 0}%</div>
                  </div>
                  <div className="rounded-md border p-2">
                    <div className="text-xs text-muted-foreground">
                      Est. Price
                    </div>
                    <div className="font-semibold">
                      {currency(m.estimatedPrice)}
                    </div>
                  </div>
                  <div className="rounded-md border p-2">
                    <div className="text-xs text-muted-foreground">
                      Actual Price
                    </div>
                    <div className="font-semibold">
                      {currency(m.actualPrice)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            No materials found{searchTerm ? ` for “${searchTerm}”` : ""}.
          </div>
        )}
      </div>
    </div>
  );
}
