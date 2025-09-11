import { Timestamp } from "firebase/firestore";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { sanitizeNumberInput } from "../../Constants/sanitizeNumberInput";
import { useLoading } from "../../context/LoadingContext";
import type { POReceivedModel } from "../../Model/POEntry";
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

const formatMoney = (n: number) => Number(n || 0).toFixed(2);

const emptyProduct = (data: any = {}) => ({
  name: data.name || "",
  description: data.description || "",
  poNo: data.poNo || "",
  size: data.size || "",
  color: data.color || "",
  unitType: data.unitType || "",
  quantityOrdered: data.quantityOrdered || 0,
  quantityUsed: data.quantityUsed || 0,
  unitPrice: data.unitPrice || 0,
  total: data.total || 0,
});

// ---- Component ------------------------------------------------------------

function SetCostSheet() {
  const { id } = useParams();
  const { setLoading } = useLoading();

  const [newPOForm, setNewPOForm] = useState<POReceivedModel>({
    supplier: "",
    poNo: "",
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
      const totalAmount = products.reduce((sum, p) => sum + (p.total || 0), 0);
      return { ...prev, products, totalAmount };
    });
  }, []);

  const updatePOItem = useCallback(
    (productIndex: number, field: string, value: number | string) => {
      setNewPOForm((prev) => {
        let totalAmount = 0;
        const products = prev.products.map((p, i) => {
          if (i !== productIndex) {
            totalAmount += p.total || 0;
            return p;
          }
          const quantityOrdered =
            field === "quantityOrdered"
              ? +value
              : Number(p.quantityOrdered || 0);
          const unitPrice =
            field === "unitPrice" ? +value : Number(p.unitPrice || 0);
          const total = Number(quantityOrdered * unitPrice || 0);

          const next: any = {
            ...p,
            [field]: value,
            total,
          };
          totalAmount += total;
          return next;
        });
        return { ...prev, products, totalAmount };
      });
    },
    []
  );

  const addNewPO = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: write to Firestore here
      ToastMSG("success", "Saved (stub). Hook this to Firestore.");
    } catch (error) {
      console.error("addNewPO error:", error);
      ToastMSG("error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [id, newPOForm]);

  function duplicateProduct(data: any) {
    setNewPOForm((prev) => ({
      ...prev,
      products: [...prev.products, emptyProduct(data)],
      totalAmount: (prev.totalAmount || 0) + (data.total || 0),
    }));
  }

  const UNIT_TYPES = ["Cm", "Mtr", "Kg", "Litre", "Piece", "Box"];

  // ---- Render -------------------------------------------------------------

  return (
    <div className="rounded-lg p-6 w-full">
      <h3 className="text-xl font-semibold mb-6 text-gray-900">Cost Sheet</h3>

      <div className="space-y-6">
        {/* Style Meta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Style Name</Label>
            <Input type="text" placeholder="Enter style name" />
          </div>
          <div>
            <Label>PO Number (optional)</Label>
            <Input
              type="text"
              value={newPOForm.poNo || ""}
              onChange={(e) =>
                setNewPOForm((p) => ({ ...p, poNo: e.target.value }))
              }
              placeholder="PO-2025-0001"
            />
          </div>
          <div>
            <Label>Supplier (optional)</Label>
            <Input
              type="text"
              value={newPOForm.supplier || ""}
              onChange={(e) =>
                setNewPOForm((p) => ({ ...p, supplier: e.target.value }))
              }
              placeholder="ABC Textiles"
            />
          </div>
        </div>

        {/* Items Section (Excel-like table) */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-3">
            <Label className="block text-lg font-medium text-gray-900">
              Items ({newPOForm.products.length} material
              {newPOForm.products.length !== 1 ? "s" : ""}) *
            </Label>
            <button
              onClick={addPOItem}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </button>
          </div>

          <div className="overflow-x-auto border rounded-md">
            <table className="min-w-[1200px] w-full text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr className="text-left">
                  <th className="px-3 py-2 w-10">#</th>
                  <th className="px-3 py-2 min-w-[200px]">Material Name *</th>
                  <th className="px-3 py-2 min-w-[280px]">Description</th>
                  <th className="px-3 py-2 w-40">Unit Type</th>
                  <th className="px-3 py-2 w-32">Size</th>
                  <th className="px-3 py-2 w-32">Color</th>
                  <th className="px-3 py-2 w-32 text-right">Qty *</th>
                  <th className="px-3 py-2 w-40 text-right">Unit Price *</th>
                  <th className="px-3 py-2 w-36 text-right">Total</th>
                  <th className="px-3 py-2 w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {newPOForm.products.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-3 py-2 align-top">{index + 1}</td>

                    {/* Material Name */}
                    <td className="px-3 py-2 align-top">
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          updatePOItem(index, "name", e.target.value)
                        }
                        placeholder="Fabric / Buttons / Care Label"
                      />
                    </td>

                    {/* Description */}
                    <td className="px-3 py-2 align-top">
                      <Textarea
                        value={item.description}
                        onChange={(e) =>
                          updatePOItem(index, "description", e.target.value)
                        }
                        rows={2}
                        placeholder="e.g., 100% cotton poplin, 58\"
                      />
                    </td>

                    {/* Unit Type */}
                    <td className="px-3 py-2 align-top">
                      <Select
                        value={String(item.unitType || "")}
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
                    </td>

                    {/* Size */}
                    <td className="px-3 py-2 align-top">
                      <Input
                        value={item.size}
                        onChange={(e) =>
                          updatePOItem(index, "size", e.target.value)
                        }
                        placeholder="S / M / 40 / 58in"
                      />
                    </td>

                    {/* Color */}
                    <td className="px-3 py-2 align-top">
                      <Input
                        value={item.color}
                        onChange={(e) =>
                          updatePOItem(index, "color", e.target.value)
                        }
                        placeholder="Navy / Black"
                      />
                    </td>

                    {/* Quantity */}
                    <td className="px-3 py-2 align-top text-right">
                      <Input
                        className="text-right"
                        value={String(item.quantityOrdered ?? "")}
                        onChange={(e) =>
                          updatePOItem(
                            index,
                            "quantityOrdered",
                            sanitizeNumberInput(e.target.value)
                          )
                        }
                        placeholder="0"
                        inputMode="decimal"
                      />
                    </td>

                    {/* Unit Price */}
                    <td className="px-3 py-2 align-top text-right">
                      <Input
                        className="text-right"
                        value={String(item.unitPrice ?? "")}
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
                    </td>

                    {/* Total */}
                    <td className="px-3 py-2 align-top text-right font-medium">
                      {formatMoney(item.total)}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2 align-top">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => duplicateProduct(item)}
                          className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                          title="Duplicate row"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {newPOForm.products.length > 1 && (
                          <button
                            onClick={() => removePOItem(index)}
                            className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                            title="Delete row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Summary Row */}
                <tr className="border-t bg-blue-50">
                  <td className="px-3 py-3 font-medium" colSpan={8}>
                    Purchase Order Total
                  </td>
                  <td className="px-3 py-3 text-right text-lg font-bold text-blue-700">
                    {formatMoney(newPOForm.totalAmount)}
                  </td>
                  <td className="px-3 py-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Extra Costs */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Margin
            </Label>
            <Input type="text" placeholder="0.00" inputMode="decimal" />
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Transport
            </Label>
            <Input type="text" placeholder="0.00" inputMode="decimal" />
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Wastage
            </Label>
            <Input type="text" placeholder="0.00" inputMode="decimal" />
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Miscellaneous
            </Label>
            <Input type="text" placeholder="0.00" inputMode="decimal" />
          </div>
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

        {/* Actions */}
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

export default SetCostSheet;
