import { Box, Info, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getDailyDocByDate,
  upsertDailyProductionForDate,
} from "../../Api/firebaseDailyProduction";
import type { MaterialRow } from "../../Model/DailyProductionModel";
import { useLoading } from "../../context/LoadingContext";
import { DatePicker } from "../ui/DatePicker";
import ToastMSG from "../ui/Toaster";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

function MaterialUsage({ product }) {
  const [materialData, setMaterialData] = useState([]);
  const [saving, setSaving] = useState(false);
  const { setLoading } = useLoading();
  const currentDate = new Date();
  const d =
    currentDate.getFullYear() +
    "-" +
    String(currentDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(currentDate.getDate()).padStart(2, "0");
  const [date, setDate] = useState<string>(d);

  const removeRow = (index: number) => {
    setMaterialData((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (
    index: number,
    field: keyof MaterialRow,
    value: string | number
  ) => {
    setMaterialData((prev) => {
      const next = structuredClone(prev) as typeof prev;
      const row = next[index];
      if (!row) return prev;

      // numeric fields stay strings in state, coerce on save
      if (field === "used" || field === "wastage") {
        (row as any)[field] = value;
      } else {
        (row as any)[field] = value;
      }
      return next;
    });
  };

  // ---- validation ----
  const isValid = useMemo(() => {
    if (!date || materialData?.length == 0) return false;
    // require name + used for each row
    return materialData.every((m) => Number(m.used) >= 0);
  }, [materialData]);

  // ---- submit (no backend) ----
  const handleSave = async () => {
    try {
      if (!isValid) {
        ToastMSG(
          "error",
          "Please fill Date, Material Name and Quantity Used for all rows."
        );
        return;
      }
      setSaving(true);
      const payload = materialData.map((ele) => ({
        id: ele.id,
        materialId: ele.materialId,
        used: ele.used,
        wastage: ele.wastage,
        unit: ele.unit,
        notes: ele.notes,
      }));
      await upsertDailyProductionForDate(date, "materials", payload);
      ToastMSG("success", "Saved material log");
    } catch (e) {
      console.error(e);
      ToastMSG("error", "Failed to save material log");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (!date) {
        return;
      }
      try {
        setLoading(true);
        const existing = await getDailyDocByDate(date);

        if (existing?.materials) {
          const data = product.rawMaterials.map((ele) => {
            const materialData = existing.materials.find(
              (mEle) => mEle?.id == ele.id
            );
            return {
              ...ele,
              used: materialData.used,
              wastage: materialData.wastage,
              unit: materialData.unit,
              notes: materialData.notes,
            };
          });
          setMaterialData(data);
        } else {
          const data = product.rawMaterials.map((ele) => ({
            ...ele,
            used: 0,
            wastage: 0,
            unit: 0,
            notes: "",
          }));
          setMaterialData(data);
        }
      } catch (error) {
        console.log("🚀 ~ fetchData ~ error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [date]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <Box className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Daily Material Usage Entry
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label>Date *</Label>
            <DatePicker
              date={date}
              setDate={async (d: string) => {
                setDate(d);
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">
              Material Consumption
            </h4>
            {/* <Button
              type="button"
              onClick={addRow}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </Button> */}
          </div>

          {materialData.map((material, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-700 font-medium">
                  Row #{index + 1}
                </div>
                {materialData.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeRow(index)}
                    className="text-red-600 hover:text-red-700 flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label>Material Name *</Label>
                  {material.color}/{material.size}
                </div>

                <div>
                  <Label>Quantity Used *</Label>
                  <Input
                    type="number"
                    value={material.used}
                    onChange={(e) => updateRow(index, "used", +e.target.value)}
                    placeholder="0"
                    min={0}
                  />
                </div>

                <div>
                  <Label>Wastage</Label>
                  <Input
                    type="number"
                    value={material.wastage}
                    onChange={(e) =>
                      updateRow(index, "wastage", +e.target.value)
                    }
                    placeholder="0"
                    min={0}
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input
                    type="text"
                    value={material.unit}
                    onChange={(e) => updateRow(index, "unit", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input
                    type="text"
                    value={material.notes}
                    onChange={(e) => updateRow(index, "notes", e.target.value)}
                    placeholder="Notes"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            <span>
              All required fields (*) must be filled before submission
            </span>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2 font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Submit Data"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaterialUsage;
