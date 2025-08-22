import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productsAPI, type ProductCreate } from "../../Api/firebaseProducts";
import type { VariantModel } from "../../Model/Product";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

const currency = (n: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n || 0);

const emptyVariant = (): VariantModel => ({
  size: "",
  color: "",
  quantityOrdered: 0,
  unitPrice: 0,
  total: 0,
});

export default function SetProduct() {
  const nav = useNavigate();
  const { id } = useParams(); // if present => edit mode

  const isEdit = Boolean(id);
  const [loading, setLoading] = useState<boolean>(!!id);
  const [saving, setSaving] = useState<boolean>(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [variants, setVariants] = useState<VariantModel[]>([emptyVariant()]);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const item = await productsAPI.get(id);
        if (item) {
          setName(item.name || "");
          setDescription(item.description || "");
          setVariants(
            item.variants?.length
              ? item.variants.map((v) => ({
                  size: v.size || "",
                  color: v.color || "",
                  quantityOrdered: Number(v.quantityOrdered) || 0,
                  unitPrice: Number(v.unitPrice) || 0,
                  total:
                    (Number(v.quantityOrdered) || 0) *
                    (Number(v.unitPrice) || 0),
                }))
              : [emptyVariant()]
          );
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const updateVariant = (
    i: number,
    field: keyof VariantModel,
    val: string | number
  ) => {
    setVariants((prev) =>
      prev.map((v, idx) => {
        if (idx !== i) return v;
        const next = {
          ...v,
          [field]:
            field === "quantityOrdered" || field === "unitPrice"
              ? Number(val) || 0
              : val,
        } as VariantModel;
        next.total =
          (Number(next.quantityOrdered) || 0) * (Number(next.unitPrice) || 0);
        return next;
      })
    );
  };

  const addVariant = () => setVariants((p) => [...p, emptyVariant()]);
  const removeVariant = (i: number) =>
    setVariants((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : p));

  const grandTotal = useMemo(
    () =>
      variants.reduce(
        (s, v) =>
          s + (Number(v.quantityOrdered) || 0) * (Number(v.unitPrice) || 0),
        0
      ),
    [variants]
  );

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (isEdit && id) {
        await productsAPI.update(id, {
          name: name.trim(),
          description: description.trim(),
          variants: variants.map((v) => ({
            size: v.size,
            color: v.color,
            quantityOrdered: Number(v.quantityOrdered) || 0,
            unitPrice: Number(v.unitPrice) || 0,
            total:
              (Number(v.quantityOrdered) || 0) * (Number(v.unitPrice) || 0),
          })),
        });
        nav(`/products/${id}`);
      } else {
        const payload: ProductCreate = {
          name: name.trim(),
          description: description.trim(),
          variants: variants.map((v) => ({
            size: v.size,
            color: v.color,
            quantityOrdered: Number(v.quantityOrdered) || 0,
            unitPrice: Number(v.unitPrice) || 0,
            total:
              (Number(v.quantityOrdered) || 0) * (Number(v.unitPrice) || 0),
          })),
        };
        const saved = await productsAPI.create(payload);
        nav(`/products/${saved.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => nav(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="text-sm text-muted-foreground">
          {isEdit ? "Edit" : "Create"} Product
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit product" : "New product"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="T-shirt"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea
                    id="desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description…"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium">Variants</h3>
                  <Button variant="secondary" onClick={addVariant}>
                    <Plus className="mr-2 h-4 w-4" /> Add Variant
                  </Button>
                </div>

                <div className="space-y-3">
                  {variants.map((v, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 md:grid-cols-6 gap-3 rounded-md border p-3"
                    >
                      <div className="grid gap-1">
                        <Label>Size</Label>
                        <Input
                          value={v.size}
                          onChange={(e) =>
                            updateVariant(i, "size", e.target.value)
                          }
                          placeholder="S / M / L"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label>Color</Label>
                        <Input
                          value={v.color}
                          onChange={(e) =>
                            updateVariant(i, "color", e.target.value)
                          }
                          placeholder="Red"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label>Qty</Label>
                        <Input
                          type="number"
                          value={v.quantityOrdered}
                          onChange={(e) =>
                            updateVariant(i, "quantityOrdered", e.target.value)
                          }
                          min={0}
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={v.unitPrice}
                          onChange={(e) =>
                            updateVariant(i, "unitPrice", e.target.value)
                          }
                          min={0}
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label>Total</Label>
                        <div className="h-10 rounded-md border bg-muted px-3 flex items-center justify-end font-medium">
                          {currency(v.total)}
                        </div>
                      </div>
                      <div className="flex items-end justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariant(i)}
                          disabled={variants.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end text-sm text-muted-foreground">
                  Subtotal:{" "}
                  <span className="ml-2 font-medium text-foreground">
                    {currency(grandTotal)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => nav(-1)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
                  {isEdit ? "Save changes" : "Create"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
