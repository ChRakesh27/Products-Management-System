// components/Machine.tsx
import { Info, Plus, Save, Settings, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getDailyDocByDate,
  upsertDailyProductionForDate,
} from "../../Api/firebaseDailyProduction";
import type { MachineRow } from "../../Model/DailyProductionModel";
import { useLoading } from "../../context/LoadingContext";
import { DatePicker } from "../ui/DatePicker";
import ToastMSG from "../ui/Toaster";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

function emptyRow(): MachineRow {
  return {
    name: "",
    type: "",
    runningHours: 0,
    downtime: 0,
    maintenanceType: "",
    efficiency: 0,
    operator: "",
    notes: "",
  };
}

function Machine() {
  const [machineData, setMachineData] = useState<MachineRow[]>([emptyRow()]);
  const { setLoading } = useLoading();
  const currentDate = new Date();
  const d =
    currentDate.getFullYear() +
    "-" +
    String(currentDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(currentDate.getDate()).padStart(2, "0");
  const [date, setDate] = useState<string>(d);
  const [saving, setSaving] = useState(false);

  const addMachineRow = () => setMachineData((prev) => [...prev, emptyRow()]);
  const removeMachineRow = (index: number) =>
    setMachineData((prev) => prev.filter((_, i) => i !== index));

  const updateRow = (index: number, field: keyof MachineRow, value: string) => {
    setMachineData((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const next = { ...row } as any;
        if (["runningHours", "downtime", "efficiency"].includes(field)) {
          next[field] = Number(value) || 0;
        } else {
          next[field] = value;
        }
        return next as MachineRow;
      })
    );
  };

  const handleSave = async () => {
    if (!date) {
      ToastMSG("error", "Please select a date.");
      return;
    }
    const hasMissing = machineData.some((m) => !m.name.trim());
    if (hasMissing) {
      ToastMSG("error", "Please fill Machine Name for all rows.");
      return;
    }

    try {
      setSaving(true);
      await upsertDailyProductionForDate(date, "machines", machineData);
      ToastMSG("success", "Saved machine log");
    } catch (e) {
      console.error(e);
      ToastMSG("error", "Failed to save machine log");
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
        setLoading(false);
        const existing = await getDailyDocByDate(date);
        if (existing?.machines)
          setMachineData(existing.machines as MachineRow[]);
        else setMachineData([emptyRow()]);
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
          <Settings className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Machine Performance Data
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
              Machine Details
            </h4>
            <Button
              type="button"
              onClick={addMachineRow}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Machine
            </Button>
          </div>

          {machineData.map((machine, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-medium text-gray-900">
                  Machine #{index + 1}
                </h5>
                {machineData.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeMachineRow(index)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
                <div>
                  <Label>Machine Name *</Label>
                  <Input
                    type="text"
                    value={machine.name}
                    onChange={(e) => updateRow(index, "name", e.target.value)}
                    placeholder="Machine ID/Name"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={machine.type}
                    onValueChange={(val) => updateRow(index, "type", val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cutting">Cutting Machine</SelectItem>
                      <SelectItem value="sewing">Sewing Machine</SelectItem>
                      <SelectItem value="overlock">Overlock Machine</SelectItem>
                      <SelectItem value="buttonhole">
                        Buttonhole Machine
                      </SelectItem>
                      <SelectItem value="pressing">Pressing Machine</SelectItem>
                      <SelectItem value="packaging">
                        Packaging Machine
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Running Hours</Label>
                  <Input
                    type="number"
                    value={machine.runningHours}
                    onChange={(e) =>
                      updateRow(index, "runningHours", e.target.value)
                    }
                    placeholder="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <Label>Downtime (hrs)</Label>
                  <Input
                    type="number"
                    value={machine.downtime}
                    onChange={(e) =>
                      updateRow(index, "downtime", e.target.value)
                    }
                    placeholder="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <Label>Maintenance</Label>
                  <Select
                    value={machine.maintenanceType}
                    onValueChange={(val) =>
                      updateRow(index, "maintenanceType", val)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="preventive">Preventive</SelectItem>
                      <SelectItem value="breakdown">Breakdown</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Efficiency %</Label>
                  <Input
                    type="number"
                    value={machine.efficiency}
                    onChange={(e) =>
                      updateRow(index, "efficiency", e.target.value)
                    }
                    placeholder="0"
                    max={100}
                  />
                </div>
                <div>
                  <Label>Operator</Label>
                  <Input
                    type="text"
                    value={machine.operator}
                    onChange={(e) =>
                      updateRow(index, "operator", e.target.value)
                    }
                    placeholder="Operator name"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input
                    type="text"
                    value={machine.notes}
                    onChange={(e) => updateRow(index, "notes", e.target.value)}
                    placeholder="Issues, repairs, etc."
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

export default Machine;
