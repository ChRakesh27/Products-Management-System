import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productsAPI } from "../../Api/firebaseProducts";
import currency from "../../Constants/Currency";
import { cn } from "../../lib/utils";
import type {
  ProductModel,
  ProductPoReceivedModel,
} from "../../Model/ProductModel";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { Label } from "@radix-ui/react-label";
import {
  ArrowLeft,
  Box,
  Coins,
  FileText,
  Package,
  Palette,
  Percent,
  Tag,
  Truck,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ToastMSG from "../ui/Toaster";

const safeCurrency = (n?: number) =>
  currency(Number.isFinite(n as number) ? (n as number) : 0);

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
    <div className={cn("rounded-lg border p-3", map[accent])}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-medium opacity-90">{label}</div>
        {icon ? <span className="opacity-80">{icon}</span> : null}
      </div>
      <div className="mt-1 text-base font-semibold">{value}</div>
    </div>
  );
}

function KeyValue({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-md border p-3 bg-white", className)}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  bandClass,
  children,
}: {
  title: string;
  subtitle?: string;
  bandClass: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden space-y-3">
      <div className={cn("border-b px-1 pb-2", bandClass)}>
        <div className="flex items-baseline justify-between">
          <CardTitle className="font-serif text-lg">{title}</CardTitle>
        </div>
        {subtitle ? (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      <div>{children}</div>
    </div>
  );
}

/* ----------------------------- component ----------------------------- */
export default function ProductView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductModel | null>(null);
  const [received, setReceived] = useState<ProductPoReceivedModel[]>([]);

  useEffect(() => {
    if (!id) return;
    productsAPI.get(id).then(setProduct);
    productsAPI.getLogs(id).then(setReceived);
  }, [id]);

  const rmCount = product?.rawMaterials?.length ?? 0;

  const totals = useMemo(() => {
    const raw = product?.totalRawAmount ?? 0;
    const transport = Number(product?.transport ?? 0);
    const misc = Number(product?.miscellaneous ?? 0);
    const wastagePct = Number(product?.wastage ?? 0);
    const marginPct = Number(product?.margin ?? 0);

    const wastageVal = raw * (wastagePct / 100);
    const baseCost = raw + transport + misc + wastageVal;
    const marginVal = baseCost * (marginPct / 100);
    const suggested = baseCost + marginVal;

    return {
      raw,
      transport,
      misc,
      wastagePct,
      marginPct,
      wastageVal,
      baseCost,
      marginVal,
      suggested,
    };
  }, [product]);

  async function onStatusChanged(val: string) {
    if (!id) return;
    try {
      await productsAPI.updateStatus(id, val);
      setProduct((pre) => (pre ? { ...pre, status: val } : pre));
      ToastMSG("success", "Successfully updated the status");
    } catch (error) {
      console.log("🚀 ~ onStatusChanged ~ error:", error);
      ToastMSG("error", "Failed to update the status");
    }
  }

  if (!product) {
    return (
      <div className="p-6">
        <Card className="p-8">
          <div className="h-4 w-40 rounded bg-slate-200" />
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

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            className="px-2 shrink-0"
            onClick={() => navigate("/products")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="font-serif text-2xl tracking-tight truncate">
              {product.name}{" "}
              <span className="text-base text-gray-500 px-5">
                {product.uid}
              </span>
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px]">
              <Badge variant="outline" className="border-slate-300">
                <Tag className="mr-1 h-3.5 w-3.5" /> {product.size || "-"}
              </Badge>
              <Badge variant="outline" className="border-slate-300">
                <Palette className="mr-1 h-3.5 w-3.5" /> {product.color || "-"}
              </Badge>
              <Badge variant="outline" className="border-slate-300">
                <Box className="mr-1 h-3.5 w-3.5" /> {product.unitType || "-"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Label>Status: </Label>
          <Select
            value={product.status || ""}
            onValueChange={onStatusChanged}
            disabled={received.length > 0}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {["On-Hold", "Approved", "Rejected"].map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* <Button
            variant="outline"
            className=" inline-flex"
            onClick={() => navigate(`/products/${id}/edit`)}
            disabled={received.length > 0}
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Edit
          </Button> */}
        </div>
      </div>

      {/* Description */}
      <div>
        <p className="text-sm leading-relaxed text-slate-700">
          {product.description || "No description provided."}
        </p>
      </div>

      {/* Summary strip */}
      <div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Stat
            label="Raw Total"
            value={safeCurrency(totals.raw)}
            icon={<Package className="h-4 w-4" />}
            accent="emerald"
          />
          <Stat
            label="Transport"
            value={safeCurrency(totals.transport)}
            icon={<Truck className="h-4 w-4" />}
            accent="sky"
          />
          <Stat
            label="Misc"
            value={safeCurrency(totals.misc)}
            icon={<Coins className="h-4 w-4" />}
            accent="violet"
          />
          <Stat
            label="Wastage (%)"
            value={`${totals.wastagePct ?? 0}%`}
            icon={<Percent className="h-4 w-4" />}
            accent="amber"
          />
          <Stat
            label="Base Cost"
            value={safeCurrency(totals.baseCost)}
            accent="indigo"
          />
          <Stat
            label="Suggested"
            value={safeCurrency(totals.suggested)}
            accent="rose"
          />
        </div>
      </div>

      {/* Materials */}
      <Section
        title="Materials"
        subtitle={`${rmCount} item${
          rmCount === 1 ? "" : "s"
        } used in this product.`}
        bandClass="bg-sky-50 border-sky-200"
      >
        {rmCount ? (
          <div className="rounded-xl border overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block">
              <ScrollArea className="max-h-[460px]">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent bg-sky-50">
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Qty Needed</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(product.rawMaterials ?? []).map((m, idx) => (
                      <TableRow
                        key={m.id || idx}
                        className="odd:bg-muted/40 hover:bg-sky-50/50 transition"
                      >
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{m.name || "-"}</TableCell>
                        <TableCell className="max-w-[28rem] truncate">
                          {m.description || "-"}
                        </TableCell>
                        <TableCell>{m.size || "-"}</TableCell>
                        <TableCell>{m.color || "-"}</TableCell>
                        <TableCell>{m.unitType || "-"}</TableCell>
                        <TableCell className="text-right">
                          {safeCurrency(Number(m.estimatedPrice))}
                        </TableCell>
                        <TableCell className="text-right">
                          {Number(m.quantity) ?? 0}
                        </TableCell>
                        <TableCell className="text-right">
                          {safeCurrency(Number(m.totalAmount))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            {/* Mobile list (Accordion) */}
            <div className="md:hidden p-2">
              <Accordion type="single" collapsible className="w-full">
                {(product.rawMaterials ?? []).map((m, idx) => (
                  <AccordionItem
                    key={m.id || idx}
                    value={(m.id || idx).toString()}
                    className="border rounded-lg mb-2"
                  >
                    <AccordionTrigger className="px-3 py-2">
                      <div className="w-full flex items-center justify-between text-left">
                        <div className="text-sm font-medium truncate">
                          {idx + 1}. {m.name || "Material"}
                        </div>
                        <div className="text-sm font-semibold">
                          {safeCurrency(Number(m.totalAmount))}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3">
                      <div className="grid grid-cols-2 gap-2">
                        <KeyValue
                          label="Description"
                          value={m.description || "—"}
                        />
                        <KeyValue label="Size" value={m.size || "—"} />
                        <KeyValue label="Color" value={m.color || "—"} />
                        <KeyValue label="Unit" value={m.unitType || "—"} />
                        <KeyValue
                          label="Unit Price"
                          value={safeCurrency(Number(m.estimatedPrice))}
                        />
                        <KeyValue label="Qty" value={Number(m.quantity) ?? 0} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="bg-blue-50 border rounded-md mt-2 flex items-center justify-between">
                <div className="px-3 py-3 font-medium">Raw Total</div>
                <div className="px-3 py-3 text-right text-lg font-bold text-blue-700">
                  {safeCurrency(totals.raw)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border p-6 text-sm text-muted-foreground bg-slate-50">
            No materials found.
          </div>
        )}
      </Section>

      {/* Purchase Orders */}
      <Section
        title="Purchase Orders"
        subtitle={`${received.length} record${
          received.length === 1 ? "" : "s"
        }.`}
        bandClass="bg-amber-50 border-amber-200"
      >
        {received.length ? (
          <div className="space-y-4">
            {received.map((row, i) => (
              <Fragment key={row.id || row.refId || i}>
                <div className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-amber-700" />
                      <div className="text-sm font-medium">PO Received</div>
                    </div>
                    <Button
                      variant="link"
                      className="px-0 text-amber-700"
                      onClick={() => navigate(`/po-received/${row.refId}`)}
                    >
                      {row.poNo || "Open PO"}
                    </Button>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <KeyValue
                      label="Estimated / Unit Price"
                      value={safeCurrency(
                        (row as any).estimatedPrice ??
                          (row as any).unitPrice ??
                          0
                      )}
                    />
                    <KeyValue label="Quantity" value={row.quantity ?? 0} />
                    <KeyValue
                      label="Total Price"
                      value={safeCurrency(row.total)}
                    />
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border p-6 text-sm text-muted-foreground bg-slate-50">
            No PO received yet.
          </div>
        )}
      </Section>
    </div>
  );
}
