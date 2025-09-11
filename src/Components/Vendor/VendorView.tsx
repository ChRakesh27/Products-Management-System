import {
  ArrowLeft,
  Building2,
  Clock,
  Edit2,
  Hash,
  IdCard,
  Landmark,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { vendorsAPI } from "../../Api/firebaseVendor";
import type { PartnerModel } from "../../Model/VendorModel";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

/* ----------------------------- utils ----------------------------- */

function tsToDate(ts: any): Date | null {
  if (!ts) return null;
  // Handles Firestore Timestamp or { seconds, nanoseconds }
  if (ts.toDate) return ts.toDate();
  if (typeof ts.seconds === "number") {
    const ms = ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1e6);
    return new Date(ms);
  }
  return null;
}

function fmtDateTime(ts: any) {
  const d = tsToDate(ts);
  return d ? d.toLocaleString() : "—";
}

const typeTone = (t?: string) =>
  (t || "").toLowerCase() === "customer"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-violet-50 text-violet-700 border-violet-200";

/** Color-banded section */
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
    <Card className="overflow-hidden rounded-xl border shadow-sm">
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

export default function PartnerView() {
  const { id } = useParams();
  const nav = useNavigate();

  const [item, setItem] = useState<PartnerModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const data = await vendorsAPI.get(id);
        setItem(data ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (!id) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p className="text-sm text-red-600">Missing partner id.</p>
      </div>
    );
  }

  if (loading || !item) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <Card className="p-8">
          <div className="h-4 w-44 rounded bg-slate-200" />
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded border bg-slate-50" />
            ))}
          </div>
          <div className="mt-6 h-64 rounded border bg-slate-50" />
        </Card>
      </div>
    );
  }

  const {
    name,
    type,
    email,
    phone,
    gstNumber,
    panNo,
    cin,
    shippingAddress,
    billingAddress,
    createdAt,
    updatedAt,
  } = item;

  return (
    <div className="w-full">
      {/* Top bar */}
      <div className="sticky top-0 z-10  sm:mx-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between py-3 px-6">
          <Button variant="ghost" onClick={() => nav(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => nav(`/partners/${id}/edit`)}
            >
              <Edit2 className=" h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
        <Separator />
      </div>
      <div className="mx-auto max-w-7xl p-4 sm:p-6 space-y-6">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {name || "—"}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Created:{" "}
                    {fmtDateTime(createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Updated:{" "}
                    {fmtDateTime(updatedAt)}
                  </span>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`border px-3 py-1.5 ${typeTone(type)}`}
              >
                {type || "—"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-5">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <MetaRow
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={
                  email ? (
                    <a
                      className="underline underline-offset-2"
                      href={`mailto:${email}`}
                    >
                      {email}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              <MetaRow
                icon={<Phone className="h-4 w-4" />}
                label="Phone"
                value={
                  phone ? (
                    <a
                      className="underline underline-offset-2"
                      href={`tel:${phone}`}
                    >
                      {phone}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              <MetaRow
                icon={<Landmark className="h-4 w-4" />}
                label="GST / Tax ID"
                value={gstNumber || "—"}
              />
              <MetaRow
                icon={<IdCard className="h-4 w-4" />}
                label="PAN"
                value={panNo || "—"}
              />
              <MetaRow
                icon={<Hash className="h-4 w-4" />}
                label="CIN"
                value={cin || "—"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Addresses */}
        <Section
          title="Addresses"
          subtitle="Shipping and Billing details"
          color="amber"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <AddressCard
              title="Shipping Address"
              address={shippingAddress?.address}
              pin={shippingAddress?.pinCode}
              state={shippingAddress?.state}
              stateCode={shippingAddress?.stateCode}
            />
            <AddressCard
              title="Billing Address"
              address={billingAddress?.address}
              pin={billingAddress?.pinCode}
              state={billingAddress?.state}
              stateCode={billingAddress?.stateCode}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}

/* ----------------------------- tiny bits ----------------------------- */

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-md border bg-white p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-sm font-semibold break-words">{value}</div>
    </div>
  );
}

function AddressCard({
  title,
  address,
  pin,
  state,
  stateCode,
}: {
  title: string;
  address?: string;
  pin?: string;
  state?: string;
  stateCode?: string;
}) {
  return (
    <Card className="overflow-hidden border">
      <CardHeader className="py-2 border-b bg-slate-50/60">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div className="text-sm font-medium whitespace-pre-wrap">
            {address || "—"}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{state || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{stateCode || "—"}</span>
          </div>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">PIN:</span>{" "}
          <span className="font-medium">{pin || "—"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
