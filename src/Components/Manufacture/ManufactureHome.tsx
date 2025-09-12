// src/components/manufactures/ManufactureList.tsx
import { Pencil, Plus, Trash2, RefreshCcw, Calendar } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { manufacturesAPI } from "../../Api/firebaseManufacture";
import type { ManufactureModel } from "../../Model/DailyProductionModel";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import ToastMSG from "../ui/Toaster";

export default function ManufactureHome() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ManufactureModel[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const list = await manufacturesAPI.getAll();
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
    <div className="p-4 md:p-6">
      <Card className="py-5">
        <CardHeader className="gap-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <CardTitle className="text-xl md:text-2xl">Manufactures</CardTitle>
            <div className="flex w-full md:w-auto items-center gap-2">
              <Input
                placeholder="Search by PO or remarks…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full md:w-64"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={load}
                title="Refresh"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
              <Button onClick={() => navigate("/manufactures/new")}>
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-md bg-muted animate-pulse"
                />
              ))}
            </div>
          )}

          {!loading && (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Planned Units</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>End</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead className="w-[140px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground py-10"
                        >
                          No manufactures found{q ? ` for “${q}”` : ""}.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((r) => (
                        <TableRow
                          key={r.id}
                          onClick={() => navigate(`/manufactures/${r.id}`)}
                          className="cursor-pointer hover:bg-muted/30"
                        >
                          <TableCell className="font-medium">
                            {r.poNo || "-"}
                          </TableCell>
                          <TableCell>{r.planedUnits ?? "-"}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {toDateStr(r.startDate)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {toDateStr(r.endDate)}
                          </TableCell>
                          <TableCell className="truncate max-w-[320px]">
                            {r.remarks || "-"}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/manufactures/${r.id}/edit`);
                              }}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(r.id);
                              }}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile accordion list (single card container) */}
              <div className="md:hidden">
                {filtered.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    No manufactures found{q ? ` for “${q}”` : ""}.
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {filtered.map((r) => (
                      <AccordionItem
                        key={r.id}
                        value={r.id ?? String(Math.random())}
                      >
                        <AccordionTrigger className="text-left">
                          <div className="flex flex-col gap-0.5">
                            <div className="font-medium">{r.poNo || "-"}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {toDateStr(r.startDate)} →{" "}
                                {toDateStr(r.endDate)}
                              </span>
                              <span className="hidden xs:inline">•</span>
                              <span>Planned: {r.planedUnits ?? "-"}</span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div
                            className="rounded-md border p-3 active:opacity-80 transition"
                            onClick={() => navigate(`/manufactures/${r.id}`)}
                          >
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <KV label="PO Number" value={r.poNo || "-"} />
                              <KV
                                label="Planned Units"
                                value={r.planedUnits ?? "-"}
                              />
                              <KV
                                label="Start"
                                value={toDateStr(r.startDate)}
                              />
                              <KV label="End" value={toDateStr(r.endDate)} />
                              <div className="col-span-2">
                                <div className="text-xs text-muted-foreground mb-1">
                                  Remarks
                                </div>
                                <div className="text-sm">
                                  {r.remarks || "-"}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/manufactures/${r.id}/edit`);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(r.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function toDateStr(v: any) {
  try {
    if (!v) return "-";
    if (v?.toDate) return v.toDate().toISOString().slice(0, 10);
    if (typeof v === "object" && "seconds" in v)
      return new Date(
        v.seconds * 1000 + Math.floor((v.nanoseconds ?? 0) / 1_000_000)
      )
        .toISOString()
        .slice(0, 10);
    if (typeof v === "string") return v.slice(0, 10);
    return "-";
  } catch {
    return "-";
  }
}
