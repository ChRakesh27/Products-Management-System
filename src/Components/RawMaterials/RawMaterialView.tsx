import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { materialsAPI } from "../../Api/firebaseRawMaterial";
import currency from "../../Constants/Currency";
import type { RawMaterialModel } from "../../Model/RawMaterial";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export function RawMaterialView() {
  const nav = useNavigate();
  const { id } = useParams();
  const [item, setItem] = useState<RawMaterialModel | null>(null);

  useEffect(() => {
    if (!id) return;
    materialsAPI.get(id).then(setItem);
  }, [id]);

  if (!item) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => nav(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => nav(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {/* <Button
          variant="outline"
          onClick={() => nav(`/materials/${item.id}/edit`)}
        >
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </Button> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{item.name}</span>
            <span className="text-base font-normal text-muted-foreground">
              Total:{" "}
              <span className="font-semibold text-foreground">
                {currency(item.total)}
              </span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{item.description}</p>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Size</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="text-right">Total Qty</TableHead>
                  <TableHead className="text-right">Used Qty</TableHead>
                  <TableHead className="text-right">Current Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{item.size}</TableCell>
                  <TableCell>{item.color}</TableCell>
                  <TableCell className="text-right">
                    {item.quantityOrdered}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.quantityUsed || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    {(item.quantityOrdered || 0) - (item.quantityUsed || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {currency(item.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {currency(item.total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
