import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { productsAPI } from "../../Api/firebaseProducts";
import { rawMaterialsAPI } from "../../Api/firebaseRawMaterial";
import generateUUID from "../../Constants/generateUniqueId";
import { sanitizeNumberInput } from "../../Constants/sanitizeNumberInput";
import unitTypes from "../../Constants/unitTypes";

import type {
  ProductMaterialModel,
  ProductModel,
} from "../../Model/ProductModel";
import type { RawMaterialModel } from "../../Model/RawMaterial";

import { Copy, Plus, Trash2 } from "lucide-react";
import currency from "../../Constants/Currency";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Textarea } from "../ui/textarea";
import ToastMSG from "../ui/Toaster";

/* ----------------------------- helpers ----------------------------- */
const toNum = (v: unknown) => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

// Estimated total price = raw + transport + misc + wastage(raw%) + margin(base%)
function estimateTotal(form: Omit<ProductModel, "id">) {
  const raw = toNum(form.totalRawAmount);
  const transport = toNum(form.transport);
  const misc = toNum(form.miscellaneous);
  const wastagePct = toNum(form.wastage);
  const marginPct = toNum(form.margin);

  const marginVal = raw * (marginPct / 100);
  const wastageVal = raw * (wastagePct / 100);
  const base = raw + transport + misc + wastageVal + marginVal;
  return base;
}

