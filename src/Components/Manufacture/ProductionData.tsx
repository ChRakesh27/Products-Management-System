import { Timestamp } from "firebase/firestore";
import { useMemo, useState } from "react";
import {
  getDailyDocByDate,
  upsertDailyProductionForDate,
} from "../../Api/firebaseDailyProduction";
import type { productionModel } from "../../Model/DailyProductionModel";
import { useLoading } from "../../context/LoadingContext";
import { Button } from "../ui/button";

// ---- UI helpers (no external deps needed) ----
const fmt = (d: Date) =>
  d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });

const STAGES = [
  { key: "cutting", label: "cutting" },
  { key: "sewing", label: "sewing" },
  { key: "quality", label: "quality" },
  { key: "finishing", label: "finishing" },
  { key: "packaging", label: "packing" },
  { key: "inspection", label: "inspection" },
] as const;

type StageKey = (typeof STAGES)[number]["key"];

type CellKey = "planned" | "actual" | "staff";

/** default empty production object shape */
const blankDay: productionModel = {
  cutting: {
    planned: 0,
    actual: 0,
    staff: 0,
    machines: 0,
    supervisor: "",
    remarks: "",
  },
  sewing: {
    planned: 0,
    actual: 0,
    staff: 0,
    machines: 0,
    supervisor: "",
    remarks: "",
  },
  quality: {
    planned: 0,
    actual: 0,
    staff: 0,
    machines: 0,
    supervisor: "",
    remarks: "",
  },
  finishing: {
    planned: 0,
    actual: 0,
    staff: 0,
    machines: 0,
    supervisor: "",
    remarks: "",
  },
  packaging: {
    planned: 0,
    actual: 0,
    staff: 0,
    machines: 0,
    supervisor: "",
    remarks: "",
  },
  inspection: {
    planned: 0,
    actual: 0,
    staff: 0,
    machines: 0,
    supervisor: "",
    remarks: "",
  },
};

