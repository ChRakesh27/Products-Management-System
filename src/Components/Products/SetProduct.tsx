// components/products/SetProduct.tsx
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import ToastMSG from "../ui/Toaster";

import { materialsAPI } from "../../Api/firebaseRawMaterial";
import type { ProductModel, variantModel } from "../../Model/ProductModel";
import type { RawMaterialVariantModel } from "../../Model/RawMaterial";
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

import { productsAPI } from "../../Api/firebaseProducts";
import currency from "../../Constants/Currency";
import generateUUID from "../../Constants/generateUniqueId";
import { useLoading } from "../../context/LoadingContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const emptyVariant = (): variantModel & {
  totalRaw: number;
} => ({
  id: generateUUID(),
  size: "",
  color: "",
  quantityOrdered: 0,
  unitPrice: 0,
  total: 0,
  totalRaw: 0,
  rawMaterials: [],
});

export default function SetProduct() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { setLoading } = useLoading();

  // Product fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [variants, setVariants] = useState([emptyVariant()]);
  const [submitting, setSubmitting] = useState(false);

  // Raw material picker state
  const [openPicker, setOpenPicker] = useState(false);
  const [activeVariantId, setActiveVariantId] = useState<string>(""); // which variant we add to
  const [rawList, setRawList] = useState([]);
  const [rawChosen, setRawChosen] = useState<string>("");
  const [rawVariantChosen, setRawVariantChosen] = useState<string>("");

  // Load raw materials
  useEffect(() => {
    let mounted = true;
    materialsAPI.getAll().then((items) => mounted && setRawList(items));
    return () => {
      mounted = false;
    };
  }, []);

  // If editing, fetch product
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
          // ensure variants shape
          const v = (data.variants ?? []).map((vv) => ({
            ...vv,
            rawMaterials: vv.rawMaterials ?? [],
            totalRaw:
              (vv.rawMaterials ?? []).reduce(
                (s, rm) => s + (rm.total ?? rm.quantityOrdered * rm.unitPrice),
                0
              ) || 0,
          }));
          setVariants(v.length ? v : [emptyVariant()]);
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
  }, [id, navigate, setLoading]);

  // Picker computed selections
  const selectedRaw = useMemo(
    () => rawList.find((m) => m.id === rawChosen) ?? null,
    [rawChosen, rawList]
  );
  const selectedRawVariant = useMemo(
    () =>
      selectedRaw?.variants.find(
        (v: RawMaterialVariantModel) => v.id === rawVariantChosen
      ) ?? null,
    [selectedRaw, rawVariantChosen]
  );

  // Totals
  const productTotal = useMemo(
    () => variants.reduce((sum, v) => sum + (v.total || 0), 0),
    [variants]
  );

  // Validation
  const canSubmit =
    name.trim().length > 0 &&
    variants.length > 0 &&
    variants.every((v) => v.size.trim() && v.color.trim());

  // Handlers: variants
  const addVariant = () => {
    setVariants((prev) => [...prev, emptyVariant()]);
  };
  const removeVariant = (variantId: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
  };
  const updateVariantField = (
    variantId: string,
    field: keyof variantModel,
    value: string | number
  ) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, [field]: value } : v))
    );
  };

  // Handlers: raw materials per variant
  const openAddRawForVariant = (variantId: string) => {
    setActiveVariantId(variantId);
    setRawChosen("");
    setRawVariantChosen("");
    setOpenPicker(true);
  };

  const addRawFromDialog = () => {
    if (!activeVariantId || !selectedRaw || !selectedRawVariant) return;

    const newRM: RawMaterialVariantModel & {
      totalRaw: number;
    } = {
      id: selectedRawVariant.id, // variant id
      materialId: selectedRaw.id, // raw material doc id
      size: selectedRawVariant.size,
      color: selectedRawVariant.color,
      quantityOrdered: selectedRawVariant.quantityOrdered,
      quantityUsed: 0,
      unitPrice: selectedRawVariant.unitPrice,
      total: selectedRawVariant.total,
      totalRaw:
        (selectedRawVariant.total ??
          selectedRawVariant.quantityOrdered * selectedRawVariant.unitPrice) ||
        0,
    };

    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== activeVariantId) return v;
        // if same (materialId, id) exists, replace
        const idx = v.rawMaterials.findIndex(
          (rm) => rm.id === newRM.id && rm.materialId === newRM.materialId
        );
        const nextRM =
          idx >= 0
            ? v.rawMaterials.map((rm, i) => (i === idx ? newRM : rm))
            : [...v.rawMaterials, newRM];

        const newTotal =
          nextRM.reduce(
            (s, rm) => s + (rm.total ?? rm.quantityOrdered * rm.unitPrice),
            0
          ) || 0;

        return { ...v, rawMaterials: nextRM, totalRaw: newTotal };
      })
    );

    setOpenPicker(false);
  };

  const removeRawFromVariant = (variantId: string, index: number) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) return v;
        const nextRM = v.rawMaterials.filter((_, i) => i !== index);
        const newTotal =
          nextRM.reduce(
            (s, rm) => s + (rm.total ?? rm.quantityOrdered * rm.unitPrice),
            0
          ) || 0;
        return { ...v, rawMaterials: nextRM, totalRaw: newTotal };
      })
    );
  };

  const updateRawCell = (
    variantId: string,
    index: number,
    field: keyof RawMaterialVariantModel,
    value: number
  ) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) return v;
        const nextRM = v.rawMaterials.map((rm, i) => {
          if (i !== index) return rm;
          const updated: RawMaterialVariantModel = {
            ...rm,
            [field]: value,
          } as any;
          // recalc line total
          const qty = Number(
            field === "quantityOrdered" ? value : updated.quantityOrdered
          );
          const price = Number(
            field === "unitPrice" ? value : updated.unitPrice
          );
          updated.total = (qty || 0) * (price || 0);
          return updated;
        });
        const newTotal =
          nextRM.reduce(
            (s, r) => s + (r.total ?? r.quantityOrdered * r.unitPrice),
            0
          ) || 0;
        return { ...v, rawMaterials: nextRM, totalRaw: newTotal };
      })
    );
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload: Omit<ProductModel, "id"> = {
      name: name.trim(),
      description: description.trim(),
      variants,
      createdAt: undefined,
      updatedAt: undefined,
      poNumber: undefined,
    };

    try {
      setSubmitting(true);
      if (id) {
        await productsAPI.update(id, {
          name: payload.name,
          description: payload.description,
          variants: payload.variants,
        });
        ToastMSG?.("success", "Product updated");
        navigate(`/products/${id}`);
      } else {
        const ref = await productsAPI.create({
          name: payload.name,
          description: payload.description,
          variants: payload.variants,
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
          <CardTitle>{id ? "Update" : "Create"} Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            {/* Basic */}
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

            {/* Variants */}
            <div className="flex justify-between items-center">
              <div className="font-medium">Variants</div>
              <Button type="button" onClick={addVariant}>
                <Plus className="h-4 w-4 mr-2" />
                Add Variant
              </Button>
            </div>

            {variants.map((v) => (
              <div key={v.id} className="rounded-lg border p-4 space-y-4">
                {/* Variant basic fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="mb-1 block">Size *</Label>
                    <Input
                      value={v.size}
                      onChange={(e) =>
                        updateVariantField(v.id, "size", e.target.value)
                      }
                      placeholder="S, M, L, XL"
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block">Color *</Label>
                    <Input
                      value={v.color}
                      onChange={(e) =>
                        updateVariantField(v.id, "color", e.target.value)
                      }
                      placeholder="Color"
                    />
                  </div>
                  <div className="">
                    <div className="flex items-end justify-between gap-2">
                      <div className="text-sm text-muted-foreground">
                        po Total:
                      </div>
                      <div className="font-semibold">{currency(v.total)}</div>
                    </div>
                    <div className="flex items-end justify-between gap-2">
                      <div className="text-sm text-muted-foreground">
                        Variant Total:
                      </div>
                      <div className="font-semibold">
                        {currency(v.totalRaw)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Raw materials header */}
                <div className="flex items-center justify-between">
                  <div className="font-medium">Raw Materials</div>
                  <Dialog open={openPicker} onOpenChange={setOpenPicker}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        onClick={() => openAddRawForVariant(v.id)}
                      >
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
                          <Select
                            value={rawChosen}
                            onValueChange={setRawChosen}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose raw material" />
                            </SelectTrigger>
                            <SelectContent>
                              {rawList.map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                  {m.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedRaw ? (
                          <div className="grid gap-2">
                            <Label>Variant</Label>
                            <Select
                              value={rawVariantChosen}
                              onValueChange={setRawVariantChosen}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose variant (size/color)" />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedRaw.variants.map((rv) => (
                                  <SelectItem key={rv.id} value={rv.id}>
                                    {rv.size} / {rv.color} — Qty:{" "}
                                    {rv.quantityOrdered} ×{" "}
                                    {currency(rv.unitPrice)} ={" "}
                                    {currency(
                                      rv.total ||
                                        rv.quantityOrdered * rv.unitPrice
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
                          disabled={!selectedRawVariant}
                        >
                          Add
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Raw materials table for this variant */}
                <div className="grid gap-3">
                  {v.rawMaterials.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No raw materials added for this variant.
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
                          {v.rawMaterials.map((rm, i) => (
                            <TableRow key={`${rm.materialId}-${rm.id}-${i}`}>
                              <TableCell className="font-medium">
                                {i + 1}
                              </TableCell>
                              <TableCell>
                                {rm.size}/{rm.color}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={rm.unitPrice}
                                  onChange={(e) =>
                                    updateRawCell(
                                      v.id,
                                      i,
                                      "unitPrice",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-28"
                                  min={0}
                                  step="0.01"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={rm.quantityOrdered}
                                  onChange={(e) =>
                                    updateRawCell(
                                      v.id,
                                      i,
                                      "quantityOrdered",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-24"
                                  min={0}
                                />
                              </TableCell>

                              <TableCell className="font-semibold">
                                {currency(
                                  rm.total ?? rm.quantityOrdered * rm.unitPrice
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeRawFromVariant(v.id, i)}
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
                          Variant Total:{" "}
                          <span className="font-bold">{currency(v.total)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Remove variant button */}
                {variants.length > 1 ? (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeVariant(v.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Variant
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}

            {/* Product total & submit */}
            <div className="flex items-center justify-between">
              <div className="rounded-lg border px-3 py-2 text-sm">
                Product Total:{" "}
                <span className="font-bold">{currency(productTotal)}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/products")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!canSubmit || submitting}>
                  {submitting
                    ? "Saving..."
                    : id
                    ? "Update Product"
                    : "Create Product"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
