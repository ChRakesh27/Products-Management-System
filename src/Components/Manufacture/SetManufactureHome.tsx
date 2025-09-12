// src/components/manufactures/ManufactureUpsert.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { manufacturesAPI } from "../../Api/firebaseManufacture";
import { poReceivedAPI } from "../../Api/firebasePOsReceived";

import type { ManufactureModel } from "../../Model/DailyProductionModel";

import type { POReceivedModel } from "../../Model/POEntry";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DatePicker } from "../ui/DatePicker";
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

export default function SetManufactureHome() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // PO list for dropdown
  const [poList, setPoList] = useState<POReceivedModel[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // SINGLE state object for the whole form
  const [manufacture, setManufacture] = useState<ManufactureModel>({
    products: [],
    poNo: "",
    poId: "",
    remarks: "",
    startDate: null,
    endDate: null,
    planedUnits: 0,
  });

  // Helpers to update single state
  const setField = <K extends keyof ManufactureModel>(
    key: K,
    value: ManufactureModel[K]
  ) => setManufacture((prev) => ({ ...prev, [key]: value }));

  // Load POs for selection
  useEffect(() => {
    (async () => {
      const list = await poReceivedAPI.getAll();
      setPoList(list as unknown as POReceivedModel[]);
    })();
  }, []);

  // If editing, load the manufacture and normalize dates to Date
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const doc = await manufacturesAPI.get(id);
        if (!doc) {
          ToastMSG?.("error", "Manufacture not found");
          navigate("/manufactures");
          return;
        }
        setManufacture(doc);
      } catch (e) {
        console.error(e);
        ToastMSG?.("error", "Failed to load manufacture");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const canSubmit = Boolean(manufacture.poId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setSaving(true);
      if (isEdit && id) {
        await manufacturesAPI.update(id, manufacture);
        ToastMSG?.("success", "Manufacture updated");
      } else {
        await manufacturesAPI.create(manufacture);
        ToastMSG?.("success", "Manufacture created");
      }
      navigate("/manufactures");
    } catch (err) {
      console.error(err);
      ToastMSG?.("error", "Failed to save manufacture");
    } finally {
      setSaving(false);
    }
  };

  function onSelectPo(poId) {
    const selectedPo = poList.find((p) => p.id == poId);
    setManufacture((prev) => ({
      ...prev,
      poId: poId,
      poNo: selectedPo.poNo,
      products: selectedPo.products as [],
      endDate: selectedPo.deliveryDate,
    }));
  }

  if (loading) {
    return (
      <Card className="max-w-3xl mx-auto py-5">
        <CardHeader>
          <CardTitle>Loading…</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto grid gap-6 py-6">
      <Card className="py-6">
        <CardHeader>
          <CardTitle>
            {isEdit ? "Edit Manufacture" : "Create Manufacture"}
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6">
          {/* Select PO */}
          <div className="grid gap-2">
            <Label>Select PO *</Label>
            <Select
              value={manufacture.poId || ""}
              onValueChange={(v) => {
                onSelectPo(v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select PO" />
              </SelectTrigger>
              <SelectContent>
                {poList.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.poNo || p.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date *</Label>
              <DatePicker
                date={manufacture.startDate as any}
                setDate={(d) => setField("startDate", d ?? null)}
              />
            </div>
            <div className="grid gap-2">
              <Label>End Date</Label>
              <DatePicker
                date={manufacture.endDate as any}
                setDate={(d) => setField("endDate", d ?? null)}
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="grid gap-2">
            <Label>Remarks</Label>
            <Textarea
              value={manufacture.remarks || ""}
              onChange={(e) => setField("remarks", e.target.value)}
              placeholder="Notes / remarks…"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/manufactures")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || saving}>
              {saving ? "Saving…" : isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
