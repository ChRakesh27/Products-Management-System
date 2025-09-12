import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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
import ToastMSG from "../ui/Toaster";

import {
  addCompanyAudit,
  getCompanyById,
  updateCompany,
  uploadCompanyLogo,
} from "../../Api/firebaseCompany";
import convertFileToBase64 from "../../Constants/convertFileToBase64";
import DateFormate from "../../Constants/DateFormate";
import { FetchCompanyDetails } from "../../Constants/FetchCompanyDetails";
import GSTCodeState from "../../Constants/GSTCodeState";
import { useLoading } from "../../context/LoadingContext";
import type { Company, GSTFetchedPayload } from "../../Model/CompanyModel";
import { updateCompanyDetails } from "../../store/UserSlice";

// --- helpers -------------------------------------------------
const COMPANY_TYPES = [
  "Retail",
  "Manufacturer",
  "Restaurant",
  "Distributor",
  "Industry",
  "Education",
  "Information Technology",
  "Others",
];

const isValidGSTIN = (gst?: string) =>
  !!gst &&
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(gst);

type RootState = any;

// --- component ----------------------------------------------
export default function CompanyProfile() {
  const { setLoading } = useLoading();
  const dispatch = useDispatch();
  const userDetails = useSelector((s: RootState) => s.users);

  const companyId: string =
    userDetails?.asCompanies?.[userDetails?.selectedCompanyIndex]?.companyId ??
    "";

  const gstVerifiedRef = useRef<string | null>(null);

  const [formData, setFormData] = useState<
    Company & { photoFile?: File | null }
  >({
    name: "",
    phone: "",
    email: "",
    website: "",
    panNumber: "",
    companyLogo: "",
    gst: "",
    address: "",
    city: "",
    pinCode: "",
    dateFormat: "DD/MM/YYYY",
    nature: "",
    state: "",
    stateCode: "",
    photoFile: null,
  });

  // preview dialog state
  const [compareOpen, setCompareOpen] = useState(false);
  const [fetchedData, setFetchedData] = useState<GSTFetchedPayload | null>(
    null
  );

  // fetch company
  useEffect(() => {
    (async () => {
      if (!companyId) return;
      setLoading(true);
      try {
        const company = await getCompanyById();
        if (company) setFormData((prev) => ({ ...prev, ...company }));
      } catch (e) {
        ToastMSG("error", "Failed to load company");
      } finally {
        setLoading(false);
      }
    })();
  }, [companyId]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    if (name === "name") value = value.toUpperCase();
    if (name === "phone") value = value.replace(/\D/g, "").slice(0, 10);
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const onSelectState = (code: string) => {
    const data = GSTCodeState.find((s: any) => s.code === code);
    if (!data) return;
    setFormData((p) => ({ ...p, stateCode: data.code, state: data.state }));
  };

  const onSelectCompanyType = (val: string) => {
    setFormData((p) => ({ ...p, nature: val }));
  };

  const uploadIfNeeded = async (): Promise<string | undefined> => {
    if (!formData.photoFile) return formData.companyLogo;
    try {
      return await uploadCompanyLogo(formData.photoFile);
    } catch {
      ToastMSG("error", "Logo upload failed");
      return formData.companyLogo;
    }
  };

  const handleSave = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const logoURL = await uploadIfNeeded();

      // only treat GST as verified if user fetched and hasn't changed it
      const gstVerified =
        !!formData.gst &&
        gstVerifiedRef.current === formData.gst &&
        isValidGSTIN(formData.gst);

      const payload: Partial<Company> = {
        ...formData,
        companyLogo: logoURL,
        gst: gstVerified ? formData.gst : formData.gst, // keep what user typed; you can blank it if you prefer
      };
      delete (payload as any).photoFile;

      await updateCompany(payload);
      await addCompanyAudit({
        section: "settings",
        action: "Update",
        description: "Company details updated",
      });

      dispatch(updateCompanyDetails(payload));
      ToastMSG("success", "Details saved successfully!");
    } catch (e) {
      ToastMSG("error", "Failed to save details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchGSTNo = async () => {
    if (!formData.gst) {
      ToastMSG("warn", "Enter GSTIN to fetch.");
      return;
    }
    if (!isValidGSTIN(formData.gst)) {
      ToastMSG("error", "Invalid GSTIN format.");
      return;
    }
    setLoading(true);
    try {
      const payload = (await FetchCompanyDetails(
        formData.gst
      )) as GSTFetchedPayload | null;
      if (payload) {
        setFetchedData(payload);
        gstVerifiedRef.current = formData.gst;
        setCompareOpen(true);
      } else {
        ToastMSG("warn", "No details found for GSTIN.");
      }
    } catch (e) {
      ToastMSG("error", "Failed to fetch GST details.");
    } finally {
      setLoading(false);
    }
  };

  const applyFetched = () => {
    if (!fetchedData) return;
    setFormData((prev) => ({
      ...prev,
      ...fetchedData,
    }));
    setCompareOpen(false);
  };

  const createdAtText = useMemo(
    () => (formData?.createdAt ? DateFormate(formData.createdAt) : "-"),
    [formData?.createdAt]
  );

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Company Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: form */}
        <Card className="lg:col-span-2 py-6">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Logo */}
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-full bg-muted grid place-items-center overflow-hidden">
                  {formData.companyLogo ? (
                    <img
                      src={formData.companyLogo}
                      alt="logo"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-lg font-semibold">
                      {formData?.name?.[0] ?? "-"}
                    </span>
                  )}
                </div>
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const base64 = await convertFileToBase64(f);
                        setFormData((p) => ({
                          ...p,
                          companyLogo: base64 as string,
                          photoFile: f,
                        }));
                      }
                    }}
                    className="max-w-xs"
                  />
                </div>
              </div>
            </div>

            {/* Basic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Company Name *</Label>
                <Input
                  name="name"
                  value={formData.name || ""}
                  onChange={onChange}
                  placeholder="YOUR BUSINESS NAME"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Company Type</Label>
                <Select
                  value={formData.nature ?? ""}
                  onValueChange={onSelectCompanyType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>GST Number</Label>
                  {formData.gst && !isValidGSTIN(formData.gst) && (
                    <span className="text-xs text-red-600">Invalid GSTIN</span>
                  )}
                </div>
                <Input
                  name="gst"
                  value={formData.gst || ""}
                  onChange={onChange}
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  name="phone"
                  value={formData.phone || ""}
                  onChange={onChange}
                  placeholder="10-digit number"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={onChange}
                  placeholder="email@company.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Website</Label>
                <Input
                  type="url"
                  name="website"
                  value={formData.website || ""}
                  onChange={onChange}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label>PAN</Label>
                <Input
                  name="panNumber"
                  value={formData.panNumber || ""}
                  onChange={onChange}
                  placeholder="ABCDE1234F"
                />
              </div>
            </div>

            <Separator />

            {/* Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Address</Label>
                <Input
                  name="address"
                  value={formData.address || ""}
                  onChange={onChange}
                  placeholder="Street, locality"
                />
              </div>

              <div className="space-y-1.5">
                <Label>State</Label>
                <Select
                  value={formData.stateCode ?? ""}
                  onValueChange={onSelectState}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {GSTCodeState.map((s: any) => (
                      <SelectItem key={s.code} value={s.code}>
                        {s.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>City</Label>
                <Input
                  name="city"
                  value={formData.city || ""}
                  onChange={onChange}
                  placeholder="City"
                />
              </div>

              <div className="space-y-1.5">
                <Label>PIN Code</Label>
                <Input
                  name="pinCode"
                  value={formData.pinCode || ""}
                  onChange={onChange}
                  placeholder="PIN"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave}>Save & Update</Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: summary */}
        <Card className="py-6">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="size-24 rounded-full bg-muted grid place-items-center overflow-hidden">
                {formData.companyLogo ? (
                  <img
                    src={formData.companyLogo}
                    alt="logo"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-2xl font-semibold">
                    {formData?.name?.[0] ?? "-"}
                  </span>
                )}
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {formData?.name || "-"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Joined {createdAtText}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Info label="Type" value={formData?.nature} />
              <Info label="GST No." value={formData?.gst} />
              <Info label="Email" value={formData?.email} />
              <Info label="Phone" value={formData?.phone} />
              <Info label="Address" value={formData?.address} />
              <Info label="City" value={formData?.city} />
              <Info label="State" value={formData?.state} />
              <Info label="State Code" value={formData?.stateCode} />
              <Info label="PIN Code" value={formData?.pinCode} />
              <Info
                label="Website"
                value={
                  formData?.website ? (
                    <a
                      className="text-blue-600 underline"
                      href={formData.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {formData.website}
                    </a>
                  ) : (
                    "-"
                  )
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GST Compare Dialog */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compare Company Details</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm font-medium text-muted-foreground mb-2">
            <div>Field</div>
            <div className="text-center">Current</div>
            <div className="text-center">Fetched</div>
          </div>
          <div className="max-h-80 overflow-y-auto space-y-1">
            {[
              ["name", "Company Name"],
              ["gst", "GSTIN/Tax Id"],
              ["nature", "Company Type"],
              ["phone", "Phone"],
              ["email", "Email"],
              ["website", "Website"],
              ["address", "Address"],
              ["city", "City"],
              ["state", "State"],
              ["stateCode", "State Code"],
              ["pinCode", "PIN Code"],
              ["status", "Status"],
            ].map(([key, label]) => {
              const curr = (formData as any)?.[key];
              const next = (fetchedData as any)?.[key];
              const changed = curr !== next;
              return (
                <div
                  key={key}
                  className={`grid grid-cols-3 gap-2 items-center rounded-md px-2 py-1 ${
                    changed ? "bg-amber-50" : ""
                  }`}
                >
                  <div className="text-muted-foreground">{label}</div>
                  <div className="text-center break-all">{curr ?? "-"}</div>
                  <div
                    className={`text-center break-all ${
                      changed ? "text-blue-600 font-semibold" : ""
                    }`}
                  >
                    {next ?? "-"}
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCompareOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyFetched}>Apply Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: any }) {
  return (
    <div>
      <div className="uppercase text-[10px] text-muted-foreground">{label}</div>
      <div className="text-foreground">{value || "-"}</div>
    </div>
  );
}
