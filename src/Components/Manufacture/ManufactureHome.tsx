// src/components/manufactures/ManufactureList.tsx
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import ToastMSG from "../ui/Toaster";

export default function ManufactureHome() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ManufactureModel[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const list = await manufacturesAPI.getAll();
      setRows(list);
    })();
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
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex items-center justify-between gap-4">
          <CardTitle>Manufactures</CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Search by product or remarks…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-64"
            />
            <Button onClick={() => navigate("/manufactures/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PoNumber</TableHead>
                <TableHead>Planned Units</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    No manufactures found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow
                    key={r.id}
                    onClick={() => {
                      navigate(`/manufactures/${r.id}`);
                    }}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">{r.poNo}</TableCell>
                    <TableCell>{r.planedUnits}</TableCell>
                    <TableCell>{toDateStr(r.startDate)}</TableCell>
                    <TableCell>{toDateStr(r.endDate)}</TableCell>
                    <TableCell className="truncate max-w-[320px]">
                      {r.remarks}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/manufactures/${r.id}/edit`);
                        }}
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
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function toDateStr(v: any) {
  try {
    if (!v) return "-";
    if (v?.toDate) return v.toDate().toISOString().slice(0, 10);
    if (typeof v === "object" && "seconds" in v)
      return new Date(v.seconds * 1000 + Math.floor(v.nanoseconds / 1_000_000))
        .toISOString()
        .slice(0, 10);
    if (typeof v === "string") return v.slice(0, 10);
    return "-";
  } catch {
    return "-";
  }
}
