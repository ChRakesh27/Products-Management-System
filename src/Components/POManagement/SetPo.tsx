import { Timestamp } from "firebase/firestore";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { poGivenAPI } from "../../Api/firebasePOsGiven";
import { poReceivedAPI } from "../../Api/firebasePOsReceived";
import generateUUID from "../../Constants/generateUniqueId";
import { useLoading } from "../../context/LoadingContext";
import type { POEntry } from "../../Model/POEntry";
import { DatePicker } from "../ui/DatePicker";
import ToastMSG from "../ui/Toaster";

// ---- Helpers --------------------------------------------------------------

const formatMoney = (n: number) => n.toFixed(2);

const emptyVariant = () => ({
  id: generateUUID(),
  color: "",
  size: "",
  quantityOrdered: 0,
  quantityUsed: 0,
  unitPrice: 0,
  total: 0,
});

const emptyProduct = () => ({
  name: "",
  description: "",
  variants: [emptyVariant()],
});

// ---- Component ------------------------------------------------------------

function SetPo({ field }) {
  const { id } = useParams();
  const { setLoading } = useLoading();
  const navigate = useNavigate();

  const [newPOForm, setNewPOForm] = useState<POEntry>({
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    supplier: "",
    poNumber: "",
    poDate: Timestamp.now(),
    deliveryDate: Timestamp.now(),
    paymentStatus: "pending", // normalize default
    remarks: "",
    totalAmount: 0,
    status: "Pending",
    products: [emptyProduct()],
  });

  // ---- Derived values -----------------------------------------------------

  // Per-variant total and overall totals computed from variants
  const totals = useMemo(() => {
    const productTotals = newPOForm.products.map((p) =>
      p.variants.reduce((sum, v) => sum + v.total, 0)
    );
    const grandTotal = productTotals.reduce((a, b) => a + b, 0);
    return { productTotals, grandTotal };
  }, [newPOForm.products]);

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

  const addVariant = useCallback((productIndex: number) => {
    setNewPOForm((prev) => {
      const products = prev.products.map((p, i) =>
        i === productIndex
          ? { ...p, variants: [...p.variants, emptyVariant()] }
          : p
      );
      return { ...prev, products };
    });
  }, []);

  const removeVariant = useCallback(
    (productIndex: number, variantIndex: number) => {
      setNewPOForm((prev) => {
        const product = prev.products[productIndex];
        if (!product || product.variants.length <= 1) return prev;
        const variants = product.variants.filter((_, i) => i !== variantIndex);
        const products = prev.products.map((p, i) =>
          i === productIndex ? { ...p, variants } : p
        );
        return { ...prev, products };
      });
    },
    []
  );

  const updatePOItem = useCallback(
    (
      productIndex: number,
      variantIndex: number | null,
      field: string,
      value: number | string
    ) => {
      setNewPOForm((prev) => {
        const products = prev.products.map((p, i) => {
          if (i !== productIndex) return p;
          // Update a variant field
          if (variantIndex !== null) {
            const variants = p.variants.map((v, vi) =>
              vi === variantIndex
                ? {
                    ...v,
                    [field]:
                      field === "quantityOrdered" || field === "unitPrice"
                        ? Number(value) || 0
                        : value,
                    total:
                      ((field === "quantityOrdered"
                        ? +value
                        : v.quantityOrdered) || 0) *
                      ((field === "unitPrice" ? +value : v.unitPrice) || 0),
                  }
                : v
            );
            return { ...p, variants };
          }
          // Update product-level field
          return { ...p, [field]: value };
        });
        return { ...prev, products };
      });
    },
    []
  );

  const addNewPO = useCallback(async () => {
    try {
      setLoading(true);
      const payload = {
        ...newPOForm,
        updatedAt: Timestamp.now(),
        totalAmount: totals.grandTotal,
      };

      if (id) {
        if (field == "given") {
          await poGivenAPI.update(id, payload);
        } else {
          await poReceivedAPI.update(id, payload);
        }
        ToastMSG("success", "Successfully updated the PO");
        navigate("./../");
      } else {
        const ref = await (field == "given"
          ? poGivenAPI
          : poReceivedAPI
        ).create(payload);
        ToastMSG("success", "Successfully created the PO");
        navigate(ref.id);
      }
    } catch (error) {
      console.error("addNewPO error:", error);
      ToastMSG("error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, newPOForm, setLoading, totals.grandTotal]);

  useEffect(() => {
    const fetchPOData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        let data = (await (field == "given" ? poGivenAPI : poReceivedAPI).get(
          id
        )) as POEntry;
        if (data) {
          const normalizedProducts = data.products?.map((p: any) => ({
            id: p.id,
            name: p.name || "",
            description: p.description || "",
            variants:
              Array.isArray(p.variants) && p.variants.length > 0
                ? p.variants.map((v: any) => ({
                    id: v.id,
                    color: v.color || "",
                    size: v.size || "",
                    quantityOrdered: Number(v.quantityOrdered) || 0,
                    unitPrice: Number(v.unitPrice) || 0,
                    total: v.total,
                  }))
                : [emptyVariant()],
          })) || [emptyProduct()];

          setNewPOForm({
            ...data,
            paymentStatus: (data.paymentStatus as any) || "pending",
            products: normalizedProducts,
          });
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buyer Name *
            </label>
            <input
              type="text"
              value={newPOForm.supplier}
              onChange={(e) =>
                setNewPOForm((prev) => ({ ...prev, supplier: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter buyer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PO Number
            </label>
            <input
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PO Date *
            </label>
            <DatePicker
              date={newPOForm.poDate as any}
              setDate={(date) => {
                setNewPOForm((prev) => ({ ...prev, poDate: date }));
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Date *
            </label>
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
            <label className="block text-lg font-medium text-gray-900">
              Items ({newPOForm.products.length} style
              {newPOForm.products.length !== 1 ? "s" : ""}) *
            </label>
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

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Style Name *
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        updatePOItem(index, null, "name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter style name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Description
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) =>
                        updatePOItem(index, null, "description", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Detailed product description..."
                    />
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Variants *
                    </label>
                    <button
                      onClick={() => addVariant(index)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Variant
                    </button>
                  </div>

                  {item.variants.map((v, i) => {
                    return (
                      <div className="grid grid-cols-5 gap-4" key={i}>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Size *
                          </label>
                          <input
                            type="text"
                            value={v.size}
                            onChange={(e) =>
                              updatePOItem(index, i, "size", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="S, M, L, XL"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Color *
                          </label>
                          <input
                            type="text"
                            value={v.color}
                            onChange={(e) =>
                              updatePOItem(index, i, "color", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter color(s)"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity Ordered *
                          </label>
                          <input
                            type="number"
                            value={v.quantityOrdered}
                            onChange={(e) =>
                              updatePOItem(
                                index,
                                i,
                                "quantityOrdered",
                                Number(e.target.value)
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                            min={0}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Price *
                          </label>
                          <input
                            type="number"
                            value={v.unitPrice}
                            onChange={(e) =>
                              updatePOItem(
                                index,
                                i,
                                "unitPrice",
                                Number(e.target.value)
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                            step="0.01"
                            min={0}
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Total
                            </label>
                            <div className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-900">
                              {formatMoney(v.total)}
                            </div>
                          </div>

                          {item.variants.length > 1 && (
                            <button
                              className="self-center text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                              title="Remove variant"
                              onClick={() => removeVariant(index, i)}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                {formatMoney(totals.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Status
          </label>
          <select
            value={newPOForm.paymentStatus}
            onChange={(e) =>
              setNewPOForm((prev) => ({
                ...prev,
                paymentStatus: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remarks
          </label>
          <textarea
            value={newPOForm.remarks}
            onChange={(e) =>
              setNewPOForm((prev) => ({ ...prev, remarks: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
