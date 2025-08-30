// components/products/SetProduct.tsx
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { productsAPI } from "../../Api/firebaseProducts";
import { materialsAPI } from "../../Api/firebaseRawMaterial";
import currency from "../../Constants/Currency";
import DateFormate from "../../Constants/DateFormate";
import { sanitizeNumberInput } from "../../Constants/sanitizeNumberInput";
import { useLoading } from "../../context/LoadingContext";
import type {
  ProductModel,
  ProductRawMaterialModel,
} from "../../Model/ProductModel";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ToastMSG from "../ui/Toaster";

export default function SetProduct() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const [formData, setFormData] = useState<ProductModel>({
    name: "",
    description: "",
    size: "",
    color: "",
    total: 0,
    totalRaw: 0,
    unitPrice: 0,
    unitType: "",
    rawMaterials: [],
    quantityOrdered: 0,
    productionQty: 0,
    poNumber: "",
  });
  const [rawList, setRawList] = useState([]);
  const [openPicker, setOpenPicker] = useState(false);
  const [selectedRawMaterialId, setSelectedRawMaterialId] = useState<string>();

  // Load raw materials
  useEffect(() => {
    let mounted = true;
    materialsAPI.getAll().then((items) => mounted && setRawList(items));
    return () => {
      mounted = false;
    };
  }, []);

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
        setFormData(data);
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

  // Raw-material row edits
  const updateRawCell = (
    index: number,
    field: keyof ProductRawMaterialModel,
    value: string | number
  ) => {
    setFormData((prev) => {
      const next = [...prev.rawMaterials];
      const rm = { ...next[index], [field]: value } as ProductRawMaterialModel;
      const qty = Number(field === "quantity" ? value : rm.quantity) || 0;
      let totalRaw = prev.totalRaw - rm.total;
      rm.total = qty * rm.unitPrice;
      totalRaw += rm.total;
      next[index] = rm;
      return { ...prev, rawMaterials: next, totalRaw };
    });
  };

  const addRawFromDialog = () => {
    const selectedRawMaterial = rawList.find(
      (r) => r.id == selectedRawMaterialId
    );
    const newRM: ProductRawMaterialModel = {
      id: selectedRawMaterial.id, // variant id
      name: selectedRawMaterial.name,
      description: selectedRawMaterial.description,
      poNumber: selectedRawMaterial.poNumber,
      size: selectedRawMaterial.size,
      color: selectedRawMaterial.color,
      unitType: selectedRawMaterial.unitType,
      unitPrice: selectedRawMaterial.unitPrice,
      quantity: 1,
      total: selectedRawMaterial.unitPrice,
    };
    setFormData((pre) => ({
      ...pre,
      rawMaterials: [...pre.rawMaterials, newRM],
      totalRaw: pre.totalRaw + newRM.total,
    }));
    setOpenPicker(false);
  };

  // Validation
  const canSubmit = formData.name.trim().length > 0;

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setLoading(true);
      if (id) {
        await productsAPI.update(id, formData);
        ToastMSG?.("success", "Product updated");
      } else {
        const ref = await productsAPI.create(formData);
        ToastMSG?.("success", "Product created");
        navigate(`/products/${ref.id}`);
      }
    } catch (err) {
      console.error("Save product failed:", err);
      ToastMSG?.("error", "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
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
        <CardHeader className="border-b">
          <CardTitle>{id ? "Update" : "Create"} Product</CardTitle>
        </CardHeader>
        <div className="flex justify-between">
          <div className="w-[75%] border-r">
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-6">
                {/* Basic */}
                <div className="grid gap-2">
                  <Label htmlFor="name">Product Name *</Label>
                  {formData.name}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1 block">Size</Label>
                    {formData.size}
                  </div>
                  <div>
                    <Label className="mb-1 block">Color</Label>
                    {formData.color}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="desc">Description</Label>
                  {formData.description}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Price</Label>
                  {formData.unitPrice}
                </div>

                <div className=" space-y-4">
                  {/* Raw materials header */}
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Raw Materials</div>
                    <Dialog open={openPicker} onOpenChange={setOpenPicker}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          // onClick={() => openAddRawForVariant(v.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Raw Material
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xl">
                        <DialogHeader>
                          <DialogTitle>
                            Select Raw Material & Variant
                          </DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label>Raw Material</Label>
                            <Select
                              value={selectedRawMaterialId}
                              onValueChange={setSelectedRawMaterialId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose raw material" />
                              </SelectTrigger>
                              <SelectContent>
                                {rawList.map((m) => (
                                  <SelectItem key={m.id} value={m.id}>
                                    {m.name}
                                    {" -> "} {m.size}
                                    {" / "}
                                    {m.color}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
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
                            disabled={!selectedRawMaterialId}
                          >
                            Add
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Raw materials table for this variant */}
                  <div className="grid gap-3">
                    {formData.rawMaterials.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No raw materials added for this variant.
                      </p>
                    ) : (
                      <>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[60px]">#</TableHead>
                              <TableHead>materials</TableHead>
                              <TableHead>Unit Price</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead className="w-[50px] text-center">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {formData.rawMaterials.map((rm, i) => (
                              <TableRow key={`${rm.id}-${i}`}>
                                <TableCell className="font-medium">
                                  {i + 1}
                                </TableCell>
                                <TableCell>
                                  {rm.name}
                                  {" -> "}
                                  {rm.size}/{rm.color}
                                </TableCell>
                                <TableCell>{rm.unitPrice}</TableCell>
                                <TableCell>
                                  <Input
                                    type="text"
                                    value={rm.quantity}
                                    className="w-24"
                                    min={0}
                                    onChange={(e) =>
                                      updateRawCell(
                                        i,
                                        "quantity",
                                        sanitizeNumberInput(e.target.value) || 0
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell className="font-semibold">
                                  {currency(
                                    rm.total ?? rm.quantity * rm.unitPrice
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <Separator />
                      </>
                    )}
                  </div>
                </div>

                {/* Product total & submit */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-between gap-2">
                    <div className="rounded-lg border px-3 py-2 text-sm">
                      Product Total:{" "}
                      <span className="font-bold">
                        {currency(formData.unitPrice)}
                      </span>
                    </div>
                    <div className="rounded-lg border px-3 py-2 text-sm">
                      Material Total:{" "}
                      <span className="font-bold">
                        {currency(formData.totalRaw)}
                      </span>
                    </div>
                    <div className="rounded-lg border px-3 py-2 text-sm">
                      Profit:{" "}
                      <span className="font-bold">
                        {currency(formData.unitPrice - formData.totalRaw)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate("/products")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!canSubmit}>
                      {id ? "Update Product" : "Create Product"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </div>
          <div className="w-[25%]">
            <div className="grid grid-cols-2 px-6">
              <div className="">Po Number :</div>
              <div className="">{formData.poNumber}</div>
              <div className="">Delivery Date :</div>
              <div className="">{DateFormate(formData.deliveryDate)}</div>
              <div className="">Ordered Qty :</div>
              <div className="">{formData.quantityOrdered}</div>
              <div className="">Production Qty :</div>
              <div className="">{formData.productionQty}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
