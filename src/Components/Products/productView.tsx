// pages/products/ProductViewPage.tsx
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { ProductModel } from "../../Model/ProductModel";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type PDoc = ProductModel & { id: string; totalAmount: number };

export default function ProductView() {
  const { id } = useParams();
  const [item, setItem] = useState<PDoc | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   let mounted = true;
  //   (async () => {
  //     if (!id) return;
  //     const doc = await productsAPI.get(id);
  //     if (mounted) setItem(doc);
  //     setLoading(false);
  //   })();
  //   return () => {
  //     mounted = false;
  //   };
  // }, [id]);

  if (loading) {
    return <div className="max-w-4xl mx-auto">Loading...</div>;
  }
  if (!item) {
    return <div className="max-w-4xl mx-auto">Not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{item.name}</h2>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/products">Back</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={`/products/${id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div>
            <span className="text-sm text-muted-foreground">Description</span>
            <p className="font-medium">{item.description || "-"}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <div className="rounded border px-2 py-1 font-semibold">
              ₹{item.totalAmount.toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Raw Materials</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {item.rawMaterials?.length ? (
            item.rawMaterials.map((r, idx) => (
              <div
                key={`${r.id}-${idx}`}
                className="rounded-lg border p-3 grid gap-1"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">RM #{idx + 1}</div>
                  <Badge variant="outline">
                    {r.size}/{r.color}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Qty: <span className="font-medium">{r.quantity}</span> × ₹
                  {r.unitPrice} ={" "}
                  <span className="font-semibold text-foreground">
                    ₹{r.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No raw materials.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
