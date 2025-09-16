import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { poGivenAPI } from "../../Api/firebasePOsGiven";
import DateFormate from "../../Constants/DateFormate";
import { useLoading } from "../../context/LoadingContext";

import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import {
  Building2,
  ChevronDown,
  ChevronUp,
  FileText,
  Globe2,
  Link as LinkIcon,
  Truck,
  Wallet,
} from "lucide-react";
import currency from "../../Constants/Currency";
import NumberToWords from "../../Constants/NumberToWords";
import ToastMSG from "../ui/Toaster";

/* ----------------------------- helpers ----------------------------- */

const safe = (v: any, fallback = "—") =>
  typeof v === "string" ? (v.trim() ? v : fallback) : v ?? fallback;

const statusTone = (status?: string) => {
  const s = String(status || "").toLowerCase();
  if (s.includes("completed") || s.includes("paid") || s.includes("approved"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (
    s.includes("pending") ||
    s.includes("partial") ||
    s.includes("production")
  )
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (s.includes("cancel")) return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
};

const pretty = (s?: string) =>
  safe(s, "")
    .toString()
    .replace(/-/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());

/* ----------------------------- view ----------------------------- */

const PoVendorView = () => {
  const { id } = useParams();
  const [PODetails, setPODetails] = useState<any>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null); // mobile accordion
  const { setLoading } = useLoading();

  const curSymbol = PODetails?.currency?.code || "INR";

  const updatePOStatus = async (
    newStatus: string,
    field: "status" | "paymentStatus"
  ) => {
    try {
      await poGivenAPI.updateStatus(id!, { [field]: newStatus });
      setPODetails((prev: any) => ({ ...(prev || {}), [field]: newStatus }));
      ToastMSG("success", "Successfully updated the Status");
    } catch (error) {
      ToastMSG("error", "Failed updated the Status");
      console.error("updatePOStatus error:", error);
    }
  };

  useEffect(() => {
    const fetchPOData = async () => {
      setLoading(true);
      try {
        const data = await poGivenAPI.get(id!);
        setPODetails(data);
      } catch (error) {
        console.error("fetchPOData error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPOData();
  }, [id, setLoading]);

  const totals = useMemo(() => {
    const products = PODetails?.products || [];
    const count = products.length;
    const qty = products.reduce(
      (s: number, p: any) => s + Number(p?.quantity ?? 0),
      0
    );
    const value = Number(PODetails?.totalAmount ?? 0);
    return { count, qty, value };
  }, [PODetails]);

  if (!PODetails) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-white p-6">
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-lg border bg-slate-50 animate-pulse"
              />
            ))}
          </div>
          <div className="mt-6 h-64 rounded-lg border bg-slate-50 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
            Purchase Order (Vendor) Details
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={`border ${statusTone(PODetails?.status)}`}
            >
              {pretty(PODetails?.status || "Pending")}
            </Badge>
            <Badge
              variant="outline"
              className={`border ${statusTone(PODetails?.paymentStatus)}`}
            >
              {pretty(PODetails?.paymentStatus || "Pending")}
            </Badge>
            {PODetails?.dispatchTrough ? (
              <Badge
                variant="outline"
                className="border bg-sky-50 text-sky-700 border-sky-200"
              >
                {PODetails?.dispatchTrough}
              </Badge>
            ) : null}
            {PODetails?.currency?.code ? (
              <Badge
                variant="outline"
                className="border bg-violet-50 text-violet-700 border-violet-200"
              >
                {PODetails?.currency?.code}
              </Badge>
            ) : null}
          </div>
        </div>

        {/* Status controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="m-0 text-xs text-muted-foreground">Status</Label>
            <Select
              value={PODetails?.status}
              onValueChange={(val) => updatePOStatus(val, "status")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Received">Received</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="m-0 text-xs text-muted-foreground">Payment</Label>
            <Select
              value={PODetails?.paymentStatus}
              onValueChange={(val) => updatePOStatus(val, "paymentStatus")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="UnPaid">UnPaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Stat
          label="PO Number"
          value={safe(PODetails?.poNo)}
          icon={<FileText className="h-4 w-4" />}
        />
        <Stat
          label="PO Received No."
          value={safe(PODetails?.poReceivedNumber)}
          icon={<FileText className="h-4 w-4" />}
        />
        <Stat label="PO Date" value={DateFormate(PODetails?.poDate)} />
        <Stat
          label="Delivery"
          value={DateFormate(PODetails?.deliveryDate)}
          icon={<Truck className="h-4 w-4" />}
        />
        <Stat label="Materials" value={totals.count} accent="indigo" />
        <Stat
          label="PO Total"
          value={currency(PODetails?.totalAmount, curSymbol)}
          accent="emerald"
        />
      </div>

      {/* Parties & meta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vendor / Supplier block (can be null in your sample) */}
        <Section title="Supplier" icon={<Building2 className="h-4 w-4" />}>
          <KV label="Name" value={safe(PODetails?.supplier?.name)} />
          <KV label="Email" value={safe(PODetails?.supplier?.email)} />
          <KV label="Phone" value={safe(PODetails?.supplier?.phone)} />
          <KV label="GST No." value={safe(PODetails?.supplier?.gstNumber)} />
          <KV
            label="Billing Address"
            value={
              [
                PODetails?.supplier?.billingAddress?.address,
                PODetails?.supplier?.billingAddress?.pinCode,
                PODetails?.supplier?.billingAddress?.state,
              ]
                .filter(Boolean)
                .join(", ") || "—"
            }
          />
          <KV
            label="Shipping Address"
            value={
              [
                PODetails?.supplier?.shippingAddress?.address,
                PODetails?.supplier?.shippingAddress?.pinCode,
                PODetails?.supplier?.shippingAddress?.state,
              ]
                .filter(Boolean)
                .join(", ") || "—"
            }
          />
        </Section>

        {/* Routing / terms */}
        <Section title="Routing & Terms" icon={<Globe2 className="h-4 w-4" />}>
          <KV label="Destination" value={safe(PODetails?.destination)} />
          <KV
            label="Dispatch Through"
            value={safe(PODetails?.dispatchTrough)}
          />
          <KV label="PO Type" value={safe(PODetails?.poType)} />
          <KV label="Payment Terms" value={safe(PODetails?.paymentTerms)} />
          <KV
            label="Currency"
            value={`${PODetails?.currency?.code || "INR"} ${
              PODetails?.currency?.symbol || "₹"
            }`}
          />
        </Section>

        {/* Banking */}
        <Section title="Bank Details" icon={<Wallet className="h-4 w-4" />}>
          <KV
            label="Beneficiary"
            value={safe(PODetails?.bank?.beneficiaryName)}
          />
          <KV label="Bank" value={safe(PODetails?.bank?.bank)} />
          <KV label="Account" value={safe(PODetails?.bank?.bankAccount)} />
          <KV label="IFSC" value={safe(PODetails?.bank?.ifscCode)} />
          <KV label="SWIFT" value={safe(PODetails?.bank?.swiftCode)} />
          <KV label="Bank Address" value={safe(PODetails?.bank?.bankAddress)} />
          {/* If you later add fileUrl to POGiven, show it here */}
          {PODetails?.fileUrl ? (
            <div className="mt-2">
              <Label className="text-xs text-muted-foreground">PO File</Label>
              <a
                href={PODetails.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-700 hover:underline mt-1"
              >
                <LinkIcon className="inline h-4 w-4 mr-1" />
                View / Download
              </a>
            </div>
          ) : null}
        </Section>
      </div>

      {/* Items */}
      <div className="">
        <div className="flex items-center justify-between">
          <h4 className="text-base md:text-lg font-semibold text-gray-900">
            Materials ({PODetails?.products?.length || 0})
          </h4>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block mt-4 rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-[28%]">Material</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>GST %</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className="text-right">Est. Price</TableHead>
                <TableHead className="text-right">Actual Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(PODetails?.products || []).map((item: any, idx: number) => {
                const total = Number(item?.total ?? 0);
                return (
                  <TableRow key={item?.id || idx} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {safe(item?.name)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {safe(item?.description)}
                      </div>
                    </TableCell>
                    <TableCell>{safe(item?.size)}</TableCell>
                    <TableCell>{safe(item?.color)}</TableCell>
                    <TableCell>{safe(item?.unitType)}</TableCell>
                    <TableCell>{Number(item?.gst ?? 0)}%</TableCell>
                    <TableCell>{Number(item?.quantity ?? 0)}</TableCell>
                    <TableCell className="text-right">
                      {currency(Number(item?.estimatePrice ?? 0), curSymbol)}
                    </TableCell>
                    <TableCell className="text-right">
                      {currency(Number(item?.actualPrice ?? 0), curSymbol)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-900">
                      {currency(total, curSymbol)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile list with accordion */}
        <div className="md:hidden mt-3 space-y-3">
          {(PODetails?.products || []).map((item: any, idx: number) => {
            const isOpen = openIdx === idx;
            const total = Number(item?.total ?? 0);
            return (
              <div key={item?.id || idx} className="rounded-lg border p-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-between"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {safe(item?.name)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Number(item?.quantity ?? 0)} ×{" "}
                      {currency(Number(item?.actualPrice ?? 0), curSymbol)}
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>

                {isOpen && (
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="text-gray-700">
                      {safe(item?.description)}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <KV label="Size" value={safe(item?.size)} />
                      <KV label="Color" value={safe(item?.color)} />
                      <KV label="Unit" value={safe(item?.unitType)} />
                      <KV label="GST" value={`${Number(item?.gst ?? 0)}%`} />
                      <KV label="Qty" value={Number(item?.quantity ?? 0)} />
                      <KV
                        label="Est. Price"
                        value={currency(
                          Number(item?.estimatePrice ?? 0),
                          curSymbol
                        )}
                      />
                      <KV
                        label="Actual Price"
                        value={currency(
                          Number(item?.actualPrice ?? 0),
                          curSymbol
                        )}
                      />
                      <KV label="Total" value={currency(total, curSymbol)} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Grand Total */}
        <div className="mt-4 rounded-lg border bg-blue-50 p-4 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700">
            Purchase Order Total
          </div>
          <div className="text-lg sm:text-xl font-bold text-blue-700">
            {NumberToWords(
              parseInt(String(PODetails.totalAmount)),
              PODetails.currency.name
            )}
          </div>
          <div className="text-lg font-bold text-blue-700">
            {currency(PODetails?.totalAmount, curSymbol)}
          </div>
        </div>
      </div>

      {/* Terms / Notes / Remarks */}
      <div className=" grid grid-cols-1 md:grid-cols-3 gap-4">
        <RichBox
          title="Remarks"
          text={safe(PODetails?.remarks, "No remarks")}
        />
        <RichBox
          title="Terms & Conditions"
          text={safe(PODetails?.terms, "—")}
        />
        <RichBox title="Notes" text={safe(PODetails?.notes, "—")} />
      </div>
      <Separator />
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <KV label="Prepared By" value={safe(PODetails?.preparedBy)} />
        <KV label="Verified By" value={safe(PODetails?.verifiedBy)} />
        <KV label="Approved By" value={safe(PODetails?.approvedBy)} />
        <KV label="Accepted By" value={safe(PODetails?.acceptedBy)} />
        <KV label="PO No." value={safe(PODetails?.poNo)} />
        <KV label="PO Received Id" value={safe(PODetails?.poReceivedId)} />
      </div>
    </div>
  );
};

export default PoVendorView;

/* ----------------------------- minis ----------------------------- */

function Stat({
  label,
  value,
  icon,
  accent = "slate",
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  accent?: "emerald" | "sky" | "violet" | "amber" | "rose" | "slate" | "indigo";
}) {
  const map = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    sky: "border-sky-200 bg-sky-50 text-sky-800",
    violet: "border-violet-200 bg-violet-50 text-violet-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    rose: "border-rose-200 bg-rose-50 text-rose-800",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-800",
    slate: "border-slate-200 bg-slate-50 text-slate-800",
  } as const;
  return (
    <div className={`rounded-lg border p-3 ${map[accent]}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-medium opacity-90">{label}</div>
        {icon ? <span className="opacity-80">{icon}</span> : null}
      </div>
      <div className="mt-1 text-base font-semibold truncate">{value}</div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h5 className="text-sm font-semibold text-gray-900">{title}</h5>
      </div>
      <div className="grid grid-cols-1 gap-2">{children}</div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border p-2 bg-white">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-sm font-medium break-words">{value}</div>
    </div>
  );
}

function RichBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border bg-white p-4 md:p-5">
      <div className="text-sm font-semibold text-gray-900">{title}</div>
      <div className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
}
