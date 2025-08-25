import {
  CheckCircle,
  Factory,
  Flag,
  Info,
  Package,
  Save,
  Scissors,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getDailyDocByDate,
  upsertDailyProductionForDate,
} from "../../Api/firebaseDailyProduction";
import type { productionModel } from "../../Model/DailyProductionModel";
import { useLoading } from "../../context/LoadingContext";
import { DatePicker } from "../ui/DatePicker";
import ToastMSG from "../ui/Toaster";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
function ProductionData() {
  const [saving, setSaving] = useState(false);
  const defaultData = {
    cutting: {
      planned: 0,
      actual: 0,
      staff: 0,
      machines: 0,
      supervisor: "",
      remarks: "",
    },
    sewing: {
      planned: 0,
      actual: 0,
      staff: 0,
      machines: 0,
      supervisor: "",
      remarks: "",
    },
    quality: {
      planned: 0,
      actual: 0,
      staff: 0,
      machines: 0,
      supervisor: "",
      remarks: "",
    },
    finishing: {
      planned: 0,
      actual: 0,
      staff: 0,
      machines: 0,
      supervisor: "",
      remarks: "",
    },
    inspection: {
      planned: 0,
      actual: 0,
      staff: 0,
      machines: 0,
      supervisor: "",
      remarks: "",
    },
    packaging: {
      planned: 0,
      actual: 0,
      staff: 0,
      machines: 0,
      supervisor: "",
      remarks: "",
    },
  };
  const [productionData, setProductionData] =
    useState<productionModel>(defaultData);
  const { setLoading } = useLoading();
  const currentDate = new Date();
  const d =
    currentDate.getFullYear() +
    "-" +
    String(currentDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(currentDate.getDate()).padStart(2, "0");
  const [date, setDate] = useState<string>(d);

  async function handleSave() {
    if (!date) {
      ToastMSG("error", "Please select a date.");
      return;
    }

    try {
      setSaving(true);
      await upsertDailyProductionForDate(date, "production", productionData);
      ToastMSG("success", "Saved production log");
    } catch (e) {
      console.error(e);
      ToastMSG("error", "Failed to save production log");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    async function fetchData() {
      if (!date) {
        return;
      }
      try {
        setLoading(false);
        const existing = await getDailyDocByDate(date);
        if (Object.keys(existing?.production).length)
          setProductionData(existing.production as productionModel);
        else setProductionData(defaultData as productionModel);
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
          <Factory className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Daily Production Data Entry
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <Label>Date *</Label>

            <DatePicker
              date={date}
              setDate={async (d: string) => {
                setDate(d);
              }}
            />
          </div>
          {/* <div>
            <Label >
              Shift *
            </Label>
            <select
              value={productionData.shift}
              onChange={(e) =>
                setProductionData({ ...productionData, shift: e.target.value })
              }
             
            >
              <option value="morning">Morning Shift (6 AM - 2 PM)</option>
              <option value="evening">Evening Shift (2 PM - 10 PM)</option>
              <option value="night">Night Shift (10 PM - 6 AM)</option>
            </select>
          </div> */}
        </div>

        <div className="space-y-6">
          {Object.entries(productionData).map(([processName, processData]) => (
            <div
              key={processName}
              className="bg-gray-50 rounded-lg p-6 border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-4">
                {processName === "cutting" && (
                  <Scissors className="w-5 h-5 text-orange-600" />
                )}
                {processName === "sewing" && (
                  <Settings className="w-5 h-5 text-blue-600" />
                )}
                {processName === "finishing" && (
                  <Flag className="w-5 h-5 text-purple-600" />
                )}
                {processName === "quality" && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {processName === "packaging" && (
                  <Package className="w-5 h-5 text-indigo-600" />
                )}
                <h4 className="text-lg font-medium text-gray-900 capitalize">
                  {processName}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <Label>Planned Output</Label>
                  <Input
                    type="number"
                    value={processData.planned}
                    onChange={(e) =>
                      setProductionData({
                        ...productionData,
                        [processName]: {
                          ...processData,
                          planned: +e.target.value,
                        },
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Actual Output</Label>
                  <Input
                    type="number"
                    value={processData.actual}
                    onChange={(e) =>
                      setProductionData({
                        ...productionData,
                        [processName]: {
                          ...processData,
                          actual: +e.target.value,
                        },
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>No of Staff</Label>
                  <Input
                    type="number"
                    value={processData.staff}
                    onChange={(e) =>
                      setProductionData({
                        ...productionData,
                        [processName]: {
                          ...processData,
                          staff: +e.target.value,
                        },
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>No of Machines</Label>
                  <Input
                    type="number"
                    value={processData.machines}
                    onChange={(e) =>
                      setProductionData({
                        ...productionData,
                        [processName]: {
                          ...processData,
                          machines: +e.target.value,
                        },
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Supervisor</Label>
                  <Input
                    type="text"
                    value={processData.supervisor}
                    onChange={(e) =>
                      setProductionData({
                        ...productionData,
                        [processName]: {
                          ...processData,
                          supervisor: e.target.value,
                        },
                      })
                    }
                    placeholder="Supervisor name"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label>Remarks</Label>
                <Textarea
                  value={processData.remarks}
                  onChange={(e) =>
                    setProductionData({
                      ...productionData,
                      [processName]: {
                        ...processData,
                        remarks: e.target.value,
                      },
                    })
                  }
                  rows={2}
                  placeholder="Any issues, delays, or special notes..."
                />
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
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2 font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Submit Data"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductionData;
