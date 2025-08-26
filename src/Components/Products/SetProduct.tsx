// components/products/SetProduct.tsx
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import ToastMSG from "../ui/Toaster";

import { materialsAPI } from "../../Api/firebaseRawMaterial";
import type { ProductModel } from "../../Model/ProductModel";
import type {
  RawMaterialModel,
  RawMaterialVariantModel,
} from "../../Model/RawMaterial";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";

// ---- Firestore (products) inline here ----
import { productsAPI } from "../../Api/firebaseProducts";
import currency from "../../Constants/Currency";
import { useLoading } from "../../context/LoadingContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

// Shape saved on Product.rawMaterials (variant + its parent raw material id)
type ProductRawRow = {
  id: string; // variant id
  materialId: string; // raw material doc id (poMaterials)
  size: string;
  color: string;
  quantityOrdered: number;
  quantityUsed: number; // default 0
  unitPrice: number;
  total: number;
};

export default function SetProduct() {
  const { id } = useParams<{ id?: string }>(); // product id if editing
  const navigate = useNavigate();

  // Base fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Raw materials within the product
  const [raws, setRaws] = useState<ProductRawRow[]>([]);

  // Picker dialog state
  const [openPicker, setOpenPicker] = useState(false);
  const [poList, setPoList] = useState<RawMaterialModel[]>([]);
  const [poChosen, setPoChosen] = useState<string>("");
  const [variantChosen, setVariantChosen] = useState<string>("");

  // Load/edit state
  const { setLoading } = useLoading();
  const [submitting, setSubmitting] = useState(false);

  // Fetch raw materials for picker
  useEffect(() => {
    let mounted = true;
    materialsAPI.getAll().then((items) => mounted && setPoList(items));
    return () => {
      mounted = false;
    };
  }, []);

  // If editing, fetch product once
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await productsAPI.get(id);
        if (!data) {
          ToastMSG?.("error", "Product not found");
          navigate("/products");
          return;
        }
        if (mounted) {
          setName(data.name || "");
          setDescription(data.description || "");
          setRaws((data.rawMaterials as unknown as ProductRawRow[]) || []);
        }
      } catch (e) {
        console.error(e);
        ToastMSG?.("error", "Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  const productTotal = useMemo(
    () => raws.reduce((s, r) => s + (r.total || 0), 0),
    [raws]
  );

  const canSubmit =
    name.trim().length > 0 &&
    raws.length > 0 &&
    raws.every((r) => r.id && r.materialId);

  const addRaw = () => setOpenPicker(true);

  const selectedPo = useMemo(
    () => poList.find((m) => m.id === poChosen) ?? null,
    [poChosen, poList]
  );

  const selectedVariant = useMemo(
    () =>
      selectedPo?.variants.find(
        (v: RawMaterialVariantModel) => v.id === variantChosen
      ) ?? null,
    [selectedPo, variantChosen]
  );

  const addRawFromDialog = () => {
    if (!selectedPo || !selectedVariant) return;

    const row: ProductRawRow = {
      id: selectedVariant.id,
      materialId: selectedPo.id,
      size: selectedVariant.size,
      color: selectedVariant.color,
      quantityOrdered: selectedVariant.quantityOrdered,
      quantityUsed: 0,
      unitPrice: selectedVariant.unitPrice,
      total:
        (selectedVariant.total ??
          selectedVariant.quantityOrdered * selectedVariant.unitPrice) ||
        0,
    };

    setRaws((prev) => {
      const idx = prev.findIndex(
        (p) => p.id === row.id && p.materialId === row.materialId
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = row;
        return next;
      }
      return [...prev, row];
    });

    setPoChosen("");
    setVariantChosen("");
    setOpenPicker(false);
  };

  const removeRaw = (i: number) =>
    setRaws((prev) => prev.filter((_, idx) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload: Omit<ProductModel, "id"> = {
      name: name.trim(),
      description: description.trim(),
      rawMaterials: raws as unknown as ProductModel["rawMaterials"],
      createdAt: {} as any,
      updatedAt: {} as any,
    };

    try {
      setSubmitting(true);
      if (id) {
        await productsAPI.update(id, {
          name: payload.name,
          description: payload.description,
          rawMaterials: payload.rawMaterials,
        });
        ToastMSG?.("success", "Product updated");
        navigate(`/products/${id}`);
      } else {
        const ref = await productsAPI.create({
          name: payload.name,
          description: payload.description,
          rawMaterials: payload.rawMaterials,
        });
        ToastMSG?.("success", "Product created");
        navigate(`/products/${ref.id}`);
      }
    } catch (err) {
      console.error("Save product failed:", err);
      ToastMSG?.("error", "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{id ? "Update " : "Create "} Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <Input
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description"
              />
            </div>
            {
              <>
                <div className="flex items-center justify-between ">
                  <div>Raw Materials</div>
                  <Dialog open={openPicker} onOpenChange={setOpenPicker}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="default" onClick={addRaw}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Raw Material
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-xl">
                      <DialogHeader>
                        <DialogTitle>Select Raw Material & Variant</DialogTitle>
                      </DialogHeader>

                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label>Raw Material</Label>
                          <Select value={poChosen} onValueChange={setPoChosen}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose raw material" />
                            </SelectTrigger>
                            <SelectContent>
                              {poList.map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                  {m.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedPo ? (
                          <div className="grid gap-2">
                            <Label>Variant</Label>
                            <Select
                              value={variantChosen}
                              onValueChange={setVariantChosen}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose variant (size/color)" />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedPo.variants.map((v) => (
                                  <SelectItem key={v.id} value={v.id}>
                                    {v.size} / {v.color} — Qty:{" "}
                                    {v.quantityOrdered} ×{" "}
                                    {currency(v.unitPrice)} =
                                    {currency(
                                      v.total || v.quantityOrdered * v.unitPrice
                                    )}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : null}
                      </div>

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setOpenPicker(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={addRawFromDialog}
                          disabled={!selectedVariant}
                        >
                          Add
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="grid gap-3">
                  {raws.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No raw materials added.
                    </p>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[60px]">#</TableHead>
                            <TableHead>Variant</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead className="w-[50px] text-center">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {raws.map((r, i) => (
                            <TableRow key={`${r.materialId}-${r.id}-${i}`}>
                              <TableCell className="font-medium">
                                {i + 1}
                              </TableCell>
                              <TableCell>
                                {r.size}/{r.color}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={r.unitPrice}
                                  onChange={(e) => {
                                    const price =
                                      parseFloat(e.target.value) || 0;
                                    setRaws((prev) =>
                                      prev.map((item, idx) =>
                                        idx === i
                                          ? {
                                              ...item,
                                              unitPrice: price,
                                              total:
                                                item.quantityOrdered * price,
                                            }
                                          : item
                                      )
                                    );
                                  }}
                                  className="w-28"
                                  min={0}
                                  step="0.01"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={r.quantityOrdered}
                                  onChange={(e) => {
                                    const qty = parseFloat(e.target.value) || 0;
                                    setRaws((prev) =>
                                      prev.map((item, idx) =>
                                        idx === i
                                          ? {
                                              ...item,
                                              quantityOrdered: qty,
                                              total: qty * item.unitPrice,
                                            }
                                          : item
                                      )
                                    );
                                  }}
                                  className="w-24"
                                  min={0}
                                />
                              </TableCell>

                              <TableCell className="font-semibold">
                                {currency(r.total)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeRaw(i)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <Separator />
                      <div className="flex justify-end text-sm mt-2">
                        <div className="rounded-lg border px-3 py-1">
                          Total:{" "}
                          <span className="font-bold">
                            {currency(productTotal)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            }
            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={!canSubmit || submitting}>
                {submitting
                  ? "Saving..."
                  : id
                  ? "Update Product"
                  : "Create Product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
