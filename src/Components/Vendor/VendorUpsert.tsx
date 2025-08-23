import { Timestamp } from "firebase/firestore";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { vendorsAPI } from "../../Api/firebaseVendor";
import type { VendorModel } from "../../Model/VendorModel";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export function VendorUpsert() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState<boolean>(!!id);
  const [saving, setSaving] = useState<boolean>(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [state, setStateVal] = useState("");
  const [gstNumber, setGstNumber] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const v = await vendorsAPI.get(id);
        if (v) {
          setName(v.name || "");
          setEmail(v.email || "");
          setPhone(v.phone || "");
          setAddress(v.address || "");
          setPinCode(v.pinCode || "");
          setStateVal(v.state || "");
          setGstNumber(v.gstNumber || "");
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    try {
      const payload: Omit<VendorModel, "id"> = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        pinCode: pinCode.trim() || undefined,
        state: state.trim() || undefined,
        gstNumber: gstNumber.trim() || undefined,
        createdAt: Timestamp.now(),
      };

      if (isEdit && id) {
        await vendorsAPI.update(id, payload);
        nav(`/vendors/${id}`);
      } else {
        const saved = await vendorsAPI.create(payload);
        nav(`/vendors/${saved.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => nav(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="text-sm text-muted-foreground">
          {isEdit ? "Edit" : "Create"} Vendor
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit vendor" : "New vendor"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Vendor name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91…"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="gst">GST / Tax ID</Label>
                  <Input
                    id="gst"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="GSTIN / Tax ID"
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, City, State, PIN"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setStateVal(e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pincode">PIN Code</Label>
                  <Input
                    id="pincode"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="560001"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => nav(-1)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
                  {isEdit ? "Save changes" : "Create"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
