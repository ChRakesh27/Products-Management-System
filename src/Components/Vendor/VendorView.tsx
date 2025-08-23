import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { vendorsAPI } from "../../Api/firebaseVendor";
import type { VendorModel } from "../../Model/VendorModel";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function VendorView() {
  const nav = useNavigate();
  const { id } = useParams();
  const [v, setV] = useState<VendorModel | null>(null);

  useEffect(() => {
    if (!id) return;
    vendorsAPI.get(id).then(setV);
  }, [id]);

  const onDelete = async () => {
    if (!id) return;
    if (!confirm("Delete this vendor? This cannot be undone.")) return;
    await vendorsAPI.remove(id);
    nav("/vendors");
  };

  if (!v) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => nav(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => nav(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => nav(`/vendors/${v.id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{v.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground">Email</div>
            <div className="font-medium">{v.email}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Phone</div>
            <div className="font-medium">{v.phone || "—"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">GST / Tax ID</div>
            <div className="font-medium">{v.gstNumber || "—"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">State</div>
            <div className="font-medium">{v.state || "—"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">PIN Code</div>
            <div className="font-medium">{v.pinCode || "—"}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-sm text-muted-foreground">Address</div>
            <div className="font-medium whitespace-pre-wrap">
              {v.address || "—"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
