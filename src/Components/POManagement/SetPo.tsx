import { Timestamp } from "firebase/firestore";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { poGivenAPI } from "../../Api/firebasePOsGiven";
import { poReceivedAPI } from "../../Api/firebasePOsReceived";
import { sanitizeNumberInput } from "../../Constants/sanitizeNumberInput";
import { useLoading } from "../../context/LoadingContext";
import type { POEntry } from "../../Model/POEntry";
import { DatePicker } from "../ui/DatePicker";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import ToastMSG from "../ui/Toaster";

const formatMoney = (n: number) => n.toFixed(2);

const emptyProduct = (data: any = {}) => ({
  name: data.name || "",
  description: data.description || "",
  poNumber: data.poNumber || "",
  size: data.size || "",
  color: data.color || "",
  unitType: data.unitType || "",
  quantityOrdered: data.quantityOrdered || 0,
  quantityUsed: data.quantityUsed || 0,
  unitPrice: data.unitPrice || 0,
  total: data.total || 0,
});

// ---- Component ------------------------------------------------------------

function SetPo({ field }) {
  const { id } = useParams();
  const { setLoading } = useLoading();
  const navigate = useNavigate();

  const [newPOForm, setNewPOForm] = useState<POEntry>({
    supplier: "",
    poNumber: "",
    poDate: Timestamp.now(),
    deliveryDate: Timestamp.now(),
    paymentStatus: "Pending",
    remarks: "",
    totalAmount: 0,
    products: [emptyProduct()],
  });

  // ---- Actions ------------------------------------------------------------

  const addPOItem = useCallback(() => {
    setNewPOForm((prev) => ({
      ...prev,
      products: [...prev.products, emptyProduct()],
    }));
  }, []);

  const removePOItem = useCallback((index: number) => {
    setNewPOForm((prev) => {
      if (prev.products.length <= 1) return prev;
      const products = prev.products.filter((_, i) => i !== index);
      return { ...prev, products };
    });
  }, []);

  const updatePOItem = useCallback(
    (productIndex: number, field: string, value: number | string) => {
      setNewPOForm((prev) => {
        let totalAmount = 0;
        const products = prev.products.map((p, i) => {
          if (i !== productIndex) {
            totalAmount += p.total;
            return p;
          }
          const total =
            ((field === "quantityOrdered" ? +value : p.quantityOrdered) || 0) *
            ((field === "unitPrice" ? +value : p.unitPrice) || 0);
          totalAmount += total;
          return {
            ...p,
            [field]: value,
            total,
          };
        });
        return { ...prev, products, totalAmount };
      });
    },
    []
  );

  const addNewPO = useCallback(async () => {
    try {
      setLoading(true);
      if (id) {
        if (field == "given") {
          await poGivenAPI.update(id, newPOForm);
        } else {
          await poReceivedAPI.update(id, newPOForm);
        }
        ToastMSG("success", "Successfully updated the PO");
        navigate("./../");
      } else {
        const ref = await (field == "given"
          ? poGivenAPI
          : poReceivedAPI
        ).create(newPOForm);
        ToastMSG("success", "Successfully created the PO");
        if (field == "given") {
          navigate("/po-given/" + ref.id);
        } else {
          navigate("/po-received/" + ref.id);
        }
      }
    } catch (error) {
      console.error("addNewPO error:", error);
      ToastMSG("error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [id, newPOForm]);

  useEffect(() => {
    const fetchPOData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        let data = (await (field == "given" ? poGivenAPI : poReceivedAPI).get(
          id
        )) as POEntry;
        if (data) {
          setNewPOForm(data);
        }
      } catch (error) {
        console.error("fetchPOData error:", error);
        ToastMSG("error", "Failed to load PO");
      } finally {
        setLoading(false);
      }
    };
    fetchPOData();
  }, [id, setLoading]);

  function duplicateProduct(data) {
    setNewPOForm((prev) => ({
      ...prev,
      products: [...prev.products, emptyProduct(data)],
      totalAmount: prev.totalAmount + data.total,
    }));
  }
  const UNIT_TYPES = ["S", "M", "L", "XL", "Kg", "Litre", "Piece", "Box"];
  // ---- Render -------------------------------------------------------------

  return (
    <div className="rounded-lg p-6 w-full">
      <h3 className="text-xl font-semibold mb-6 text-gray-900">
        {id ? "Update" : "New"} PO Entry & Order Tracker
      </h3>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Buyer Name *
            </Label>
            <Input
              type="text"
              value={newPOForm.supplier}
              onChange={(e) =>
                setNewPOForm((prev) => ({ ...prev, supplier: e.target.value }))
              }
              placeholder="Enter buyer name"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              PO Number
            </Label>
            <Input
              type="text"
              value={newPOForm.poNumber}
              onChange={(e) =>
                setNewPOForm((prev) => ({ ...prev, poNumber: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="PO Number"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              PO Date *
            </Label>
            <DatePicker
              date={newPOForm.poDate as any}
              setDate={(date) => {
                setNewPOForm((prev) => ({ ...prev, poDate: date }));
              }}
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Date *
            </Label>
            <DatePicker
              date={newPOForm.deliveryDate as any}
              setDate={(date) =>
                setNewPOForm((prev) => ({
                  ...prev,
                  deliveryDate: date,
                }))
              }
            />
          </div>
        </div>

        {/* Items Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="block text-lg font-medium text-gray-900">
              Items ({newPOForm.products.length} style
              {newPOForm.products.length !== 1 ? "s" : ""}) *
            </Label>
            <button
              onClick={addPOItem}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Style
            </button>
          </div>

          <div className="space-y-6">
            {newPOForm.products.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-700">
                    Style #{index + 1}
                  </span>
                  <div className="">
                    <button
                      onClick={() => duplicateProduct(item)}
                      className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition-colors"
                      title="Remove style"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    {newPOForm.products.length > 1 && (
                      <button
                        onClick={() => removePOItem(index)}
                        className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Remove style"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Style Name *</Label>
                    <Input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        updatePOItem(index, "name", e.target.value)
                      }
                      placeholder="Enter style name"
                    />
                  </div>

                  <div>
                    <Label>Product Description</Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) =>
                        updatePOItem(index, "description", e.target.value)
                      }
                      rows={3}
                      placeholder="Detailed product description..."
                    />
                  </div>

                  <div className="grid grid-cols-6 gap-4">
                    <div>
                      <Label>Units Type</Label>
                      <Select
                        value={item.unitType}
                        onValueChange={(val) =>
                          updatePOItem(index, "unitType", val)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_TYPES.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Size</Label>
                      <Input
                        type="text"
                        value={item.size}
                        onChange={(e) =>
                          updatePOItem(index, "size", e.target.value)
                        }
                        placeholder="S, M, L, XL"
                      />
                    </div>
                    <div>
                      <Label>Color</Label>
                      <Input
                        type="text"
                        value={item.color}
                        onChange={(e) =>
                          updatePOItem(index, "color", e.target.value)
                        }
                        placeholder="Enter color(s)"
                      />
                    </div>
                    <div>
                      <Label>Quantity*</Label>
                      <Input
                        type="text"
                        value={item.quantityOrdered}
                        onChange={(e) =>
                          updatePOItem(
                            index,
                            "quantityOrdered",
                            sanitizeNumberInput(e.target.value)
                          )
                        }
                        placeholder="0"
                        min={0}
                      />
                    </div>
                    <div>
                      <Label>Unit Price *</Label>
                      <Input
                        type="text"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updatePOItem(
                            index,
                            "unitPrice",
                            sanitizeNumberInput(e.target.value)
                          )
                        }
                        placeholder="0.00"
                        step="0.01"
                        min={0}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="w-full">
                        <Label>Total</Label>
                        <div className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-900">
                          {formatMoney(item.total)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Total */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">
                Purchase Order Total:
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {formatMoney(newPOForm.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Status
          </Label>
          <Select
            value={newPOForm.paymentStatus}
            onValueChange={(val) =>
              setNewPOForm((prev) => ({
                ...prev,
                paymentStatus: val,
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Unit" />
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

        {/* Remarks */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Remarks
          </Label>
          <Textarea
            value={newPOForm.remarks}
            onChange={(e) =>
              setNewPOForm((prev) => ({ ...prev, remarks: e.target.value }))
            }
            rows={3}
            placeholder="Additional remarks, special instructions, or notes..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center pt-6 border-t border-gray-200">
          <button
            onClick={addNewPO}
            className="bg-blue-600 cursor-pointer text-white px-12 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default SetPo;
