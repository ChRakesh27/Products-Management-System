import { ArrowLeft, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productsAPI } from "../../Api/firebaseProducts";
import type { productModel } from "../../Model/Product";
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
import { currency, sumProduct } from "./ProductsList";

export function ProductView() {
  const nav = useNavigate();
  const { id } = useParams();
  const [item, setItem] = useState<productModel | null>(null);

  useEffect(() => {
    if (!id) return;
    productsAPI.get(id).then(setItem);
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

  const total = sumProduct(item);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => nav(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          variant="outline"
          onClick={() => nav(`/products/${item.id}/edit`)}
        >
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{item.name}</span>
            <span className="text-base font-normal text-muted-foreground">
              Total:{" "}
              <span className="font-semibold text-foreground">
                {currency(total)}
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
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.variants.map((v, i) => (
                  <TableRow key={i}>
                    <TableCell>{v.size}</TableCell>
                    <TableCell>{v.color}</TableCell>
                    <TableCell className="text-right">
                      {v.quantityOrdered}
                    </TableCell>
                    <TableCell className="text-right">
                      {currency(v.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {currency(
                        (Number(v.quantityOrdered) || 0) *
                          (Number(v.unitPrice) || 0)
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
