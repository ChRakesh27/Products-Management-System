import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { rawMaterialsAPI } from "../../Api/firebaseRawMaterial";
import generateUUID from "../../Constants/generateUniqueId";
import { sanitizeNumberInput } from "../../Constants/sanitizeNumberInput";
import unitTypes from "../../Constants/unitTypes";
import type { RawMaterialModel } from "../../Model/RawMaterial";

import ToastMSG from "../ui/Toaster";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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

export default function RawMaterialForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<Omit<RawMaterialModel, "id">>({
    uid: generateUUID(),
    name: "",
    description: "",
    size: "",
    color: "",
    unitType: "",
    quantity: 0,
    quantityUsed: 0,
    quantityWastage: 0,
    estimatedPrice: 0,
    actualPrice: 0,
    gst: 0,
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const data = await rawMaterialsAPI.get(id);
      if (!data) {
        ToastMSG?.("error", "Raw material not found");
        navigate("/materials");
        return;
      }
      setForm({
        uid: data.uid || form.uid,
        name: data.name || "",
        description: data.description || "",
        size: data.size || "",
        color: data.color || "",
        unitType: data.unitType || "",
        quantity: Number(data.quantity) || 0,
        quantityUsed: Number(data.quantityUsed) || 0,
        quantityWastage: Number(data.quantityWastage) || 0,
        estimatedPrice: Number(data.estimatedPrice) || 0,
        actualPrice: Number(data.actualPrice) || 0,
        gst: Number(data.gst) || 0,
      });
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  const handleChange = (field: keyof RawMaterialModel, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit && id) {
        await rawMaterialsAPI.update(id, form);
        ToastMSG?.("success", "Material updated");
      } else {
        await rawMaterialsAPI.create(form);
        ToastMSG?.("success", "Material created");
      }
      navigate("/materials");
    } catch (err) {
      console.error(err);
      ToastMSG?.("error", "Failed to save material");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl p-4 sm:p-6">
      <Card className="overflow-hidden rounded-2xl border shadow-sm">
        {/* colorful but simple header band */}
        <CardHeader className="py-4 border-b bg-gradient-to-r from-sky-50 via-indigo-50 to-white">
          <CardTitle className="text-lg sm:text-xl">
            {isEdit ? "Edit Raw Material" : "Create Raw Material"}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-5 space-y-5">
          {/* Basic fields only (no extras) */}
          <div className="grid gap-4">
            <div>
              <Label>
                Name <span className="text-rose-600">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Cotton Fabric"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Notes or extra info…"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Size</Label>
                <Input
                  value={form.size}
                  onChange={(e) => handleChange("size", e.target.value)}
                  placeholder="58 in / L"
                />
              </div>
              <div>
                <Label>Color</Label>
                <Input
                  value={form.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  placeholder="Navy"
                />
              </div>
              <div>
                <Label>Unit Type</Label>
                <Select
                  value={form.unitType}
                  onValueChange={(value: string) =>
                    handleChange("unitType", value)
                  }
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Estimated Price</Label>
                <Input
                  value={form.estimatedPrice === 0 ? "" : form.estimatedPrice}
                  onChange={(e) =>
                    handleChange(
                      "estimatedPrice",
                      sanitizeNumberInput(e.target.value)
                    )
                  }
                  inputMode="decimal"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>GST</Label>
                <Input
                  value={form.gst === 0 ? "" : form.gst}
                  onChange={(e) =>
                    handleChange("gst", sanitizeNumberInput(e.target.value))
                  }
                  inputMode="decimal"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/materials")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.name.trim()}>
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
