import { ArrowRight, Plus, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { vendorsAPI } from "../../Api/firebaseVendor";
import type { VendorModel } from "../../Model/VendorModel";
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

export function VendorList() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<VendorModel[]>([]);

  useEffect(() => {
    vendorsAPI.list().then(setItems);
  }, []);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return items.filter((v) =>
      [v.name, v.email, v.phone, v.address, v.pinCode, v.state, v.gstNumber]
        .filter(Boolean as any)
        .some((x) => String(x).toLowerCase().includes(s))
    );
  }, [items, q]);

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <UsersRound className="h-6 w-6" /> Vendors
        </h1>
        <Button onClick={() => nav("/vendors/new")}>
          {" "}
          <Plus className="mr-2 h-4 w-4" /> Add Vendor
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">All vendors</CardTitle>
          <div className="w-full max-w-xs">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, phone…"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[24%]">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>GST</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>{v.email}</TableCell>
                    <TableCell>
                      {v.phone || <Badge variant="secondary">—</Badge>}
                    </TableCell>
                    <TableCell>{v.state || "—"}</TableCell>
                    <TableCell>{v.gstNumber || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => nav(`/vendors/${v.id}`)}
                      >
                        View <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No vendors found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
