import { Timestamp } from "firebase/firestore";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { poGivenAPI } from "../../Api/firebasePOsGiven";
import { poReceivedAPI } from "../../Api/firebasePOsReceived";
import { rawMaterialsAPI } from "../../Api/firebaseRawMaterial";
import { vendorsAPI } from "../../Api/firebaseVendor";
import currency from "../../Constants/Currency";
import generateUUID from "../../Constants/generateUniqueId";
import { sanitizeNumberInput } from "../../Constants/sanitizeNumberInput";
import unitTypes from "../../Constants/unitTypes";
import { useLoading } from "../../context/LoadingContext";
import type { POGivenModel, POReceivedModel } from "../../Model/POEntry";
import type { PartnerModel } from "../../Model/VendorModel";
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
import { Textarea } from "../ui/textarea";
import ToastMSG from "../ui/Toaster";

const emptyProduct = (data: any = {}) => ({
  id: data.id || generateUUID(),
  materialId: data.materialId || "",
  name: data.name || "",
  description: data.description || "",
  size: data.size || "",
  color: data.color || "",
  unitType: data.unitType || "",
  quantity: data.quantity || 0,
  estimatePrice: data.estimatePrice || 0,
  actualPrice: data.actualPrice || 0,
  total: data.total || 0,
  gst: data.gst || 0,
});

// ---- Component ------------------------------------------------------------

