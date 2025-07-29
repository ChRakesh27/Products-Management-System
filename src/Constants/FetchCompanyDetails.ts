import axios from "axios";
import ToastMSG from "../Components/ui/Toaster";
import GSTCodeState from "./GSTCodeState";

export const isValidGSTIN = (gstin) => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gstin);
};

export async function FetchCompanyDetails(gstNumber) {
  if (!gstNumber) {
    ToastMSG("warn", `Enter GST Number`);
  }
  const isValid = isValidGSTIN(gstNumber);
  if (!isValid) {
    ToastMSG("warn", `Please Enter valid GST Number`);
  }
  try {
    const response = await axios.get(
      `http://sheet.gstincheck.co.in/check/${import.meta.env.VITE_FIREBASE_GST_API_KEY
      }/${gstNumber}`
    );
    const companyDetails = response.data.data;
    const stateData = GSTCodeState.find(
      (s) =>
        s.state.toLowerCase() ==
        (companyDetails.companyDetails?.pradr?.addr?.stcd || "").toLowerCase()
    );
    const payload = {
      companyName: companyDetails?.lgnm || "",
      state: stateData?.state || "",
      stateCode: stateData?.code || "",
      address: companyDetails?.pradr?.addr?.st || "",
      city: companyDetails?.pradr?.addr?.city || "",
      pinCode: companyDetails?.pradr?.addr?.pncd || "",
      gst: companyDetails?.gstin || "",
      fullAddress: companyDetails?.pradr?.adr || "",
    };
    return payload;
  } catch (error) {
    console.log("🚀 ~ fatchGSTNo ~ error:", error);
  }
}
