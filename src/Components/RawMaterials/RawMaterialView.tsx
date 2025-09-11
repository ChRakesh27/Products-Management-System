// components/materials/RawMaterialView.tsx
import { ArrowLeft, FileText, Palette, Ruler, Tag } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { rawMaterialsAPI } from "../../Api/firebaseRawMaterial";
import currency from "../../Constants/Currency";
import { cn } from "../../lib/utils";
import type {
  RawMaterialModel,
  RawMaterialPoGivenModel,
  RawMaterialPoReceivedModel,
  RawMaterialProductModel,
} from "../../Model/RawMaterial";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardTitle } from "../ui/card";

/* ----------------------------- helpers & UI bits ----------------------------- */
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
    <div className="overflow-hidden space-y-4">
      <div className={cn(" border-b", bandClass)}>
        <div className="flex items-baseline justify-between">
          <CardTitle className="font-serif text-lg">{title}</CardTitle>
        </div>
        {subtitle ? (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      <div className="">{children}</div>
    </div>
  );
}

/* --------------------------------- component -------------------------------- */
export default function RawMaterialView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [material, setMaterial] = useState<RawMaterialModel | null>(null);
  const [products, setProducts] = useState<RawMaterialProductModel[]>([]);
  const [received, setReceived] = useState<RawMaterialPoReceivedModel[]>([]);
  const [given, setGiven] = useState<RawMaterialPoGivenModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const mat = await rawMaterialsAPI.get(id);
        setMaterial(mat);
        const logs = await rawMaterialsAPI.getLogs(id);
        setProducts(logs.filter((l) => l.type === "Product") as any);
        setReceived(logs.filter((l) => l.type === "PoReceived") as any);
        setGiven(logs.filter((l) => l.type === "PoGiven") as any);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const totals = useMemo(() => {
    const qty = material?.quantity ?? 0;
    const used = material?.quantityUsed ?? 0;
    const waste = material?.quantityWastage ?? 0;
    const avail = Math.max(qty - used - waste, 0);
    const estUnit = material?.estimatedPrice ?? 0;
    const actUnit = material?.actualPrice ?? 0;

    return {
      qty,
      used,
      waste,
      avail,
      estUnit,
      actUnit,
      estValue: estUnit * avail,
      actValue: actUnit * avail,
      wastePct: qty > 0 ? (waste / qty) * 100 : 0,
      usedPct: qty > 0 ? (used / qty) * 100 : 0,
    };
  }, [material]);

  if (loading || !material) {
    return (
      <div className="p-6">
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

  return (
    <div className=" p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => navigate("/materials")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-serif text-2xl tracking-tight">
              {material.name}{" "}
              <span className="text-base text-gray-500 px-5">
                {material.uid}
              </span>
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px]">
              <Badge variant="outline" className="border-slate-300">
                <Ruler className="mr-1 h-3.5 w-3.5" />
                {material.size}
              </Badge>
              <Badge variant="outline" className="border-slate-300">
                <Palette className="mr-1 h-3.5 w-3.5" />
                {material.color || "-"}
              </Badge>
              <Badge variant="outline" className="border-slate-300">
                <Tag className="mr-1 h-3.5 w-3.5" />
                {material.unitType || "-"}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      {/* Description band */}
      {material.description ? (
        <div>
          <p className="text-sm leading-relaxed text-slate-700">
            {material.description}
          </p>
        </div>
      ) : null}

      {/* Linked Products */}
      <Section
        title="Linked Products"
        subtitle={`${products.length} record${
          products.length === 1 ? "" : "s"
        }.`}
        bandClass="bg-sky-50 border-sky-200"
      >
        {products.length ? (
          <div className="space-y-4">
            {products.map((row) => (
              <Fragment key={row.id || row.refId}>
                <div className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4 text-sky-700" />
                      Product
                    </div>
                    <Button
                      variant="link"
                      className="px-0 text-sky-700"
                      onClick={() => navigate(`/products/${row.refId}`)}
                    >
                      {row.name || "Open Product"}
                    </Button>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <KeyValue
                      label="Estimated Price"
                      value={safeCurrency(row.estimatedPrice)}
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
            No linked products.
          </div>
        )}
      </Section>
      {/* PO Received */}
      <Section
        title="PO Received"
        subtitle={`${received.length} record${
          received.length === 1 ? "" : "s"
        }.`}
        bandClass="bg-emerald-50 border-emerald-200"
      >
        {received.length ? (
          <div className="space-y-4">
            {received.map((row) => (
              <Fragment key={row.id || row.refId}>
                <div className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-700" />
                      PO Received
                    </div>
                    <Button
                      variant="link"
                      className="px-0 text-emerald-700"
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
            No PO received.
          </div>
        )}
      </Section>
      {/* PO Given */}
      <Section
        title="PO Given"
        subtitle={`${given.length} record${given.length === 1 ? "" : "s"}.`}
        bandClass="bg-amber-50 border-amber-200"
      >
        {given.length ? (
          <div className="space-y-4">
            {given.map((row) => (
              <Fragment key={row.id || row.refId}>
                <div className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-amber-700" />
                      PO Given
                    </div>
                    <Button
                      variant="link"
                      className="px-0 text-amber-700"
                      onClick={() => navigate(`/po-given/${row.refId}`)}
                    >
                      {row.poNo || "Open PO"}
                    </Button>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <KeyValue
                      label="Estimated Price"
                      value={safeCurrency(row.estimatedPrice)}
                    />
                    <KeyValue
                      label="Actual Price"
                      value={safeCurrency(Number(row.actualPrice ?? 0))}
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
            No PO given.
          </div>
        )}
      </Section>
    </div>
  );
}
