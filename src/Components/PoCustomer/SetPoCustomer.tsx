import { Timestamp } from "firebase/firestore";
import { Copy, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { poReceivedAPI } from "../../Api/firebasePOsReceived";
import { productsAPI } from "../../Api/firebaseProducts";
import { vendorsAPI } from "../../Api/firebaseVendor";
import currency from "../../Constants/Currency";
import currencyList from "../../Constants/CurrencyList";
import generateUUID from "../../Constants/generateUniqueId";
import { sanitizeNumberInput } from "../../Constants/sanitizeNumberInput";
import unitTypes from "../../Constants/unitTypes";
import { useLoading } from "../../context/LoadingContext";
import type { TimestampModel } from "../../Model/Date";
import type { POReceivedModel } from "../../Model/POEntry";
import type { ProductModel } from "../../Model/ProductModel";
import type { PartnerModel } from "../../Model/VendorModel";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DatePicker } from "../ui/DatePicker";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { PartiesSelection } from "../ui/PartiesSelection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import ToastMSG from "../ui/Toaster";

/* ---------------- helpers ---------------- */

const toNum = (v: unknown) => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const emptyProduct = (data: any = {}) => ({
  id: data.id || generateUUID(),
  name: data.name || "",
  description: data.description || "",
  sizeQty: data.sizeQty || [],
  color: data.color || "",
  unitType: data.unitType || "",
  quantityOrdered: data.quantityOrdered || 0,
  productionQty: data.productionQty || 0,
  unitPrice: data.unitPrice || 0,
  gst: data.gst || 0,
  totalAmount: data.totalAmount || 0,
  rawMaterials: data.rawMaterials || [],
});

const nowTs = () => Timestamp.now() as unknown as TimestampModel;

/* ---------------- component ---------------- */

function SetPoCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setLoading } = useLoading();

  const [products, setProducts] = useState<ProductModel[]>([]);
  const [parties, setParties] = useState<PartnerModel[]>([]);

  // per-line size/qty drafts keyed by product row id
  const [sizeDrafts, setSizeDrafts] = useState<
    Record<string, { size: string; quantity: number }>
  >({});

  const [newPOForm, setNewPOForm] = useState<POReceivedModel>({
    supplier: null,
    currency: { code: "INR", name: "Indian Rupee", symbol: "₹" },
    poNo: "",
    poDate: nowTs(),
    deliveryDate: nowTs(),
    paymentStatus: "Pending",
    status: "Pending",
    remarks: "",
    products: [emptyProduct({})],
    totalAmount: 0,
    notes: "",
    terms: "",
    preparedBy: "",
    verifiedBy: "",
    approvedBy: "",
    acceptedBy: "",
    bank: {
      beneficiaryName: "",
      bank: "",
      bankAddress: "",
      bankAccount: "",
      swiftCode: "",
      ifscCode: "",
    },
    fileUrl: "",
    destination: "",
    paymentTerms: "",
    poType: "",
    dispatchTrough: "Road",
    billFrom: null,
  });

  /* ------------ data fetch ------------ */

  useEffect(() => {
    productsAPI.list(true).then(setProducts);
    // You requested Customers for Buyer — adjust filter if needed
    vendorsAPI.list("Customer").then(setParties);

    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const data = (await poReceivedAPI.get(id)) as POReceivedModel | null;
        if (data) setNewPOForm(data);
      } catch (e) {
        console.error("fetchPOData error:", e);
        ToastMSG("error", "Failed to load PO");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, setLoading]);

  /* ------------ handlers ------------ */

  const addPOItem = useCallback(() => {
    const row = emptyProduct();
    setNewPOForm((prev) => ({ ...prev, products: [...prev.products, row] }));
  }, []);

  const removePOItem = useCallback((index: number) => {
    setNewPOForm((prev) => {
      if (prev.products.length <= 1) return prev;
      const products = prev.products.filter((_, i) => i !== index);
      const total = products.reduce((s, p) => s + toNum(p.totalAmount), 0);
      return { ...prev, products, totalAmount: total };
    });
  }, []);

  const updatePOItem = useCallback(
    (productIndex: number, field: string, value: number | string) => {
      setNewPOForm((prev) => {
        let totalAmount = 0;
        const products = prev.products.map((p, i) => {
          if (i !== productIndex) {
            totalAmount += p.totalAmount;
            return p;
          }
          const price = (field === "unitPrice" ? +value : +p.unitPrice) || 0;
          const gst = (field === "gst" ? +value : +p.gst) || 0;
          const taxAmount = (price * gst) / 100;
          const total =
            (price + taxAmount) *
            ((field === "quantityOrdered" ? +value : +p.quantityOrdered) || 0);
          totalAmount += +total;
          return {
            ...p,
            [field]: value,
            totalAmount: total,
          };
        });
        return { ...prev, products, totalAmount };
      });
    },
    []
  );

  const duplicateProduct = (row: any) => {
    setNewPOForm((prev) => {
      const clone = emptyProduct({ ...row, id: generateUUID() });
      return {
        ...prev,
        products: [...prev.products, clone],
        totalAmount: prev.totalAmount + toNum(clone.totalAmount), // FIX: use totalAmount
      };
    });
  };

  const selectProductFn = (index: number, pId: string) => {
    const selected = products.find((p) => p.id === pId);
    if (!selected) return;

    // Price calculation same as your logic
    const base = selected.totalRawAmount || 0;
    const marginAmt = (toNum(selected.margin) / 100) * base || 0;
    const wastageAmt = (toNum(selected.wastage) / 100) * base || 0;
    const unitPrice =
      base +
      marginAmt +
      wastageAmt +
      toNum(selected.transport) +
      toNum(selected.miscellaneous);

    setNewPOForm((prev) => {
      const products = prev.products.map((p, i) => {
        if (i !== index) return p;

        const row = emptyProduct({
          ...selected,
          unitPrice,
          // keep sizeQty empty until user adds chip(s)
          sizeQty: [],
          quantityOrdered: 0,
          totalAmount: 0,
        });
        return row;
      });
      return { ...prev, products };
    });
  };

  // add size/qty chip (per row) using sizeDrafts[rowId]
  const addRowSizeQty = (rowId: string, index: number) => {
    const draft = sizeDrafts[rowId] || { size: "", quantity: 0 };
    if (!draft.size || !draft.quantity) return;

    setNewPOForm((prev) => {
      const products = prev.products.map((p, i) => {
        if (i !== index) return p;

        const sizeQty = [{ ...draft }, ...p.sizeQty];
        const quantityOrdered =
          toNum(p.quantityOrdered) + toNum(draft.quantity);

        const price = toNum(p.unitPrice);
        const gst = toNum(p.gst);
        const tax = (price * gst) / 100;
        const totalAmount = (price + tax) * quantityOrdered;

        return { ...p, sizeQty, quantityOrdered, totalAmount };
      });

      const totalAmount = products.reduce(
        (s, x) => s + toNum(x.totalAmount),
        0
      );
      return { ...prev, products, totalAmount };
    });

    setSizeDrafts((prev) => ({ ...prev, [rowId]: { size: "", quantity: 0 } }));
  };

  const removeRowSizeQty = (
    rowId: string,
    productIndex: number,
    chipIndex: number
  ) => {
    setNewPOForm((prev) => {
      const products = prev.products.map((p, i) => {
        if (i !== productIndex) return p;

        const removed = p.sizeQty[chipIndex];
        const nextSizeQty = p.sizeQty.filter((_, idx) => idx !== chipIndex);
        const quantityOrdered =
          toNum(p.quantityOrdered) - toNum(removed?.quantity || 0);

        const price = toNum(p.unitPrice);
        const gst = toNum(p.gst);
        const tax = (price * gst) / 100;
        const totalAmount = (price + tax) * Math.max(quantityOrdered, 0);

        return { ...p, sizeQty: nextSizeQty, quantityOrdered, totalAmount };
      });

      const totalAmount = products.reduce(
        (s, x) => s + toNum(x.totalAmount),
        0
      );
      return { ...prev, products, totalAmount };
    });
  };

  const addNewPO = useCallback(async () => {
    try {
      setLoading(true);
      const ref = await poReceivedAPI.create(newPOForm);
      ToastMSG("success", "Successfully created the PO");
      navigate("/po-received/" + ref.id);
    } catch (error) {
      console.error("addNewPO error:", error);
      ToastMSG("error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [navigate, newPOForm, setLoading]);

  /* ------------ computed ------------ */

  const totalDisplay = useMemo(
    () =>
      `${newPOForm.currency?.symbol || ""} ${currency(newPOForm.totalAmount)}`,
    [newPOForm.totalAmount, newPOForm.currency?.symbol]
  );

  /* ------------ UI ------------ */

  return (
    <div className="">
      <div className="p-4 sm:p-6">
        <Card className="rounded-2xl overflow-hidden border shadow-sm">
          <CardHeader className="py-4 border-b bg-gradient-to-r from-sky-50 via-indigo-50 to-white">
            <CardTitle className="text-lg sm:text-xl">
              {id ? "Update" : "New"} PO Entry & Order Tracker
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5 space-y-8">
            {/* Top meta */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label>Buyer Name *</Label>
                <PartiesSelection
                  parties={parties}
                  value={newPOForm.supplier?.id || ""}
                  onChange={(val) =>
                    setNewPOForm((prev) => ({ ...prev, supplier: val }))
                  }
                  placeholder="Select the Buyer"
                />
              </div>

              <div className="space-y-2">
                <Label>PO Number</Label>
                <Input
                  value={newPOForm.poNo}
                  onChange={(e) =>
                    setNewPOForm((prev) => ({ ...prev, poNo: e.target.value }))
                  }
                  placeholder="PO Number"
                />
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={newPOForm.currency.code}
                  onValueChange={(val) => {
                    const c = currencyList.find((x) => x.code === val);
                    if (!c) return;
                    setNewPOForm((prev) => ({ ...prev, currency: c }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {currencyList.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code} — {c.name} ({c.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>PO Date *</Label>
                <DatePicker
                  date={newPOForm.poDate as any}
                  setDate={(date) =>
                    setNewPOForm((p) => ({ ...p, poDate: date as any }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Delivery Date *</Label>
                <DatePicker
                  date={newPOForm.deliveryDate as any}
                  setDate={(date) =>
                    setNewPOForm((p) => ({ ...p, deliveryDate: date as any }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select
                  value={newPOForm.paymentStatus}
                  onValueChange={(val) =>
                    setNewPOForm((prev) => ({ ...prev, paymentStatus: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Pending", "Partial", "Paid"].map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>PO Type</Label>
                <Input
                  value={newPOForm.poType}
                  onChange={(e) =>
                    setNewPOForm((f) => ({ ...f, poType: e.target.value }))
                  }
                  placeholder="e.g., Domestic / Export / Jobwork"
                />
              </div>

              <div className="space-y-2">
                <Label>Dispatch Through</Label>
                <Select
                  value={newPOForm.dispatchTrough}
                  onValueChange={(v: any) =>
                    setNewPOForm((f) => ({ ...f, dispatchTrough: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Air", "Water", "Road", "Track"].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 ">
                <Label>Destination</Label>
                <Input
                  value={newPOForm.destination}
                  onChange={(e) =>
                    setNewPOForm((f) => ({ ...f, destination: e.target.value }))
                  }
                  placeholder="Ship-to location / City, Country"
                />
              </div>
            </section>
            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Textarea
                value={newPOForm.paymentTerms}
                onChange={(e) =>
                  setNewPOForm((f) => ({ ...f, paymentTerms: e.target.value }))
                }
                placeholder="e.g., Net 30, 50% advance, etc."
              />
            </div>
            <Separator />
            {/* Items */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  Items ({newPOForm.products.length} style
                  {newPOForm.products.length !== 1 ? "s" : ""}) *
                </Label>
                <Button onClick={addPOItem}>
                  <Plus className="mr-2 h-4 w-4" /> Add Style
                </Button>
              </div>

              <div className="space-y-6">
                {newPOForm.products.map((item, index) => {
                  const rowId = item.id;

                  const draft = sizeDrafts[rowId] || { size: "", quantity: 0 };

                  return (
                    <div key={rowId} className="rounded-xl border p-4 md:p-5 ">
                      {/* row header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-800">
                          Style #{index + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => duplicateProduct(item)}
                            className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                            title="Duplicate"
                            type="button"
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                          {newPOForm.products.length > 1 && (
                            <button
                              onClick={() => removePOItem(index)}
                              className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                              title="Remove"
                              type="button"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* style select */}
                        <div>
                          <Label>Style Name *</Label>
                          <Select
                            value={item.id}
                            onValueChange={(val) => selectProductFn(index, val)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select style" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name} → {p.size} {p.color}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* description */}
                        <div>
                          <Label>Product Description</Label>
                          <Textarea
                            value={item.description}
                            onChange={(e) =>
                              updatePOItem(index, "description", e.target.value)
                            }
                            rows={3}
                            placeholder="Detailed product description..."
                            readOnly
                            disabled
                          />
                        </div>

                        {/* size qty chips editor */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                          <div>
                            <Label>Size</Label>
                            <Input
                              value={draft.size}
                              onChange={(e) =>
                                setSizeDrafts((prev) => ({
                                  ...prev,
                                  [rowId]: { ...draft, size: e.target.value },
                                }))
                              }
                              placeholder="Enter Size"
                            />
                          </div>
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              value={draft.quantity || ""}
                              onChange={(e) =>
                                setSizeDrafts((prev) => ({
                                  ...prev,
                                  [rowId]: {
                                    ...draft,
                                    quantity: toNum(e.target.value),
                                  },
                                }))
                              }
                              placeholder="Enter quantity"
                            />
                          </div>
                          <div className="sm:pt-6">
                            <Button
                              type="button"
                              onClick={() => addRowSizeQty(rowId, index)}
                              className="w-full sm:w-auto"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add
                            </Button>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {item.sizeQty.map((s, i) => (
                            <div
                              key={`${s.size}-${i}`}
                              className="flex items-center gap-2 border rounded-2xl px-3 py-1"
                            >
                              <span className="text-sm">
                                {s.size} → {s.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:bg-transparent hover:text-red-700 p-0"
                                onClick={() =>
                                  removeRowSizeQty(rowId, index, i)
                                }
                                type="button"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        {/* pricing grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                          <div className="lg:col-span-1">
                            <Label>Units Type</Label>
                            <Select
                              value={item.unitType}
                              onValueChange={(val) =>
                                updatePOItem(index, "unitType", val)
                              }
                              disabled
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

                          <div className="lg:col-span-1">
                            <Label>Color</Label>
                            <Input
                              value={item.color}
                              onChange={(e) =>
                                updatePOItem(index, "color", e.target.value)
                              }
                              placeholder="Color"
                              readOnly
                              disabled
                            />
                          </div>

                          <div className="lg:col-span-1">
                            <Label>Unit Price *</Label>
                            <Input
                              className="text-right"
                              value={item.unitPrice === 0 ? "" : item.unitPrice}
                              onChange={(e) =>
                                updatePOItem(
                                  index,
                                  "unitPrice",
                                  sanitizeNumberInput(e.target.value)
                                )
                              }
                              placeholder="0.00"
                              inputMode="decimal"
                            />
                          </div>

                          <div className="lg:col-span-1">
                            <Label>GST %</Label>
                            <Input
                              className="text-right"
                              value={item.gst === 0 ? "" : item.gst}
                              onChange={(e) =>
                                updatePOItem(
                                  index,
                                  "gst",
                                  sanitizeNumberInput(e.target.value)
                                )
                              }
                              placeholder="0"
                              inputMode="decimal"
                            />
                          </div>

                          <div className="lg:col-span-1">
                            <Label>Quantity</Label>
                            <Input
                              className="text-right"
                              value={item.quantityOrdered}
                              placeholder="0"
                              readOnly
                              disabled
                            />
                          </div>

                          <div className="lg:col-span-1">
                            <Label>Total</Label>
                            <div className="px-3 py-2 border rounded-md text-right font-medium">
                              {newPOForm.currency.symbol}{" "}
                              {currency(item.totalAmount)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Total */}
              <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base font-semibold text-gray-900">
                    Purchase Order Total
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-700">
                    {totalDisplay}
                  </span>
                </div>
              </div>
            </section>
            <Separator />
            {/* Signatories & Bank */}
            <section className="space-y-6">
              <div className="">
                <div className="mb-3 font-medium">Bank Details</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Beneficiary Name</Label>
                    <Input
                      value={newPOForm.bank.beneficiaryName}
                      onChange={(e) =>
                        setNewPOForm((p) => ({
                          ...p,
                          bank: { ...p.bank, beneficiaryName: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank</Label>
                    <Input
                      value={newPOForm.bank.bank}
                      onChange={(e) =>
                        setNewPOForm((p) => ({
                          ...p,
                          bank: { ...p.bank, bank: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Address</Label>
                    <Input
                      value={newPOForm.bank.bankAddress}
                      onChange={(e) =>
                        setNewPOForm((p) => ({
                          ...p,
                          bank: { ...p.bank, bankAddress: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account No.</Label>
                    <Input
                      value={newPOForm.bank.bankAccount}
                      onChange={(e) =>
                        setNewPOForm((p) => ({
                          ...p,
                          bank: { ...p.bank, bankAccount: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SWIFT Code</Label>
                    <Input
                      value={newPOForm.bank.swiftCode}
                      onChange={(e) =>
                        setNewPOForm((p) => ({
                          ...p,
                          bank: { ...p.bank, swiftCode: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IFSC Code</Label>
                    <Input
                      value={newPOForm.bank.ifscCode}
                      onChange={(e) =>
                        setNewPOForm((p) => ({
                          ...p,
                          bank: { ...p.bank, ifscCode: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Upload File</Label>
                  <Input
                    type="file"
                    onChange={(e) =>
                      setNewPOForm((p) => ({
                        ...p,
                        fileUrl: e.target.files[0],
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prepared By</Label>
                  <Input
                    value={newPOForm.preparedBy}
                    onChange={(e) =>
                      setNewPOForm((p) => ({
                        ...p,
                        preparedBy: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Verified By</Label>
                  <Input
                    value={newPOForm.verifiedBy}
                    onChange={(e) =>
                      setNewPOForm((p) => ({
                        ...p,
                        verifiedBy: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Approved By</Label>
                  <Input
                    value={newPOForm.approvedBy}
                    onChange={(e) =>
                      setNewPOForm((p) => ({
                        ...p,
                        approvedBy: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Accepted By</Label>
                  <Input
                    value={newPOForm.acceptedBy}
                    onChange={(e) =>
                      setNewPOForm((p) => ({
                        ...p,
                        acceptedBy: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </section>
            <Separator />
            {/* Payment & text fields */}
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea
                value={newPOForm.remarks}
                onChange={(e) =>
                  setNewPOForm((prev) => ({ ...prev, remarks: e.target.value }))
                }
                rows={3}
                placeholder="Additional remarks, special instructions, or notes..."
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={newPOForm.notes}
                onChange={(e) =>
                  setNewPOForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                placeholder="Notes"
              />
            </div>
            <div className="space-y-2">
              <Label>Terms & Conditions</Label>
              <Textarea
                value={newPOForm.terms}
                onChange={(e) =>
                  setNewPOForm((prev) => ({ ...prev, terms: e.target.value }))
                }
                rows={3}
                placeholder="Terms of purchase, returns, etc."
              />
            </div>
            {/* Actions */}
          </CardContent>
        </Card>
      </div>
      <div className="sticky bottom-0 z-10 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t ">
        <div className="w-full flex items-center justify-end gap-2 p-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/po-received")}
          >
            Cancel
          </Button>
          <Button onClick={addNewPO} className="px-10 py-3 text-base">
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SetPoCustomer;
