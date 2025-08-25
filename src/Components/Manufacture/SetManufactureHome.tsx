// src/components/manufactures/ManufactureUpsert.tsx
import { Timestamp } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { manufacturesAPI } from "../../Api/firebaseManufacture";
import { productsAPI } from "../../Api/firebaseProducts";
import DateFormate from "../../Constants/DateFormate";
import type { ProductModel } from "../../Model/ProductModel";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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

export default function SetManufactureHome() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // Form state
  const [productId, setProductId] = useState("");
  const [planedUnits, setPlanedUnits] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>(""); // yyyy-mm-dd
  const [endDate, setEndDate] = useState<string>("");
  const [remarks, setRemarks] = useState("");

  const [products, setProducts] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const canSubmit = useMemo(
    () => productId.trim() && planedUnits > 0 && startDate.length > 0,
    [productId, planedUnits, startDate]
  );

  // Load products for selection
  useEffect(() => {
    (async () => {
      const list: ProductModel[] = await productsAPI.getAll();
      setProducts(list);
    })();
  }, []);

  // If editing, load manufacture
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
        setProductId(doc.productId);
        setPlanedUnits(Number(doc.planedUnits || 0));
        setRemarks(doc.remarks || "");
        setStartDate(DateFormate(doc.startDate, "YYYY-MM-DD"));
        setEndDate(DateFormate(doc.endDate, "YYYY-MM-DD"));
      } catch (e) {
        console.error(e);
        ToastMSG?.("error", "Failed to load manufacture");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setSaving(true);
      if (isEdit && id) {
        await manufacturesAPI.update(id, {
          productId,
          planedUnits,
          remarks,
          startDate: startDate ? Timestamp.fromDate(new Date(startDate)) : null,
          endDate: endDate ? Timestamp.fromDate(new Date(endDate)) : null,
        });
        ToastMSG?.("success", "Manufacture updated");
      } else {
        await manufacturesAPI.create({
          productId,
          planedUnits,
          remarks,
          startDate: startDate ? Timestamp.fromDate(new Date(startDate)) : null,
          endDate: endDate ? Timestamp.fromDate(new Date(endDate)) : null,
        });
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

  if (loading) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Loading…</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? "Edit Manufacture" : "Create Manufacture"}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label>Product *</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Planned Units *</Label>
            <Input
              type="number"
              value={planedUnits}
              min={1}
              onChange={(e) => setPlanedUnits(Number(e.target.value) || 0)}
              placeholder="e.g., 500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date *</Label>
              <DatePicker
                date={startDate}
                setDate={async (d: string) => {
                  setStartDate(d);
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label>End Date</Label>
              <DatePicker
                date={endDate}
                setDate={async (d: string) => {
                  setEndDate(d);
                }}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Remarks</Label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Notes / remarks…"
            />
          </div>

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
