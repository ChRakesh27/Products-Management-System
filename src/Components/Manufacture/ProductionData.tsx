import { Timestamp } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  getDailyDocByCurrentMonth,
  upsertDailyProductionForDate,
} from "../../Api/firebaseDailyProduction";
import { useLoading } from "../../context/LoadingContext";
import { Button } from "../ui/button";

import { Info } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";

type DailyEntry = {
  target: number;
  output: number;
  remark: string;
};

type DayMap = Record<string, DailyEntry>; // key = yyyy-mm-dd

// If your PO object looks like this:
type ProductLite = { id: string; name: string };

// ── Utils ──────────────────────────────────────────────────────────────
const fmt = (d: Date) =>
  d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });

const blankEntry: DailyEntry = { target: 0, output: 0, remark: "" };

function monthDays(year: number, monthIndex: number) {
  const days: Date[] = [];
  const d = new Date(year, monthIndex, 1);
  while (d.getMonth() === monthIndex) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function extractEntry(
  existing: any,
  productId: string | undefined
): DailyEntry | undefined {
  if (!existing) return undefined;

  if (productId && existing[productId]) {
    const v = existing[productId];
    if (typeof v?.target === "number" || typeof v?.output === "number") {
      return {
        target: v.target || 0,
        output: v.output || 0,
        remark: v.remark || "",
      };
    }
  }

  // Legacy / single-field keys commonly used earlier:
  const candidates = [
    existing.production,
    existing.entry,
    existing.daily,
    existing.data,
    existing,
  ];
  for (const v of candidates) {
    if (v && (typeof v.target === "number" || typeof v.output === "number")) {
      return {
        target: v.target || 0,
        output: v.output || 0,
        remark: v.remark || "",
      };
    }
  }

  return undefined;
}

// ── Component ─────────────────────────────────────────────────────────
export default function ProductionData({ poData }) {
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth());
  const [year, setYear] = useState<number>(today.getFullYear());

  const products = (poData?.products || []) as ProductLite[];
  const [selectedProduct, setSelectedProduct] = useState<any>(products[0]);
  const [dayMap, setDayMap] = useState<DayMap>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDate, setDrawerDate] = useState<Date | null>(null);
  const [drawerData, setDrawerData] = useState<DailyEntry>({ ...blankEntry });
  const [saving, setSaving] = useState(false);
  const { setLoading } = useLoading();
  const days = useMemo(() => monthDays(year, month), [month, year]);
  async function ensureMonthLoaded(productId: string | undefined) {
    try {
      setLoading(true);
      const res = await getDailyDocByCurrentMonth(); // keep your signature
      const next: DayMap = {};

      for (const existing of res) {
        const date = (existing.date as Timestamp).toDate();
        const key = date.toISOString().slice(0, 10);

        const entry = extractEntry(existing, productId);
        if (entry) next[key] = entry;
      }
      setDayMap(next);
    } catch (e) {
      console.error("fetch month failed", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedProduct?.id) {
      return;
    }
    ensureMonthLoaded(selectedProduct.id);
  }, [selectedProduct?.id, month, year]);

  // Open drawer for a date
  function openDrawerFor(date: Date) {
    const key = date.toISOString().slice(0, 10);
    setDrawerData({ ...(dayMap[key] ?? { ...blankEntry }) });
    setDrawerDate(date);
    setDrawerOpen(true);
  }

  async function saveDrawer() {
    if (!drawerDate) return;
    try {
      setSaving(true);
      const ts = Timestamp.fromDate(drawerDate);
      const fieldKey = selectedProduct.id;
      await upsertDailyProductionForDate(
        ts,
        fieldKey,
        {
          target: Number(drawerData.target || 0),
          output: Number(drawerData.output || 0),
          remark: String(drawerData.remark || ""),
        },
        poData.id,
        products
      );

      const key = drawerDate.toISOString().slice(0, 10);
      setDayMap((m) => ({ ...m, [key]: { ...drawerData } }));
      setDrawerOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Product selector */}
        {products.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Product</label>
            <div className="flex gap-2">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProduct(p);
                  }}
                  className={
                    "px-3 py-1 rounded border text-sm " +
                    (selectedProduct?.id === p.id
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-black/5")
                  }
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Month</label>
          <select
            className="border rounded px-2 py-1"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>
                {new Date(2025, i, 1).toLocaleString("en-US", {
                  month: "short",
                })}
              </option>
            ))}
          </select>
          <input
            className="border rounded px-2 py-1 w-24"
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
      </div>
      <ProductOrderCard
        item={{
          totalAmount: selectedProduct?.totalAmount || "",
          gst: selectedProduct?.gst || "",
          name: selectedProduct?.name || "",
          productionQty: selectedProduct?.productionQty || "",
          id: selectedProduct?.id || "",
          unitPrice: selectedProduct?.unitPrice || "",
          size: selectedProduct?.size || "",
          unitType: selectedProduct?.unitType || "",
          description: selectedProduct?.description || "",
          quantityOrdered: selectedProduct?.quantityOrdered || "",
          color: selectedProduct?.color || "",
        }}
      />
      {/* Grid */}
      <div className="overflow-auto border border-gray-200 rounded">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 w-28 text-left">Date</th>
              <th className="border px-2 py-1 text-center">Target</th>
              <th className="border px-2 py-1 text-center">Output</th>
              <th className="border px-2 py-1 text-left">Remark</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => {
              const key = d.toISOString().slice(0, 10);
              const entry = dayMap[key];
              const remarkPreview = entry?.remark ? entry.remark.trim() : "";
              return (
                <tr
                  key={key}
                  className="hover:bg-gray-100 cursor-pointer relative"
                  onClick={() => openDrawerFor(d)}
                >
                  <td className="border px-2 py-1">{fmt(d)}</td>
                  <td className="border px-2 py-1 text-center">
                    {entry ? entry.target : ""}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {entry ? entry.output : ""}
                  </td>
                  <td className="border px-2 py-1 text-left group">
                    <span className="truncate block max-w-[260px]">
                      {remarkPreview ? remarkPreview : ""}
                    </span>
                    {remarkPreview && (
                      <div className="absolute z-40 hidden group-hover:block bg-black text-white text-xs rounded-md px-3 py-2 w-72 right-2 -top-1 mt-1 shadow-lg whitespace-pre-line">
                        {remarkPreview}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SIDE DRAWER */}
      <div
        className={
          "fixed top-0 right-0 h-full z-40 w-[480px] max-w-[90vw] bg-white shadow-2xl border-l border-gray-200 transition-transform " +
          (drawerOpen ? "translate-x-0" : "translate-x-full")
        }
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">
            Add / Edit Entry — {drawerDate ? fmt(drawerDate) : ""}
          </div>
          <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
            Close
          </Button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-56px)]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">
                Target
              </label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={drawerData.target}
                onChange={(e) =>
                  setDrawerData((prev) => ({
                    ...prev,
                    target: Number(e.target.value || 0),
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-[11px] text-gray-600 mb-1">
                Output
              </label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={drawerData.output}
                onChange={(e) =>
                  setDrawerData((prev) => ({
                    ...prev,
                    output: Number(e.target.value || 0),
                  }))
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-gray-600 mb-1">
              Remark
            </label>
            <textarea
              className="w-full border rounded px-2 py-2"
              rows={4}
              placeholder="Any issues, delays, notes…"
              value={drawerData.remark}
              onChange={(e) =>
                setDrawerData((prev) => ({ ...prev, remark: e.target.value }))
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveDrawer} disabled={saving || !drawerDate}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

type ProductOrder = {
  id: string;
  name: string;
  color: string;
  size: string;
  unitType: string;
  unitPrice: number;
  quantityOrdered: number | string;
  productionQty?: number; // supports both productionQty and production (fallback below)
  totalAmount: number; // pre-GST
  gstPct?: number; // e.g. 12
  gst?: number | string; // e.g. "12%" or 12
  description?: string;
};

const colorDot = (color: string) => {
  const m: Record<string, string> = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    black: "bg-black",
    white: "bg-gray-200 border",
    gray: "bg-gray-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
  };
  const key = (color || "").toLowerCase();
  return m[key] ?? "bg-gray-400";
};

const parsePct = (v: unknown): number | undefined => {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v.replace("%", "").trim());
  return undefined;
};

function ProductOrderCard({ item }: { item: ProductOrder }) {
  const ordered = Number(item.quantityOrdered || 0);
  const produced = Number(
    (item.productionQty ?? (item as any).production ?? 0) || 0
  );
  const remaining = Math.max(0, ordered - produced);
  const progress =
    ordered > 0 ? Math.min(100, Math.round((produced / ordered) * 100)) : 0;

  const gstPercent = item.gstPct ?? parsePct(item.gst) ?? 0;
  const gstAmt = (item.totalAmount || 0) * (gstPercent / 100);
  const grandTotal = (item.totalAmount || 0) + gstAmt;

  return (
    <Card className="overflow-hidden py-5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate">{item.name}</CardTitle>
            <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-full ${colorDot(item.color)}`}
                />
                <span className="text-xs">{item.color}</span>
              </span>
              <Separator orientation="vertical" className="h-4" />
              <Badge variant="secondary" className="text-[11px]">
                {item.size}
              </Badge>
              <Badge variant="secondary" className="text-[11px]">
                XS-12, S-23, M-21
              </Badge>
              <Badge variant="outline" className="text-[11px]">
                {item.unitType}
              </Badge>
            </CardDescription>
          </div>

          <div className="text-right shrink-0">
            <div className="text-sm text-muted-foreground"> Delivery Date</div>
            <div className="text-base font-semibold">{"30/09/2025"}</div>
          </div>
        </div>

        {item.description ? (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {item.description}
          </p>
        ) : null}
      </CardHeader>

      <CardContent className="grid gap-4">
        {/* Quantities */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat
            label="Ordered Quantity"
            value={`${ordered} ${item.unitType || ""}`}
          />
          <Stat
            label="Produced Quantity"
            value={`${produced} ${item.unitType || ""}`}
          />
          <Stat
            label="Remaining Quantity"
            value={`${remaining} ${item.unitType || ""}`}
          />
          <Stat label="Progress" value={`${progress}%`} />
        </div>

        <div>
          {/* <Progress value={progress} className="h-2" /> */}
          {remaining === 0 && ordered > 0 ? (
            <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
              <Info className="h-3.5 w-3.5" /> Production complete
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}