function monthDays(year: number, monthIndex: number) {
  // monthIndex: 0=Jan ... 11=Dec
  const days: Date[] = [];
  const d = new Date(year, monthIndex, 1);
  while (d.getMonth() === monthIndex) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export default function ProductionData({ poData }: { poData?: any }) {
  // Month picker defaults to current month
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth());
  const [year, setYear] = useState<number>(today.getFullYear());

  // Product tab (uses your PO’s product list like your original component)
  const products = (poData?.products || []) as Array<{
    id: string;
    name: string;
  }>;
  const [selectedProduct, setSelectedProduct] = useState<string>(
    products[0]?.id ?? ""
  );

  // Cache of day -> productionModel
  const [dayMap, setDayMap] = useState<Record<string, productionModel>>({});
  const [loadingRow, setLoadingRow] = useState<string>("");
  const { setLoading } = useLoading();

  // Side Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDate, setDrawerDate] = useState<Date | null>(null);
  const [drawerData, setDrawerData] = useState<productionModel>(
    structuredClone(blankDay)
  );
  const [saving, setSaving] = useState(false);

  const days = useMemo(() => monthDays(year, month), [month, year]);

  // Load a single day on-demand (when clicking a cell/row)
  async function ensureDayLoaded(date: Date) {
    const key = date.toISOString().slice(0, 10);
    if (dayMap[key]) return;

    setLoadingRow(key);
    try {
      setLoading(true);
      const ts = Timestamp.fromDate(date);
      const existing = await getDailyDocByDate(ts);
      setDayMap((m) => ({
        ...m,
        [key]:
          (existing?.production as productionModel) ||
          structuredClone(blankDay),
      }));
    } catch (e) {
      console.error("fetch day failed", e);
      setDayMap((m) => ({ ...m, [key]: structuredClone(blankDay) }));
    } finally {
      setLoading(false);
      setLoadingRow("");
    }
  }

  // Open side drawer for a specific date
  async function openDrawerFor(date: Date) {
    await ensureDayLoaded(date);
    const key = date.toISOString().slice(0, 10);
    setDrawerData(structuredClone(dayMap[key] || structuredClone(blankDay)));
    setDrawerDate(date);
    setDrawerOpen(true);
  }

  async function saveDrawer() {
    if (!drawerDate) return;
    try {
      setSaving(true);
      const ts = Timestamp.fromDate(drawerDate);
      // Persist the whole day (your API expects { production: productionModel })
      await upsertDailyProductionForDate(ts, "production", drawerData);

      const key = drawerDate.toISOString().slice(0, 10);
      setDayMap((m) => ({ ...m, [key]: structuredClone(drawerData) }));
      setDrawerOpen(false);
    } catch (e) {
      console.error(e);
      alert("Failed to save production log");
    } finally {
      setSaving(false);
    }
  }

  // Render helpers
  const cellVal = (date: Date, stage: StageKey, field: CellKey) => {
    const key = date.toISOString().slice(0, 10);
    const d = dayMap[key];
    if (!d) return ""; // not loaded yet
    return (d[stage] as any)?.[field] ?? "";
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
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

        {products.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Product</label>
            <div className="flex gap-2">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p.id)}
                  className={
                    "px-3 py-1 rounded border text-sm " +
                    (selectedProduct === p.id
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
      </div>

      {/* Spreadsheet-like matrix */}
      <div className="overflow-auto border border-gray-200 rounded">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 w-28 text-left">Date</th>
              {STAGES.map((s) => (
                <th
                  key={s.key}
                  className="border px-2 py-1 text-center"
                  colSpan={3}
                >
                  {s.label}
                </th>
              ))}
              <th className="border px-2 py-1 text-left">remarks</th>
            </tr>
            <tr className="bg-gray-50">
              <th className="border px-2 py-1 text-left"></th>
              {STAGES.map((s) => (
                <Fragment key={s.key + "-sub"}>
                  <th className="border px-2 py-1 text-center">target</th>
                  <th className="border px-2 py-1 text-center">Output</th>
                  <th className="border px-2 py-1 text-center">Staff</th>
                </Fragment>
              ))}
              <th className="border px-2 py-1 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => {
              const key = d.toISOString().slice(0, 10);
              return (
                <tr
                  key={key}
                  className="hover:bg-gray-100 cursor-pointer relative"
                  onClick={() => openDrawerFor(d)}
                >
                  <td className="border px-2 py-1">{fmt(d)}</td>
                  {STAGES.map((s) => (
                    <Fragment key={s.key + key}>
                      <td className="border px-2 py-1 text-center">
                        {loadingRow === key
                          ? "…"
                          : cellVal(d, s.key, "planned")}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {loadingRow === key ? "…" : cellVal(d, s.key, "actual")}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {loadingRow === key ? "…" : cellVal(d, s.key, "staff")}
                      </td>
                    </Fragment>
                  ))}
                  <td className="border px-2 py-1 text-left  group">
                    {(() => {
                      const dkey = dayMap[key];
                      if (!dkey) return "";

                      const remark = [
                        "Cutting : " + dkey.cutting?.remarks,
                        "Sewing : " + dkey.sewing?.remarks,
                        "Quality : " + dkey.quality?.remarks,
                        "Finishing : " + dkey.finishing?.remarks,
                        "Packaging : " + dkey.packaging?.remarks,
                        "Inspection : " + dkey.inspection?.remarks,
                      ]
                        .filter(Boolean)
                        .join("\n");

                      const short = remark.slice(0, 80);
                      return (
                        <>
                          <span className="truncate block max-w-[200px]">
                            Remarks
                          </span>

                          {/* Tooltip */}
                          {remark && (
                            <div className="absolute z-10 hidden group-hover:block bg-black text-white text-xs rounded-md px-3 py-2 w-64 max-w-xs right-4 -top-30 mt-1 shadow-lg whitespace-pre-line">
                              {remark}
                            </div>
                          )}
                        </>
                      );
                    })()}
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
          "fixed top-0 right-0 h-full z-18  w-1/3 max-w-[90vw] bg-white shadow-2xl border-l border-gray-200 transition-transform " +
          (drawerOpen ? "translate-x-0" : "translate-x-full")
        }
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">
            Add / Edit Entry — {drawerDate ? fmt(drawerDate) : ""}
          </div>
          <Button
            className="px-3 py-1 border rounded text-sm"
            variant="ghost"
            onClick={() => setDrawerOpen(false)}
          >
            Close
          </Button>
        </div>

        {/* Editor: mirrors your original ProductionData fields but compact */}
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-56px)]">
          {STAGES.map((s) => (
            <div key={s.key} className="border rounded p-3">
              <div className="font-semibold mb-2 capitalize">{s.label}</div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-600 mb-1">
                    target
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded px-2 py-1"
                    value={(drawerData[s.key] as any).planned}
                    onChange={(e) =>
                      setDrawerData((prev) => ({
                        ...prev,
                        [s.key]: {
                          ...(prev as any)[s.key],
                          planned: Number(e.target.value || 0),
                        },
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
                    value={(drawerData[s.key] as any).actual}
                    onChange={(e) =>
                      setDrawerData((prev) => ({
                        ...prev,
                        [s.key]: {
                          ...(prev as any)[s.key],
                          actual: Number(e.target.value || 0),
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600 mb-1">
                    Staff
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded px-2 py-1"
                    value={(drawerData[s.key] as any).staff}
                    onChange={(e) =>
                      setDrawerData((prev) => ({
                        ...prev,
                        [s.key]: {
                          ...(prev as any)[s.key],
                          staff: Number(e.target.value || 0),
                        },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-[11px] text-gray-600 mb-1">
                  remarks
                </label>
                <textarea
                  className="w-full border rounded px-2 py-1"
                  rows={2}
                  value={(drawerData[s.key] as any).remarks}
                  onChange={(e) =>
                    setDrawerData((prev) => ({
                      ...prev,
                      [s.key]: {
                        ...(prev as any)[s.key],
                        remarks: e.target.value,
                      },
                    }))
                  }
                  placeholder="Any issues, delays, notes…"
                />
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 border rounded"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-black text-white rounded disabled:opacity-60"
              onClick={saveDrawer}
              disabled={saving || !drawerDate}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Little React.Fragment shim to avoid importing it at top
function Fragment({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
