import {
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updatePhoneNumber,
} from "firebase/auth";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import convertFileToBase64 from "../../Constants/convertFileToBase64";
import DateFormate from "../../Constants/DateFormate";
import { useLoading } from "../../context/LoadingContext";
import { auth } from "../../firebase";
import { updateUserDetails } from "../../store/UserSlice";
import ToastMSG from "../ui/Toaster";

import {
  addCompanyAudit,
  getUserById,
  isPhoneTaken,
  updateUserById,
  uploadUserPhoto,
} from "../../Api/firebaseUser";
import type { RootState, UserDoc } from "../../Model/UserModel";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

const E164 = (local10: string) => `+91${local10}`;

export default function UserProfile() {
  const dispatch = useDispatch();
  const { setLoading } = useLoading();

  const userState = useSelector((s: RootState) => s.users);
  const userId = userState.userId;
  const companyId =
    userState.asCompanies?.[userState.selectedCompanyIndex]?.companyId;

  const [form, setForm] = useState<UserDoc & { photoFile?: File | null }>({
    displayName: "",
    phone: "",
    photoURL: "",
    email: "",
    photoFile: null,
  });

  // phone verify state
  const [otpMode, setOtpMode] = useState(false);
  const [verificationId, setVerificationId] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(true); // true if unchanged vs store

  // hydrate
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getUserById(userId);
        if (data) {
          setForm((prev) => ({ ...prev, ...data }));
          setPhoneVerified(true); // existing phone is verified by definition
        }
      } catch {
        ToastMSG("error", "Failed to load user");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // derived
  const joinedText = useMemo(
    () => (form?.createdAt ? DateFormate(form.createdAt) : "-"),
    [form?.createdAt]
  );

  // handlers
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "phone") {
      v = value.replace(/\D/g, "").slice(0, 10);
      setPhoneVerified(v === userState.phone);
    }
    setForm((p) => ({ ...p, [name]: v }));
  };

  const ensureRecaptcha = () => {
    if (window.recaptchaVerifier) return window.recaptchaVerifier;
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {},
      }
    );
    return window.recaptchaVerifier;
  };

  const requestOtp = async () => {
    if (!form.phone || form.phone.length !== 10) {
      ToastMSG("warn", "Enter a valid 10-digit phone");
      return;
    }
    if (form.phone === userState.phone) {
      ToastMSG("warn", "This is your current phone number");
      return;
    }
    try {
      // unique check
      if (await isPhoneTaken(form.phone)) {
        ToastMSG("warn", "This phone number is already registered");
        return;
      }

      const appVerifier = ensureRecaptcha();
      const result = await signInWithPhoneNumber(
        auth,
        E164(form.phone),
        appVerifier
      );
      setVerificationId(result.verificationId);
      setOtpMode(true);
      ToastMSG("success", "OTP sent");
    } catch {
      ToastMSG("error", "Failed to send OTP");
    }
  };

  const submitOtp = async () => {
    if (!otp || otp.length !== 6 || !verificationId) {
      ToastMSG("warn", "Enter a valid 6-digit OTP");
      return;
    }
    try {
      const cred = PhoneAuthProvider.credential(verificationId, otp);
      await updatePhoneNumber(auth.currentUser!, cred);
      setOtpMode(false);
      setPhoneVerified(true);
      ToastMSG("success", "Phone number verified!");
    } catch {
      ToastMSG("error", "Invalid OTP. Please try again.");
      setOtp("");
    }
  };

  const handleSave = async () => {
    if (!phoneVerified) {
      ToastMSG("warn", "Please verify the new phone number");
      return;
    }
    setLoading(true);
    try {
      let photoURL = form.photoURL;
      if (form.photoFile) {
        photoURL = await uploadUserPhoto(form.photoFile);
      }

      const { photoFile, id, ...payload } = form;
      await updateUserById(userId, {
        ...payload,
        photoURL,
        phone_number: E164(payload.phone ?? ""),
      });

      if (companyId) {
        await addCompanyAudit(companyId, userId);
      }

      dispatch(
        updateUserDetails({
          name: payload.displayName,
          phone: payload.phone,
          email: payload.email,
          phone_number: E164(payload.phone ?? ""),
        })
      );
      ToastMSG("success", "Details saved successfully!");
    } catch (e) {
      ToastMSG("error", "Failed to save details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Profile Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Form */}
        <Card className="lg:col-span-2 py-6">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Photo */}
            <div className="space-y-2">
              <Label>User Image</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {form.photoURL ? (
                    <AvatarImage src={form.photoURL} alt="user" />
                  ) : (
                    <AvatarFallback>
                      {(form?.displayName?.[0] ?? "-").toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <Input
                  id="UFile"
                  type="file"
                  accept="image/*"
                  className="max-w-xs"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const base64 = (await convertFileToBase64(file)) as string;
                    setForm((p) => ({
                      ...p,
                      photoURL: base64,
                      photoFile: file,
                    }));
                  }}
                />
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  name="displayName"
                  value={form.displayName || ""}
                  onChange={onChange}
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={form.email || ""}
                  onChange={onChange}
                  placeholder="you@company.com"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label>Phone Number</Label>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <Input
                      name="phone"
                      value={form.phone || ""}
                      onChange={onChange}
                      placeholder="10-digit phone"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant={phoneVerified ? "secondary" : "default"}
                      disabled={phoneVerified}
                      onClick={requestOtp}
                    >
                      {phoneVerified ? "Verified" : "Verify"}
                    </Button>
                  </div>

                  {otpMode && (
                    <div className="flex gap-2">
                      <Input
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        placeholder="Enter OTP"
                        maxLength={6}
                      />
                      <Button onClick={submitOtp}>Submit</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="py-6">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24">
                {form.photoURL ? (
                  <AvatarImage src={form.photoURL} alt="user" />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {(form?.displayName?.[0] ?? "-").toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {form.displayName || "-"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Joined {joinedText}
                </div>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Info label="Email" value={form.email} />
              <Info label="Phone" value={form.phone} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invisible Recaptcha target */}
      <div id="recaptcha-container" />
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
