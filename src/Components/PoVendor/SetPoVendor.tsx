import { Timestamp } from "firebase/firestore";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { poGivenAPI } from "../../Api/firebasePOsGiven";
import { rawMaterialsAPI } from "../../Api/firebaseRawMaterial";
import { vendorsAPI } from "../../Api/firebaseVendor";

import currency from "../../Constants/Currency";
import currencyList from "../../Constants/CurrencyList";
import generateUUID from "../../Constants/generateUniqueId";
import { sanitizeNumberInput } from "../../Constants/sanitizeNumberInput";
import unitTypes from "../../Constants/unitTypes";

import type { TimestampModel } from "../../Model/Date";
import type { POGivenModel, POReceivedModel } from "../../Model/POEntry";
import type { RawMaterialModel as RMLine } from "../../Model/RawMaterial";
import type { PartnerModel } from "../../Model/VendorModel";

import { useLoading } from "../../context/LoadingContext";

import { poReceivedAPI } from "../../Api/firebasePOsReceived";
import NumberToWords from "../../Constants/NumberToWords";
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

/* ------------ helpers ------------ */
const toNum = (v: unknown) => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};
const nowTs = () => Timestamp.now() as unknown as TimestampModel;

const emptyLine = (data: any = {}): any => ({
  id: data.id || generateUUID(),
  materialId: data.materialId || "",
  name: data.name || "",
  description: data.description || "",
  size: data.size || "",
  color: data.color || "",
  unitType: data.unitType || "",
  quantity: toNum(data.quantity) || 0,
  estimatePrice: toNum(data.estimatePrice) || 0,
  actualPrice: toNum(data.actualPrice) || 0,
  total: toNum(data.total) || 0,
  gst: toNum(data.gst) || 0,
});