function SetPoGiven() {
  const { id } = useParams();
  const { setLoading } = useLoading();
  const navigate = useNavigate();

  const [newPOForm, setNewPOForm] = useState<POGivenModel>({
    supplier: null,
    poNo: "",
    poReceivedNumber: "",
    poReceivedId: "",
    poDate: Timestamp.now(),
    deliveryDate: Timestamp.now(),
    paymentStatus: "Pending",
    status: "Pending",
    remarks: "",
    products: [emptyProduct()],
    totalAmount: 0,
    notes: "",
    termConditions: "",
  });
  const [poReceived, setPoReceived] = useState<POReceivedModel[]>([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [parties, setParties] = useState<PartnerModel[]>([]);

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
          const price =
            (field === "actualPrice" ? +value : +p.actualPrice) || 0;
          const gst = (field === "gst" ? +value : +p.gst) || 0;
          const taxAmount = (price * gst) / 100;
          const total =
            (price + taxAmount) *
            ((field === "quantity" ? +value : +p.quantity) || 0);
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
      const ref = await poGivenAPI.create(newPOForm);
      ToastMSG("success", "Successfully created the PO");
      navigate("/po-given/" + ref.id);
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
        let data = (await poGivenAPI.get(id)) as POGivenModel;
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
    const fetchPOReceivedData = async () => {
      setLoading(true);
      try {
        const data = await poReceivedAPI.getAll();
        setPoReceived(data);
      } catch (error) {
        console.log("🚀 ~ fetchPOData ~ error:", error);
      } finally {
        setLoading(false);
      }
    };
    vendorsAPI.list("Vendor").then(setParties);
    fetchPOData();
    fetchPOReceivedData();
  }, []);

  async function onSelectPOReceived(poId) {
    const selectedPoR = poReceived.find((p) => p.id == poId);

    setNewPOForm((pre) => ({
      ...pre,
      poReceivedId: selectedPoR.id,
      poReceivedNumber: selectedPoR.poNo,
    }));
    const rawMaterialsData = selectedPoR.products.flatMap(
      (item) => item.rawMaterials
    );

    const results = await Promise.all(
      rawMaterialsData.map(async (m) => {
        if (!m?.materialId) {
          return { materialId: generateUUID(), ...m };
        }
        const res = await rawMaterialsAPI.get(m.materialId);
        return {
          materialId: res.id,
          name: res.name,
          description: res.description,
          size: res.size,
          color: res.color,
          unitType: res.unitType,
          quantity: m.quantity,
          quantityNeed: m.quantity,
          gst: res.gst || 0,
          estimatePrice: res.estimatedPrice,
          actualPrice: res.estimatedPrice,
          total: res.estimatedPrice * m.quantity,
        };
      })
    );
    setRawMaterials(results);
  }

  function onSelectMaterial(index: number, mId: string) {
    const selectedMaterial = rawMaterials.find((m) => m.materialId == mId);
    setNewPOForm((prev) => {
      let totalAmount = 0;
      const products = prev.products.map((p, i) => {
        if (i !== index) {
          totalAmount += p.total;
          return p;
        }
        totalAmount += selectedMaterial.total;
        return { id: p.id, ...selectedMaterial };
      });
      return { ...prev, products, totalAmount };
    });
  }

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
              Suppler Name *
            </Label>
            <PartiesSelection
              parties={parties}
              value={newPOForm.supplier?.id || ""}
              onChange={(val) =>
                setNewPOForm((prev) => ({ ...prev, supplier: val }))
              }
              placeholder={"Select the Buyer"}
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              PO Number
            </Label>
            <Input
              type="text"
              value={newPOForm.poNo}
              onChange={(e) =>
                setNewPOForm((prev) => ({ ...prev, poNo: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="PO Number"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              PO Received Number
            </Label>
            <Select
              value={newPOForm.poReceivedId}
              onValueChange={(val) => onSelectPOReceived(val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select PO Received" />
              </SelectTrigger>
              <SelectContent>
                {poReceived.map((poR) => (
                  <SelectItem key={poR.id} value={poR.id}>
                    {poR.poNo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              Add Material
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
                    Material #{index + 1}
                  </span>
                  <div className="">
                    {/* <button
                      onClick={() => duplicateProduct(item)}
                      className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition-colors"
                      title="Remove style"
                    >
                      <Copy className="w-5 h-5" />
                    </button> */}
                    {newPOForm.products.length > 1 && (
                      <button
                        onClick={() => removePOItem(index)}
                        className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Remove Material"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Material Name *</Label>
                    {/* <Input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        updatePOItem(index, "name", e.target.value)
                      }
                      placeholder="Enter Material name"
                    /> */}
                    <Select
                      value={item.materialId}
                      onValueChange={(val) => onSelectMaterial(index, val)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select PO Received" />
                      </SelectTrigger>
                      <SelectContent>
                        {rawMaterials.map((rm) => (
                          <SelectItem key={rm.materialId} value={rm.materialId}>
                            {rm.name} {rm.size} {rm.color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="grid grid-cols-7 gap-4">
                    <div>
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
                    <div>
                      <Label>Size</Label>
                      <Input
                        type="text"
                        value={item.size}
                        // onChange={(e) =>
                        //   updatePOItem(index, "size", e.target.value)
                        // }
                        placeholder="S, M, L, XL"
                        readOnly
                        disabled
                      />
                    </div>
                    <div>
                      <Label>Color</Label>
                      <Input
                        type="text"
                        value={item.color}
                        // onChange={(e) =>
                        //   updatePOItem(index, "color", e.target.value)
                        // }
                        placeholder="Enter color(s)"
                        readOnly
                        disabled
                      />
                    </div>
                    <div>
                      <Label>Estimated price </Label>
                      <Input
                        type="text"
                        value={item.estimatePrice}
                        placeholder="0.00"
                        step="0.01"
                        min={0}
                        readOnly
                        disabled
                      />
                    </div>
                    <div>
                      <Label>Actual Price *</Label>
                      <Input
                        type="text"
                        value={item.actualPrice}
                        onChange={(e) =>
                          updatePOItem(
                            index,
                            "actualPrice",
                            sanitizeNumberInput(e.target.value)
                          )
                        }
                        placeholder="0.00"
                        step="0.01"
                        min={0}
                      />
                    </div>
                    <div>
                      <Label>Gst</Label>
                      <Input
                        type="text"
                        value={item.gst}
                        onChange={(e) =>
                          updatePOItem(
                            index,
                            "gst",
                            sanitizeNumberInput(e.target.value)
                          )
                        }
                        placeholder="0.00"
                        step="0.01"
                        min={0}
                      />
                    </div>
                    {/* <div>
                      <Label>Ordered Qty </Label>
                      <Input
                        type="text"
                        value={item.quantityNeed}
                        placeholder="0.00"
                        step="0.01"
                        min={0}
                        readOnly
                        disabled
                      />
                    </div> */}
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="text"
                        value={item.quantity}
                        onChange={(e) =>
                          updatePOItem(
                            index,
                            "quantity",
                            sanitizeNumberInput(e.target.value)
                          )
                        }
                        placeholder="0"
                        min={0}
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <div className="w-full">
                        <Label>Total Value</Label>
                        <div className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-900">
                          {currency(item.total)}
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
                {currency(newPOForm.totalAmount)}
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
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Term and Conditions
          </Label>
          <Textarea
            value={newPOForm.termConditions}
            onChange={(e) =>
              setNewPOForm((prev) => ({
                ...prev,
                termConditions: e.target.value,
              }))
            }
            rows={3}
            placeholder="Additional remarks, special instructions, or notes..."
          />
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </Label>
          <Textarea
            value={newPOForm.notes}
            onChange={(e) =>
              setNewPOForm((prev) => ({ ...prev, notes: e.target.value }))
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

export default SetPoGiven;
