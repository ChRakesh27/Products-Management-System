import { Timestamp } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { vendorsAPI } from "../../Api/firebaseVendor";
import type { TimestampModel } from "../../Model/Date";
import type { PartnerModel } from "../../Model/VendorModel";

import { sanitizeNumberInput } from "../../Constants/sanitizeNumberInput";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

/* ----------------------------- helpers ----------------------------- */

type AddressKey = keyof PartnerModel["shippingAddress"]; // "address" | "pinCode" | "state" | "stateCode"

const EMPTY_FORM: PartnerModel = {
  type: "Customer",
  name: "",
  email: "",
  phone: "",
  gstNumber: "",
  panNo: "",
  cin: "",
  shippingAddress: { address: "", pinCode: "", state: "", stateCode: "" },
  billingAddress: { address: "", pinCode: "", state: "", stateCode: "" },
};

const nowTs = () => Timestamp.now() as unknown as TimestampModel;

/** Color-banded section (classic + colorful) */
function Section({
  title,
  subtitle,
  color = "sky",
  children,
}: {
  title: string;
  subtitle?: string;
  color?: "sky" | "emerald" | "amber" | "violet";
  children: React.ReactNode;
}) {
  const band: Record<string, string> = {
    sky: "from-sky-50/80 to-white border-sky-200",
    emerald: "from-emerald-50/80 to-white border-emerald-200",
    amber: "from-amber-50/80 to-white border-amber-200",
    violet: "from-violet-50/80 to-white border-violet-200",
  };
  return (
    <Card className="overflow-hidden ">
      <CardHeader
        className={`py-3 border-b bg-gradient-to-b ${band[color]} backdrop-blur-sm`}
      >
        <CardTitle className="text-base font-serif">{title}</CardTitle>
        {subtitle ? (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </CardHeader>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

/* ----------------------------- component ----------------------------- */

export function VendorUpsert() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState<boolean>(!!id);
  const [saving, setSaving] = useState<boolean>(false);
  const [sameAsShipping, setSameAsShipping] = useState<boolean>(false);

  const [form, setForm] = useState<PartnerModel>(EMPTY_FORM);

  // generic top-level updater
  const update = <K extends keyof PartnerModel>(key: K, val: PartnerModel[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  // nested address updater
  const updateAddr = (
    which: "shippingAddress" | "billingAddress",
    key: AddressKey,
    val: string
  ) =>
    setForm((f) => ({
      ...f,
      [which]: { ...f[which], [key]: val },
    }));

  // load existing
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const v = await vendorsAPI.get(id);
        if (v) {
          setForm({
            type: v.type ?? "Customer",
            name: v.name ?? "",
            email: v.email ?? "",
            phone: v.phone ?? "",
            gstNumber: v.gstNumber ?? "",
            panNo: v.panNo ?? "",
            cin: v.cin ?? "",
            shippingAddress: v.shippingAddress ?? {
              address: "",
              pinCode: "",
              state: "",
              stateCode: "",
            },
            billingAddress: v.billingAddress ?? {
              address: "",
              pinCode: "",
              state: "",
              stateCode: "",
            },
            createdAt: v.createdAt,
            updatedAt: v.updatedAt,
            id: v.id,
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const canSave =
    form.name.trim() !== "" && form.phone.trim() !== "" && !saving;

  const handleSubmit = async () => {
    if (!canSave) return;
    setSaving(true);

    const finalForm: PartnerModel = sameAsShipping
      ? { ...form, billingAddress: { ...form.shippingAddress } }
      : form;

    try {
      const payload: Omit<PartnerModel, "id"> = {
        ...finalForm,
        name: finalForm.name.trim(),
        email: finalForm.email.trim(),
        phone: finalForm.phone?.trim() ?? "",
        gstNumber: finalForm.gstNumber?.trim() ?? "",
        panNo: finalForm.panNo?.trim() ?? "",
        cin: finalForm.cin?.trim() ?? "",
        shippingAddress: {
          address: finalForm.shippingAddress.address?.trim() ?? "",
          pinCode: finalForm.shippingAddress.pinCode?.trim() ?? "",
          state: finalForm.shippingAddress.state?.trim() ?? "",
          stateCode: finalForm.shippingAddress.stateCode?.trim() ?? "",
        },
        billingAddress: {
          address: finalForm.billingAddress.address?.trim() ?? "",
          pinCode: finalForm.billingAddress.pinCode?.trim() ?? "",
          state: finalForm.billingAddress.state?.trim() ?? "",
          stateCode: finalForm.billingAddress.stateCode?.trim() ?? "",
        },
        type: finalForm.type || "Customer",
        ...(isEdit
          ? { updatedAt: nowTs() }
          : { createdAt: nowTs(), updatedAt: nowTs() }),
      };

      if (isEdit && id) {
        await vendorsAPI.update(id, payload);
        nav(`/partners/${id}`);
      } else {
        const saved = await vendorsAPI.create(payload);
        nav(`/partners/${saved.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 space-y-6">
        {/* Partner Info */}
        <Section
          title="Partner Information"
          subtitle="Basic details used across POs and invoices."
          color="sky"
        >
          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="type">Business Partner Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    update("type", v as PartnerModel["type"])
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vendor">Vendor</SelectItem>
                    <SelectItem value="Customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Partner name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="name@domain.com"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone *</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) =>
                      update("phone", sanitizeNumberInput(e.target.value))
                    }
                    placeholder="+91…"
                  />
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* Tax IDs */}
        <Section
          title="Tax & Registration"
          subtitle="Provide your statutory identifiers."
          color="emerald"
        >
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="gst">GST / Tax ID</Label>
              <div className="relative">
                <Input
                  id="gst"
                  value={form.gstNumber}
                  onChange={(e) => update("gstNumber", e.target.value)}
                  placeholder="GSTIN / Tax ID"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pan">PAN</Label>
              <div className="relative">
                <Input
                  id="pan"
                  value={form.panNo}
                  onChange={(e) => update("panNo", e.target.value)}
                  placeholder="ABCDE1234F"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cin">CIN</Label>
              <Input
                id="cin"
                value={form.cin}
                onChange={(e) => update("cin", e.target.value)}
                placeholder="L12345AA2024PLC000001"
              />
            </div>
          </div>
        </Section>

        {/* Shipping Address */}
        <Section
          title="Shipping Address"
          subtitle="Default address for deliveries."
          color="amber"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="ship-address">Address</Label>
              <div className="relative">
                <Textarea
                  id="ship-address"
                  value={form.shippingAddress.address}
                  onChange={(e) =>
                    updateAddr("shippingAddress", "address", e.target.value)
                  }
                  placeholder="Street, City"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ship-state">State</Label>
              <Input
                id="ship-state"
                value={form.shippingAddress.state}
                onChange={(e) =>
                  updateAddr("shippingAddress", "state", e.target.value)
                }
                placeholder="State"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ship-stateCode">State Code</Label>
              <Input
                id="ship-stateCode"
                value={form.shippingAddress.stateCode}
                onChange={(e) =>
                  updateAddr("shippingAddress", "stateCode", e.target.value)
                }
                placeholder="e.g., 29"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ship-pin">PIN Code</Label>
              <Input
                id="ship-pin"
                value={form.shippingAddress.pinCode}
                onChange={(e) =>
                  updateAddr("shippingAddress", "pinCode", e.target.value)
                }
                placeholder="560001"
              />
            </div>
          </div>

          <Separator className="my-4" />

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={sameAsShipping}
              onCheckedChange={(v) => setSameAsShipping(Boolean(v))}
            />
            Billing address same as shipping
          </label>
        </Section>

        {/* Billing Address */}
        <Section
          title="Billing Address"
          subtitle="Used for invoices and taxation."
          color="violet"
        >
          <fieldset
            disabled={sameAsShipping}
            className={sameAsShipping ? "opacity-70" : ""}
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="bill-address">Address</Label>
                <div className="relative">
                  <Textarea
                    id="bill-address"
                    value={
                      sameAsShipping
                        ? form.shippingAddress.address
                        : form.billingAddress.address
                    }
                    onChange={(e) =>
                      updateAddr("billingAddress", "address", e.target.value)
                    }
                    placeholder="Street, City"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bill-state">State</Label>
                <Input
                  id="bill-state"
                  value={
                    sameAsShipping
                      ? form.shippingAddress.state
                      : form.billingAddress.state
                  }
                  onChange={(e) =>
                    updateAddr("billingAddress", "state", e.target.value)
                  }
                  placeholder="State"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bill-stateCode">State Code</Label>
                <Input
                  id="bill-stateCode"
                  value={
                    sameAsShipping
                      ? form.shippingAddress.stateCode
                      : form.billingAddress.stateCode
                  }
                  onChange={(e) =>
                    updateAddr("billingAddress", "stateCode", e.target.value)
                  }
                  placeholder="e.g., 29"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bill-pin">PIN Code</Label>
                <Input
                  id="bill-pin"
                  value={
                    sameAsShipping
                      ? form.shippingAddress.pinCode
                      : form.billingAddress.pinCode
                  }
                  onChange={(e) =>
                    updateAddr("billingAddress", "pinCode", e.target.value)
                  }
                  placeholder="560001"
                />
              </div>
            </div>
          </fieldset>
        </Section>
      </div>

      {/* Actions (responsive) */}
      <div className="sticky px-4 sm:px-6 bottom-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60  border-t  ">
        <div className="flex items-center justify-end gap-2 py-3">
          <Button variant="outline" onClick={() => nav(-1)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSave}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}