/* ------------ component ------------ */
export default function SetPoVendor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setLoading } = useLoading();

  const [form, setForm] = useState<POGivenModel>({
    poNo: "",
    poReceivedNumber: "",
    poReceivedId: "",
    poDate: nowTs(),
    deliveryDate: nowTs(),
    paymentStatus: "Pending",
    status: "Pending",
    remarks: "",
    products: [emptyLine()],
    totalAmount: 0,
    notes: "",
    terms: "",
    destination: "",
    paymentTerms: "",
    poType: "",
    dispatchTrough: "Road",
    currency: { code: "INR", name: "Indian Rupee", symbol: "₹" },
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
    supplier: null,
    billFrom: null,
  });

  const [poReceived, setPoReceived] = useState<POReceivedModel[]>([]);
  const [materialsPool, setMaterialsPool] = useState([]);
  const [parties, setParties] = useState<PartnerModel[]>([]);

  /* ------------ fetch ------------ */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        vendorsAPI.list("Vendor").then(setParties);
        poReceivedAPI.getAll().then(setPoReceived);

        if (id) {
          const data = (await poGivenAPI.get(id)) as POGivenModel | null;
          if (data) {
            setForm((prev) => ({ ...prev, ...data }));
          }
        }
      } catch (e) {
        console.error(e);
        ToastMSG("error", "Failed to load PO Given");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, setLoading]);

  /* ------------ pure helpers ------------ */
  const recalcGrandTotal = (items) =>
    items.reduce((s, p) => s + toNum(p.total), 0);

  /* ------------ line actions ------------ */
  const addLine = () =>
    setForm((f) => {
      const products = [...f.products, emptyLine()];
      return { ...f, products };
    });

  const removeLine = (idx: number) =>
    setForm((f) => {
      if (f.products.length <= 1) return f;
      const products = f.products.filter((_, i) => i !== idx);
      const totalAmount = recalcGrandTotal(products);
      return { ...f, products, totalAmount };
    });

  const updateLine = (
    idx: number,
    field: keyof RMLine,
    value: string | number
  ) =>
    setForm((f) => {
      const products = f.products.map((p, i) => {
        if (i !== idx) return p;
        const next = { ...p, [field]: value } as any;
        const price = toNum(next.actualPrice);
        const gst = toNum(next.gst);
        const qty = toNum(next.quantity);
        const tax = (price * gst) / 100;
        next.total = (price + tax) * qty;
        return next;
      });
      const totalAmount = recalcGrandTotal(products);
      return { ...f, products, totalAmount };
    });

  const onSelectPOReceived = async (poId: string) => {
    const sel = poReceived.find((p) => p.id === poId);
    if (!sel) return;

    // Build material pool from PO-Received products' rawMaterials
    const pool = await Promise.all(
      (sel.products ?? []).flatMap((prod) =>
        (prod.rawMaterials ?? []).map(async (m: any) => {
          if (!m?.materialId)
            return emptyLine({ ...m, materialId: generateUUID() });
          const res = await rawMaterialsAPI.get(m.materialId);
          return emptyLine({
            materialId: res.id,
            name: res.name,
            description: res.description,
            size: res.size,
            color: res.color,
            unitType: res.unitType,
            estimatePrice: res.estimatedPrice,
            actualPrice: res.estimatedPrice,
            gst: res.gst || 0,
            quantity: toNum(m.quantity),
            total: toNum(res.estimatedPrice) * toNum(m.quantity),
          });
        })
      )
    );

    setMaterialsPool(pool);
    setForm((f) => ({
      ...f,
      poReceivedId: sel.id!,
      poReceivedNumber: sel.poNo,
    }));
  };

  const onSelectMaterial = (idx: number, materialId: string) => {
    const pick = materialsPool.find((m) => m.materialId === materialId);
    if (!pick) return;

    setForm((f) => {
      const products = f.products.map((p, i) => {
        if (i !== idx) return p;
        const next = { ...pick, id: p.id }; // keep row id
        const price = toNum(next.actualPrice);
        const gst = toNum(next.gst);
        const qty = toNum(next.quantity);
        const tax = (price * gst) / 100;
        next.total = (price + tax) * qty;
        return next;
      });
      const totalAmount = recalcGrandTotal(products);
      return { ...f, products, totalAmount };
    });
  };

  /* ------------ submit ------------ */
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const ref = await poGivenAPI.create(form);
      ToastMSG("success", "PO Given saved");
      navigate(`/po-vendor/${ref.id}`);
    } catch (e) {
      console.error(e);
      ToastMSG("error", "Save failed");
    } finally {
      setLoading(false);
    }
  };

  /* ------------ UI ------------ */
  return (
    <div className="">
      <div className="p-4 sm:p-6">
        <Card className="rounded-2xl overflow-hidden border">
          <CardHeader className="py-4 border-b bg-gradient-to-r from-indigo-50 via-sky-50 to-white">
            <CardTitle className="text-lg sm:text-xl">
              {id ? "Update" : "New"} PO Given
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5 space-y-8">
            {/* Section: Parties & Dates */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Keep if you still track supplier; remove if not in your model */}
              <div className="space-y-2">
                <Label>Supplier *</Label>
                <PartiesSelection
                  parties={parties}
                  value={form.supplier?.id || ""}
                  onChange={(party) => {
                    setForm((f) => ({ ...f, supplier: party }));
                  }}
                  placeholder="Select supplier"
                />
              </div>

              <div className="space-y-2">
                <Label>PO Number</Label>
                <Input
                  value={form.poNo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, poNo: e.target.value }))
                  }
                  placeholder="PO Number"
                />
              </div>

              <div className="space-y-2">
                <Label>PO Received Number</Label>
                <Select
                  value={form.poReceivedId || ""}
                  onValueChange={onSelectPOReceived}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Link a PO Received" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {poReceived.map((poR) => (
                      <SelectItem key={poR.id} value={poR.id!}>
                        {poR.poNo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>PO Date *</Label>
                <DatePicker
                  date={form.poDate as any}
                  setDate={(d) => setForm((f) => ({ ...f, poDate: d as any }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Delivery Date *</Label>
                <DatePicker
                  date={form.deliveryDate as any}
                  setDate={(d) =>
                    setForm((f) => ({ ...f, deliveryDate: d as any }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select
                  value={form.paymentStatus}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, paymentStatus: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Pending", "Partial", "Paid"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={form.currency.code}
                  onValueChange={(val) => {
                    const c = currencyList.find((x) => x.code === val);
                    if (!c) return;
                    setForm((f) => ({ ...f, currency: c }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {currencyList.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code} — {c.name} {c.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>PO Type</Label>
                <Input
                  value={form.poType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, poType: e.target.value }))
                  }
                  placeholder="e.g., Domestic / Export / Jobwork"
                />
              </div>

              <div className="space-y-2">
                <Label>Dispatch Through</Label>
                <Select
                  value={form.dispatchTrough}
                  onValueChange={(v: POGivenModel["dispatchTrough"]) =>
                    setForm((f) => ({ ...f, dispatchTrough: v }))
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
                  value={form.destination}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, destination: e.target.value }))
                  }
                  placeholder="Ship-to location / City, Country"
                />
              </div>
            </section>
            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Textarea
                value={form.paymentTerms}
                onChange={(e) =>
                  setForm((f) => ({ ...f, paymentTerms: e.target.value }))
                }
                placeholder="e.g., Net 30, 50% advance, etc."
              />
            </div>
            <Separator />
            {/* Section: Items */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  Items ({form.products.length})
                </Label>
                <Button onClick={addLine}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Material
                </Button>
              </div>

              <div className="space-y-6">
                {form.products.map((row, idx) => (
                  <div key={row.id} className="rounded-xl border p-4 md:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-800">
                        Material #{idx + 1}
                      </span>
                      {form.products.length > 1 && (
                        <button
                          onClick={() => removeLine(idx)}
                          className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                          title="Remove Material"
                          type="button"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Material *</Label>
                        <Select
                          value={row.materialId}
                          onValueChange={(val) => onSelectMaterial(idx, val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a material from PO Received" />
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            {materialsPool.map((m) => (
                              <SelectItem
                                key={m.materialId}
                                value={m.materialId}
                              >
                                {m.name} — {m.size} {m.color}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={row.description}
                          readOnly
                          disabled
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-4">
                        <div>
                          <Label>Unit Type</Label>
                          <Select value={row.unitType} disabled>
                            <SelectTrigger>
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

                        <div>
                          <Label>Size</Label>
                          <Input value={row.size} readOnly disabled />
                        </div>

                        <div>
                          <Label>Color</Label>
                          <Input value={row.color} readOnly disabled />
                        </div>

                        <div>
                          <Label>Estimated Price</Label>
                          <Input value={row.estimatePrice} readOnly disabled />
                        </div>

                        <div>
                          <Label>Actual Price *</Label>
                          <Input
                            className="text-right"
                            value={row.actualPrice === 0 ? "" : row.actualPrice}
                            onChange={(e) =>
                              updateLine(
                                idx,
                                "actualPrice",
                                sanitizeNumberInput(e.target.value)
                              )
                            }
                            placeholder="0.00"
                            inputMode="decimal"
                          />
                        </div>

                        <div>
                          <Label>GST %</Label>
                          <Input
                            className="text-right"
                            value={row.gst === 0 ? "" : row.gst}
                            onChange={(e) =>
                              updateLine(
                                idx,
                                "gst",
                                sanitizeNumberInput(e.target.value)
                              )
                            }
                            placeholder="0"
                            inputMode="decimal"
                          />
                        </div>

                        <div>
                          <Label>Quantity</Label>
                          <Input
                            className="text-right"
                            value={row.quantity === 0 ? "" : row.quantity}
                            onChange={(e) =>
                              updateLine(
                                idx,
                                "quantity",
                                sanitizeNumberInput(e.target.value)
                              )
                            }
                            placeholder="0"
                            inputMode="decimal"
                          />
                        </div>
                        <div className="lg:col-span-1">
                          <Label>Total Value</Label>
                          <div className="px-3 py-2 border rounded-md text-right font-medium">
                            {currency(row.total, form.currency.code)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base font-semibold text-gray-900">
                    Purchase Order Total
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-blue-700">
                    {NumberToWords(
                      parseInt(String(form.totalAmount)),
                      form.currency.name
                    )}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-700">
                    {currency(form.totalAmount, form.currency.code)}
                  </span>
                </div>
              </div>
            </section>
            <Separator />
            {/* Section: Bank Details */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label>Beneficiary Name</Label>
                <Input
                  value={form.bank.beneficiaryName}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      bank: { ...f.bank, beneficiaryName: e.target.value },
                    }))
                  }
                  placeholder="Beneficiary as per bank"
                />
              </div>
              <div className="space-y-2">
                <Label>Bank</Label>
                <Input
                  value={form.bank.bank}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      bank: { ...f.bank, bank: e.target.value },
                    }))
                  }
                  placeholder="Bank name"
                />
              </div>
              <div className="space-y-2">
                <Label>Bank Address</Label>
                <Input
                  value={form.bank.bankAddress}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      bank: { ...f.bank, bankAddress: e.target.value },
                    }))
                  }
                  placeholder="Branch / Address"
                />
              </div>
              <div className="space-y-2">
                <Label>Account No.</Label>
                <Input
                  value={form.bank.bankAccount}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      bank: { ...f.bank, bankAccount: e.target.value },
                    }))
                  }
                  placeholder="0000 0000 0000"
                />
              </div>
              <div className="space-y-2">
                <Label>SWIFT</Label>
                <Input
                  value={form.bank.swiftCode}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      bank: { ...f.bank, swiftCode: e.target.value },
                    }))
                  }
                  placeholder="SWIFT code"
                />
              </div>
              <div className="space-y-2">
                <Label>IFSC</Label>
                <Input
                  value={form.bank.ifscCode}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      bank: { ...f.bank, ifscCode: e.target.value },
                    }))
                  }
                  placeholder="IFSC code"
                />
              </div>
            </section>
            <Separator />
            {/* Section: People */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="space-y-2">
                <Label>Prepared By</Label>
                <Input
                  value={form.preparedBy}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, preparedBy: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Verified By</Label>
                <Input
                  value={form.verifiedBy}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, verifiedBy: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Approved By</Label>
                <Input
                  value={form.approvedBy}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, approvedBy: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Accepted By</Label>
                <Input
                  value={form.acceptedBy}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, acceptedBy: e.target.value }))
                  }
                />
              </div>
            </section>
            <Separator />
            {/* Notes / Terms / Remarks */}
            <div className="space-y-2 ">
              <Label>Remarks</Label>
              <Textarea
                value={form.remarks}
                onChange={(e) =>
                  setForm((f) => ({ ...f, remarks: e.target.value }))
                }
                rows={3}
                placeholder="Special instructions or notes…"
              />
            </div>
            <div className="space-y-2 ">
              <Label>Terms & Conditions</Label>
              <Textarea
                value={form.terms}
                onChange={(e) =>
                  setForm((f) => ({ ...f, terms: e.target.value }))
                }
                rows={3}
                placeholder="Terms of purchase, returns, etc."
              />
            </div>
            <div className="space-y-2 ">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={3}
                placeholder="Internal notes…"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="sticky bottom-0 z-10 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t ">
        <div className="w-full flex items-center justify-end gap-2 p-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/po-customer")}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="px-10 py-3 text-base">
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
