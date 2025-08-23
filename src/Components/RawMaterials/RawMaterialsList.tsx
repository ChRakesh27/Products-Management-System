import { ArrowRight, PackageSearch, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { materialsAPI } from "../../Api/firebaseRawMaterial";
import currency from "../../Constants/Currency";
import type { RawMaterialModel } from "../../Model/RawMaterial";
import { Badge } from "../ui/badge";
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

export const sumProduct = (p: RawMaterialModel) =>
  p.variants.reduce(
    (s, v) => s + (Number(v.quantityOrdered) || 0) * (Number(v.unitPrice) || 0),
    0
  );

export default function RawMaterialsList() {
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<RawMaterialModel[]>([]);

  useEffect(() => {
    materialsAPI.getAll().then(setItems);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [items, search]);

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Raw Materials</h1>
        <Button onClick={() => nav("/materials/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Material
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">All items</CardTitle>
          <div className="w-full max-w-xs">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or description…"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-center text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <PackageSearch className="h-8 w-8" />
                <p>No materials found.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Variants</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="truncate max-w-[300px]">
                        {p.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{p.variants.length}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {currency(sumProduct(p))}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => nav(`/materials/${p.id}`)}
                        >
                          View <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
