import { Timestamp } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  getDailyDocByDate,
  upsertDailyProductionForDate,
} from "../../Api/firebaseDailyProduction";
import type { productionModel } from "../../Model/DailyProductionModel";

type StageKey =
  | "cutting"
  | "sewing"
  | "quality"
  | "finishing"
  | "packaging"
  | "inspection";

const STAGES: { key: StageKey; label: string }[] = [
  { key: "cutting", label: "cutting" },
  { key: "sewing", label: "sewing" },
  { key: "quality", label: "quality" },
  { key: "finishing", label: "finishing" },
  { key: "packaging", label: "packing" },
  { key: "inspection", label: "inspection" },
];

const EMPTY_STAGE = {
  planned: 0,
  actual: 0,
  staff: 0,
  machines: 0,
  supervisor: "",
  remarks: "",
};
const BLANK_DAY: productionModel = {
  cutting: { ...EMPTY_STAGE },
  sewing: { ...EMPTY_STAGE },
  quality: { ...EMPTY_STAGE },
  finishing: { ...EMPTY_STAGE },
  packaging: { ...EMPTY_STAGE },
  inspection: { ...EMPTY_STAGE },
};

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });

const monthDays = (year: number, monthIndex: number) => {
  const out: Date[] = [];
  const d = new Date(year, monthIndex, 1);
  while (d.getMonth() === monthIndex) {
    out.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
};

function toCSV(rows: Array<{ [k: string]: any }>) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: any) =>
    typeof v === "string" &&
    (v.includes(",") || v.includes("\n") || v.includes('"'))
      ? `"${v.replace(/"/g, '""')}"`
      : v ?? "";
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
  ];
  return lines.join("\n");
}

export default function Logs({ poData }: { poData?: any }) {
  // month/year selectors
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  // product tabs (optional)
  const products = (poData?.products || []) as Array<{
    id: string;
    name: string;
  }>;
  const [productId, setProductId] = useState<string>(products[0]?.id ?? "");

  // data store: ISO date -> productionModel
  const [cache, setCache] = useState<Record<string, productionModel>>({});
  const [loadingDays, setLoadingDays] = useState<Record<string, boolean>>({});
  const days = useMemo(() => monthDays(year, month), [year, month]);

  // drawer state
  const [open, setOpen] = useState(false);
  const [drawerDate, setDrawerDate] = useState<Date | null>(null);
  const [draft, setDraft] = useState<productionModel>(
    structuredClone(BLANK_DAY)
  );
  const [saving, setSaving] = useState(false);

  // fetch a single day lazily
  const loadDay = async (d: Date) => {
    const key = d.toISOString().slice(0, 10);
    if (cache[key] || loadingDays[key]) return;
    setLoadingDays((m) => ({ ...m, [key]: true }));
    try {
      const ts = Timestamp.fromDate(d);
      const doc = await getDailyDocByDate(ts);
      const prod =
        (doc?.production as productionModel) || structuredClone(BLANK_DAY);
      setCache((m) => ({ ...m, [key]: prod }));
    } finally {
      setLoadingDays((m) => ({ ...m, [key]: false }));
    }
  };

  // pre-warm: load today’s row quickly
  useEffect(() => {
    const today = new Date();
    if (today.getFullYear() === year && today.getMonth() === month)
      loadDay(today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const openDrawer = async (d: Date) => {
    await loadDay(d);
    const key = d.toISOString().slice(0, 10);
    setDraft(structuredClone(cache[key] || BLANK_DAY));
    setDrawerDate(d);
    setOpen(true);
  };

  const saveDrawer = async () => {
    if (!drawerDate) return;
    setSaving(true);
    try {
      await upsertDailyProductionForDate(
        Timestamp.fromDate(drawerDate),
        "production",
        draft
      );
      const key = drawerDate.toISOString().slice(0, 10);
      setCache((m) => ({ ...m, [key]: structuredClone(draft) }));
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  // CSV export
  const exportMonth = async () => {
    // ensure all days we will export are loaded first
    for (const d of days) await loadDay(d);

    const rows: any[] = [];
    for (const d of days) {
      const key = d.toISOString().slice(0, 10);
      const day = cache[key] || BLANK_DAY;

      const base: any = { Date: fmtDate(d) };
      STAGES.forEach((s) => {
        base[`${s.label}_target`] = (day[s.key] as any).planned ?? 0;
        base[`${s.label}_output`] = (day[s.key] as any).actual ?? 0;
        base[`${s.label}_staff`] = (day[s.key] as any).staff ?? 0;
      });

      base["remarks"] =
        day.cutting.remarks ||
        day.sewing.remarks ||
        day.quality.remarks ||
        day.finishing.remarks ||
        day.packaging.remarks ||
        day.inspection.remarks ||
        "";

      rows.push(base);
    }

    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const y = year.toString();
    const m = (month + 1).toString().padStart(2, "0");
    a.download = `production-logs-${y}-${m}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
                  onClick={() => setProductId(p.id)}
                  className={
                    "px-3 py-1 rounded border text-sm " +
                    (productId === p.id
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

        <div className="flex-1" />
        <button
          onClick={exportMonth}
          className="px-3 py-1 border rounded text-sm bg-white hover:bg-black/5"
        >
          Export CSV
        </button>
      </div>

      {/* Logs Table (readable, matches your spreadsheet groupings) */}
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
              const day = cache[key]; // might be undefined until loaded
              return (
                <tr
                  key={key}
                  className="hover:bg-gray-50 cursor-pointer"
                  onMouseEnter={() => loadDay(d)}
                  onClick={() => openDrawer(d)}
                >
                  <td className="border px-2 py-1">{fmtDate(d)}</td>
                  {STAGES.map((s) => (
                    <Fragment key={s.key + key}>
                      <td className="border px-2 py-1 text-center">
                        {day ? (day[s.key] as any).planned ?? 0 : "…"}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {day ? (day[s.key] as any).actual ?? 0 : "…"}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {day ? (day[s.key] as any).staff ?? 0 : "…"}
                      </td>
                    </Fragment>
                  ))}
                  <td className="border px-2 py-1">
                    {day
                      ? (
                          day.cutting.remarks ||
                          day.sewing.remarks ||
                          day.quality.remarks ||
                          day.finishing.remarks ||
                          day.packaging.remarks ||
                          day.inspection.remarks ||
                          ""
                        ).slice(0, 80)
                      : "…"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SIDE DRAWER to view/edit a day's complete log */}
      <div
        className={
          "fixed top-0 right-0 h-full w-[420px] max-w-[90vw] bg-white shadow-2xl border-l border-gray-200 transition-transform " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">
            Log — {drawerDate ? fmtDate(drawerDate) : ""}
          </div>
          <button
            className="px-3 py-1 border rounded text-sm"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>

        {drawerDate && (
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
                      value={(draft[s.key] as any).planned}
                      onChange={(e) =>
                        setDraft((prev) => ({
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
                      value={(draft[s.key] as any).actual}
                      onChange={(e) =>
                        setDraft((prev) => ({
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
                      value={(draft[s.key] as any).staff}
                      onChange={(e) =>
                        setDraft((prev) => ({
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
                    value={(draft[s.key] as any).remarks}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        [s.key]: {
                          ...(prev as any)[s.key],
                          remarks: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-black text-white rounded disabled:opacity-60"
                onClick={saveDrawer}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// tiny Fragment helper
function Fragment({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