/* ------------------------------ component ------------------------------ */
export default function ProductForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Omit<ProductModel, "id">>({
    uid: generateUUID(),
    name: "",
    description: "",
    size: "",
    color: "",
    unitType: "",
    totalRawAmount: 0,
    rawMaterials: [],
    createdAt: {} as any,
    updatedAt: {} as any,
    status: "On-Hold",
    margin: 0,
    transport: 0,
    wastage: 0,
    miscellaneous: 0,
    gst: 0,
  });

  const [allRawMaterials, setAllRawMaterials] = useState<RawMaterialModel[]>(
    []
  );
  const [remarks, setRemarks] = useState<string>("");
  const [newMaterialId, setNewMaterialId] = useState<string[]>([]);

  useEffect(() => {
    rawMaterialsAPI.list().then(setAllRawMaterials);
  }, []);

  // Load existing product if editing
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const data = await productsAPI.get(id);
      if (data) setForm(data);
      setLoading(false);
    })();
  }, [id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Derived total
  const totalAmount = useMemo(() => estimateTotal(form), [form]);

  // Add a blank row (choose existing or create new)
  const addRow = (createNew: boolean = false) => {
    const pm: ProductMaterialModel = {
      id: generateUUID(),
      name: "",
      description: "",
      size: "",
      color: "",
      unitType: "",
      materialId: "",
      quantity: 0,
      estimatedPrice: 0,
      totalAmount: 0,
      gst: 0,
    };
    if (createNew) setNewMaterialId((pre) => [...pre, pm.id]);
    setForm((prev) => ({ ...prev, rawMaterials: [...prev.rawMaterials, pm] }));
  };

  const duplicateRow = (row: ProductMaterialModel) => {
    const clone: ProductMaterialModel = { ...row, id: generateUUID() };
    setForm((prev) => ({
      ...prev,
      rawMaterials: [...prev.rawMaterials, clone],
    }));
  };

  const removeRow = (mid: string) => {
    setForm((prev) => {
      const filtered = prev.rawMaterials.filter((m) => m.id !== mid);
      const totalRawAmount = filtered.reduce(
        (s, m) => s + Number(m.quantity) * Number(m.estimatedPrice),
        0
      );
      return { ...prev, rawMaterials: filtered, totalRawAmount };
    });
  };

  const setRowMaterial = (mid: string, materialId: string) => {
    const material = allRawMaterials.find((m) => m.id === materialId);
    setForm((prev) => {
      let totalRawAmount = 0;
      const rawMaterials = prev.rawMaterials.map((r) => {
        if (r.id !== mid) {
          totalRawAmount += Number(r.quantity) * Number(r.estimatedPrice);
          return r;
        }
        const estimatedPrice = Number(material?.estimatedPrice ?? 0);
        const updated: ProductMaterialModel = {
          ...r,
          name: material?.name || "",
          description: material?.description || "",
          size: material?.size || "",
          color: material?.color || "",
          unitType: material?.unitType || "",
          materialId,
          estimatedPrice,
          totalAmount: Number(r.quantity) * estimatedPrice,
          gst: Number(r.gst || 0),
        };
        totalRawAmount += updated.totalAmount;
        return updated;
      });
      return { ...prev, rawMaterials, totalRawAmount };
    });
  };

  const updateMaterial = (
    mid: string,
    field: keyof ProductMaterialModel,
    rawValue: any
  ) => {
    setForm((prev) => {
      let totalRawAmount = 0;
      const mapped = prev.rawMaterials.map((m) => {
        if (m.id !== mid) {
          totalRawAmount += Number(m.quantity) * Number(m.estimatedPrice);
          return m;
        }
        const next: ProductMaterialModel = { ...m };
        if (field === "quantity")
          next.quantity = sanitizeNumberInput(rawValue) as any;
        else if (field === "estimatedPrice")
          next.estimatedPrice = sanitizeNumberInput(rawValue) as any;
        else if (field === "gst")
          next.gst = sanitizeNumberInput(rawValue) as any;
        else (next as any)[field] = rawValue;

        next.totalAmount = Number(next.quantity) * Number(next.estimatedPrice);
        totalRawAmount += next.totalAmount;
        return next;
      });
      return { ...prev, rawMaterials: mapped, totalRawAmount };
    });
  };

  const canSave =
    form.name.trim() !== "" && form.rawMaterials.length > 0 && !saving;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    setSaving(true);
    try {
      if (isEdit && id) {
        await productsAPI.update(id, form);
        ToastMSG("success", "Product updated");
      } else {
        const fresh = await productsAPI.create(form);
        // logType("CREATE", "product.create", { from: "product", ref: fresh.id, message: "Created new Product", data: fresh });
        ToastMSG("success", "Product created");
      }
      navigate("/products");
    } catch (err) {
      console.error(err);
      ToastMSG("error", "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* SINGLE CARD ONLY */}
      <div className=" p-4 sm:p-6 space-y-4">
        <Card className="overflow-hidden rounded-2xl border shadow-sm">
          {/* Header in the same card */}
          <CardHeader className="py-4 border-b bg-gradient-to-r from-indigo-50 via-sky-50 to-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xl font-semibold">
                  {isEdit ? "Edit Product" : "Create Product"}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Build the cost sheet and production details.
                </p>
              </div>
            </div>
          </CardHeader>

          {/* EVERYTHING else in the same CardContent */}
          <CardContent className="p-5 space-y-6">
            {/* Meta */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold">Style Details</h4>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <Label>Style Name *</Label>
                  <Input
                    type="text"
                    placeholder="Enter style name"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Size</Label>
                  <Input
                    type="text"
                    value={form.size ?? ""}
                    onChange={(e) => handleChange("size", e.target.value)}
                    placeholder="L / 40 / 58in"
                  />
                </div>

                <div>
                  <Label>Color</Label>
                  <Input
                    type="text"
                    placeholder="Blue / Black"
                    value={form.color}
                    onChange={(e) => handleChange("color", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Unit Type</Label>
                  <Select
                    value={form.unitType || ""}
                    onValueChange={(val) => handleChange("unitType", val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitTypes.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>GST (%)</Label>
                  <Input
                    type="text"
                    placeholder="0.00"
                    value={form.gst === 0 ? "" : form.gst}
                    onChange={(e) =>
                      handleChange("gst", sanitizeNumberInput(e.target.value))
                    }
                    inputMode="decimal"
                  />
                </div>

                {/* <div>
                  <Label>Unique ID</Label>
                  <Input
                    type="text"
                    placeholder="Auto"
                    value={form.uid}
                    onChange={(e) => handleChange("uid", e.target.value)}
                  />
                </div> */}
              </div>

              <div className="mt-4">
                <Label>Description</Label>
                <Textarea
                  value={form.description ?? ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Fabric, construction, trims, care, etc."
                  rows={3}
                />
              </div>
            </section>

            <Separator />

            {/* Items */}
            <section>
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="text-sm font-semibold">
                  Items ({form.rawMaterials.length})
                </h4>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => addRow(false)}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Select Material
                  </Button>
                  <Button type="button" onClick={() => addRow(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add New Material
                  </Button>
                </div>
              </div>

              {/* Desktop: Table */}
              <div className="hidden md:block rounded-md border overflow-x-auto">
                <Table className="w-full text-sm">
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>#</TableHead>
                      <TableHead>Material *</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Unit Price *</TableHead>
                      <TableHead>GST %</TableHead>
                      <TableHead>Qty *</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {form.rawMaterials.map((row, index) => {
                      const isNewItem = newMaterialId.includes(row.id);
                      return (
                        <TableRow key={row.id} className="border-t">
                          <TableCell className="px-3 py-2 align-top">
                            {index + 1}
                          </TableCell>

                          <TableCell className="px-3 py-2 align-top min-w-[220px]">
                            {isNewItem ? (
                              <Input
                                value={row.name}
                                onChange={(e) =>
                                  updateMaterial(row.id, "name", e.target.value)
                                }
                                placeholder="Name"
                              />
                            ) : (
                              <Select
                                value={row.materialId}
                                onValueChange={(val) =>
                                  setRowMaterial(row.id, val)
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select raw material" />
                                </SelectTrigger>
                                <SelectContent>
                                  {allRawMaterials.map((m) => (
                                    <SelectItem key={m.id} value={m.id!}>
                                      {m.name} ({m.size}/{m.color})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>

                          <TableCell className="px-3 py-2 align-top">
                            <Textarea
                              value={row.description}
                              onChange={(e) =>
                                updateMaterial(
                                  row.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Notes / specs"
                              disabled={!isNewItem}
                              readOnly={!isNewItem}
                              rows={1}
                            />
                          </TableCell>

                          <TableCell className="px-3 py-2 align-top">
                            <Input
                              value={row.size}
                              onChange={(e) =>
                                updateMaterial(row.id, "size", e.target.value)
                              }
                              placeholder="S / 40 / 58in"
                              disabled={!isNewItem}
                              readOnly={!isNewItem}
                            />
                          </TableCell>

                          <TableCell className="px-3 py-2 align-top">
                            <Input
                              value={row.color}
                              onChange={(e) =>
                                updateMaterial(row.id, "color", e.target.value)
                              }
                              placeholder="Navy / Black"
                              disabled={!isNewItem}
                              readOnly={!isNewItem}
                            />
                          </TableCell>

                          <TableCell className="px-3 py-2 align-top">
                            <Select
                              value={row.unitType || ""}
                              onValueChange={(val) =>
                                updateMaterial(row.id, "unitType", val)
                              }
                              disabled={!isNewItem}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {unitTypes.map((u) => (
                                  <SelectItem key={u} value={u}>
                                    {u}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>

                          <TableCell className="px-3 py-2 align-top text-right min-w-[120px]">
                            <Input
                              className="text-right"
                              value={String(row.estimatedPrice ?? "")}
                              onChange={(e) =>
                                updateMaterial(
                                  row.id,
                                  "estimatedPrice",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              inputMode="decimal"
                              disabled={!isNewItem}
                              readOnly={!isNewItem}
                            />
                          </TableCell>

                          <TableCell className="px-3 py-2 align-top text-right min-w-[90px]">
                            <Input
                              className="text-right"
                              value={String(row.gst === 0 ? "" : row.gst)}
                              onChange={(e) =>
                                updateMaterial(row.id, "gst", e.target.value)
                              }
                              placeholder="0"
                              inputMode="decimal"
                            />
                          </TableCell>

                          <TableCell className="px-3 py-2 align-top text-right min-w-[90px]">
                            <Input
                              className="text-right"
                              value={String(
                                row.quantity === 0 ? "" : row.quantity
                              )}
                              onChange={(e) =>
                                updateMaterial(
                                  row.id,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              placeholder="0"
                              inputMode="decimal"
                            />
                          </TableCell>

                          <TableCell className="px-3 py-2 align-top text-right font-medium">
                            {currency(row.totalAmount)}
                          </TableCell>

                          <TableCell className="px-3 py-2 align-top">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => duplicateRow(row)}
                                className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                                title="Duplicate row"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeRow(row.id)}
                                className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                                title="Delete row"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <div className="bg-blue-50 border-t flex justify-between items-center rounded-b-md">
                  <div className="px-3 py-3 font-medium">Total Materials</div>
                  <div className="px-3 py-3 text-right text-lg font-bold text-blue-700">
                    {currency(form.totalRawAmount)}
                  </div>
                </div>
              </div>

              {/* Mobile: Accordion List */}
              <div className="md:hidden">
                <Accordion type="single" collapsible className="w-full">
                  {form.rawMaterials.map((row, idx) => {
                    const isNewItem = newMaterialId.includes(row.id);
                    return (
                      <AccordionItem
                        key={row.id}
                        value={row.id}
                        className="border rounded-md mb-2"
                      >
                        <AccordionTrigger className="px-3 py-2">
                          <div className="w-full flex items-center justify-between text-left">
                            <div className="text-sm font-medium truncate">
                              {row.name || "Select / New material"}
                            </div>
                            <div className="text-sm font-semibold">
                              {currency(row.totalAmount)}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3">
                          <div className="grid gap-3">
                            <div className="grid gap-1">
                              <Label>Material *</Label>
                              {isNewItem ? (
                                <Input
                                  value={row.name}
                                  onChange={(e) =>
                                    updateMaterial(
                                      row.id,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Name"
                                />
                              ) : (
                                <Select
                                  value={row.materialId}
                                  onValueChange={(val) =>
                                    setRowMaterial(row.id, val)
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select raw material" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {allRawMaterials.map((m) => (
                                      <SelectItem key={m.id} value={m.id!}>
                                        {m.name} ({m.size}/{m.color})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>

                            <div className="grid gap-1">
                              <Label>Description</Label>
                              <Textarea
                                value={row.description}
                                onChange={(e) =>
                                  updateMaterial(
                                    row.id,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="Notes / specs"
                                disabled={!isNewItem}
                                readOnly={!isNewItem}
                                rows={2}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="grid gap-1">
                                <Label>Size</Label>
                                <Input
                                  value={row.size}
                                  onChange={(e) =>
                                    updateMaterial(
                                      row.id,
                                      "size",
                                      e.target.value
                                    )
                                  }
                                  placeholder="S / 40"
                                  disabled={!isNewItem}
                                  readOnly={!isNewItem}
                                />
                              </div>
                              <div className="grid gap-1">
                                <Label>Color</Label>
                                <Input
                                  value={row.color}
                                  onChange={(e) =>
                                    updateMaterial(
                                      row.id,
                                      "color",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Blue"
                                  disabled={!isNewItem}
                                  readOnly={!isNewItem}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="grid gap-1">
                                <Label>Unit</Label>
                                <Select
                                  value={row.unitType || ""}
                                  onValueChange={(val) =>
                                    updateMaterial(row.id, "unitType", val)
                                  }
                                  disabled={!isNewItem}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {unitTypes.map((u) => (
                                      <SelectItem key={u} value={u}>
                                        {u}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-1">
                                <Label>Unit Price *</Label>
                                <Input
                                  value={String(row.estimatedPrice ?? "")}
                                  onChange={(e) =>
                                    updateMaterial(
                                      row.id,
                                      "estimatedPrice",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0.00"
                                  inputMode="decimal"
                                  disabled={!isNewItem}
                                  readOnly={!isNewItem}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="grid gap-1">
                                <Label>GST %</Label>
                                <Input
                                  value={String(row.gst === 0 ? "" : row.gst)}
                                  onChange={(e) =>
                                    updateMaterial(
                                      row.id,
                                      "gst",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                  inputMode="decimal"
                                />
                              </div>
                              <div className="grid gap-1">
                                <Label>Qty *</Label>
                                <Input
                                  value={String(
                                    row.quantity === 0 ? "" : row.quantity
                                  )}
                                  onChange={(e) =>
                                    updateMaterial(
                                      row.id,
                                      "quantity",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                  inputMode="decimal"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <div className="text-sm font-semibold">
                                {currency(row.totalAmount)}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => duplicateRow(row)}
                                  className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                                  title="Duplicate row"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeRow(row.id)}
                                  className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                                  title="Delete row"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>

                <div className="bg-blue-50 border rounded-md mt-2 flex items-center justify-between">
                  <div className="px-3 py-3 font-medium">Total Materials</div>
                  <div className="px-3 py-3 text-right text-lg font-bold text-blue-700">
                    {currency(form.totalRawAmount)}
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Costs & Markups */}
            <section>
              <h4 className="text-sm font-semibold mb-3">Costs & Markups</h4>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <div>
                  <Label>
                    Margin (%) Rs -{" "}
                    {currency(+form.totalRawAmount * (+form.margin / 100))}
                  </Label>
                  <Input
                    type="text"
                    value={form.margin === 0 ? "" : form.margin}
                    onChange={(e) =>
                      handleChange(
                        "margin",
                        sanitizeNumberInput(e.target.value)
                      )
                    }
                    inputMode="decimal"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>Transport</Label>
                  <Input
                    type="text"
                    value={form.transport === 0 ? "" : form.transport}
                    onChange={(e) =>
                      handleChange(
                        "transport",
                        sanitizeNumberInput(e.target.value)
                      )
                    }
                    inputMode="decimal"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>
                    Wastage (%) Rs -{" "}
                    {currency(+form.totalRawAmount * (+form.wastage / 100))}
                  </Label>
                  <Input
                    type="text"
                    value={form.wastage === 0 ? "" : form.wastage}
                    onChange={(e) =>
                      handleChange(
                        "wastage",
                        sanitizeNumberInput(e.target.value)
                      )
                    }
                    inputMode="decimal"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>Miscellaneous</Label>
                  <Input
                    type="text"
                    value={form.miscellaneous === 0 ? "" : form.miscellaneous}
                    onChange={(e) =>
                      handleChange(
                        "miscellaneous",
                        sanitizeNumberInput(e.target.value)
                      )
                    }
                    inputMode="decimal"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="mt-3 rounded-md border bg-blue-50 flex items-center justify-between">
                <div className="px-3 py-3 font-medium">Estimated Total</div>
                <div className="px-3 py-3 text-right text-lg font-bold text-blue-700">
                  {currency(totalAmount)}
                </div>
              </div>
            </section>

            <Separator />

            {/* Remarks */}
            <section>
              <h4 className="text-sm font-semibold mb-3">Remarks</h4>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                placeholder="E.g., priority lot, alternate fabric source…"
              />
            </section>
          </CardContent>
        </Card>
      </div>
      {/* Sticky footer actions (not a card) */}
      <div className="sticky bottom-0 z-10 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t ">
        <div className="w-full flex items-center justify-end gap-2 p-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/products")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!canSave}>
            {saving ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </form>
  );
}
