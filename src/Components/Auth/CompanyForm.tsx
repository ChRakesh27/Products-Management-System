import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import SunyaLogo from "../../assets/SunyaLogo.png";
import convertFileToBase64 from "../../Constants/convertFileToBase64";
import {
  FetchCompanyDetails,
  isValidGSTIN,
} from "../../Constants/FetchCompanyDetails";
import GSTCodeState from "../../Constants/GSTCodeState";
import { useLoading } from "../../context/LoadingContext";
import { db, storage } from "../../firebase";
import { setCompanyData, updateUserDetails } from "../../store/UserSlice";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ToastMSG from "../ui/Toaster";
const steps = ["User Info", "Setup Method", "Company Info"];

const CompanyForm = ({ userRef }) => {
  const { setLoading } = useLoading();
  const [formData, setFormData] = useState({
    // fetchMode: "manual",
    businessNature: "Others",
    fullName: "",
    userEmail: "",
    companyName: "",
    email: "",
    panNumber: "",
    address: "",
    city: "",
    stateCode: "",
    state: "",
    pinCode: "",
    gstNumber: "",
    companyLogo: null,
    photoURL: null,
    phone: "",
  });

  const businessOptions = [
    "Retail",
    "Manufacturer",
    "Restaurant",
    "Distributor",
    "Industry",
    "Education",
    "Information Technology",
    "Others",
  ];

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const companyGSTNo = useRef(null);
  const [step, setStep] = useState(0);

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === "companyLogo" || name === "photoURL") {
      const base64 = await convertFileToBase64(files[0]);
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
        [name + "_base64"]: base64,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const uploadProfileImage = async (file) => {
    if (!file?.name) {
      return "";
    }
    try {
      const storageRef = ref(storage, `profileImages/${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  async function onSubmit() {
    setLoading(true);
    try {
      if (!formData.companyName) {
        formData.companyName = "Your Company";
      }
      const isVerified = companyGSTNo.current == formData.gstNumber;
      const companyPayload = {
        name: formData.companyName.toUpperCase(),
        address: formData.address,
        city: formData.city,
        pinCode: formData.pinCode,
        state: formData.state,
        stateCode: formData.stateCode,
        gst: isVerified ? formData.gstNumber : "",
        nature: formData.businessNature,
        companyLogo: await uploadProfileImage(formData.companyLogo),
        phone: formData.phone,
        status: "Active",
        createdAt: Timestamp.fromDate(new Date()),
        ownersRef: [userRef.id],
        createdBy: userRef.id,
      };

      const companyRef = await addDoc(
        collection(db, "companies"),
        companyPayload
      );
      const userPayload = {
        displayName: formData.fullName,
        email: formData.userEmail,
        photoURL: await uploadProfileImage(formData.photoURL),
        isCompanyProfileDone: true,
      };
      await updateDoc(userRef, userPayload);
      await createDailyUpdateData(companyRef.id);
      await setDoc(doc(db, "companies", companyRef.id, "settings", "weekOff"), {
        nonWorkingDays: [],
        weekOff: [
          {
            createdAt: Timestamp.now(),
            endDate: "",
            isCalendarMonth: true,
            startDate: Timestamp.now(),
          },
        ],
      });
      await setDoc(doc(db, "companies", companyRef.id, "settings", "prefix"), {
        creditNote: "CN",
        debitNote: "DN",
        deliveryChallan: "DC",
        invoice: "INV",
        po: "PO",
        pos: "POS",
        proformaInvoice: "PRF",
        purchase: "PUR",
        quotation: "QTN",
        service: "SRE",
      });
      await setDoc(doc(db, "companies", companyRef.id, "settings", "gst"), {
        createdAt: Timestamp.now(),
        gstEnabled: true,
        gstType: "IGST",
        selectedGst: 0,
      });
      dispatch(
        setCompanyData({
          companyId: companyRef.id,
          name: companyPayload.name,
          status: companyPayload.status,
          gst: companyPayload.gst,
          createdAt: JSON.stringify(companyPayload.createdAt),
        })
      );
      dispatch(
        updateUserDetails({
          name: formData.fullName,
          email: formData.userEmail,
        })
      );
      ToastMSG("success", "Successfully created Company.");
      navigate("/");
    } catch (error) {
      ToastMSG("error", "Failed to create Company.");
      console.log("🚀 ~ Submit ~ error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createDailyUpdateData(companyId) {
    try {
      const planCollection = collection(db, "plans");
      const q = query(planCollection, where("name", "==", "Free"), limit(1));
      const planSnapshot = await getDocs(q);
      const planDoc = planSnapshot.docs[0];
      const planData = planDoc.data();
      const payload = {
        userId: userRef.id,
        companyId,
        planEndDate: "",
        planName: planData.name,
        planId: planDoc.id,
        features: {
          sendInvoicesViaWhatsapp: {
            startDate: Timestamp.now(),
            endDate: "",
            count: 0,
            period: 0,
          },
          sendReportsViaWhatsapp: {
            startDate: Timestamp.now(),
            endDate: "",
            count: 0,
            period: 0,
          },
          automatedWhatsappAlerts: {
            startDate: Timestamp.now(),
            endDate: "",
            count: 0,
            period: 0,
          },
          productCategory: {
            startDate: Timestamp.now(),
            endDate: "",
            count: 0,
            period: 0,
          },
          createProjects: {
            startDate: Timestamp.now(),
            endDate: "",
            count: 0,
            period: 0,
          },
          projectCategory: {
            startDate: Timestamp.now(),
            endDate: "",
            count: 0,
            period: 0,
          },
          milestones: {
            startDate: Timestamp.now(),
            endDate: "",
            count: 0,
            period: 0,
          },
          tasks: {
            startDate: Timestamp.now(),
            endDate: "",
            count: 0,
            period: 0,
          },
          files: {
            startDate: Timestamp.now(),
            endDate: "",
            count: 0,
            period: 0,
          },
          paymentsProject: {
            startDate: Timestamp.now(),
            endDate: "",
            count: 0,
            period: 0,
          },
          items: {
            startDate: Timestamp.now(),
            endDate: "",
            count: 0,
            period: 0,
          },
          creditNote: 0,
          customer: 0,
          debitNote: 0,
          deliveryChallan: 0,
          invoice: 0,
          po: 0,
          pos: 0,
          product: 0,
          proformaInvoice: 0,
          // project: 0,
          purchase: 0,
          quotation: 0,
          staff: 0,
          subscription: 0,
          vendor: 0,
        },
      };
      const FEATURE_KEYS = [
        "sendInvoicesViaWhatsapp",
        "sendReportsViaWhatsapp",
        "automatedWhatsappAlerts",
        "productCategory",
        "createProjects",
        "projectCategory",
        "milestones",
        "tasks",
        "files",
        "paymentsProject",
        "items",
      ];
      FEATURE_KEYS.forEach((key) => {
        if (planData[key]?.enabled) {
          const planCount = planData[key]?.count || 0;
          let period = planData[key]?.period || 0;
          if (period == "custom") {
            period = planData[key]?.customDays || 0;
          }
          const oldEndDate = Timestamp.now().toDate();
          const newEndDate = new Date(oldEndDate);
          newEndDate.setDate(newEndDate.getDate() + (period + 1));
          payload.features[key] = {
            startDate: Timestamp.now(),
            endDate:
              planCount == "unlimited" ? "" : Timestamp.fromDate(newEndDate),
            count: 0,
            period,
          };
        }
      });
      await addDoc(collection(db, "dataCount"), payload);
      // dispatch();
    } catch (error) {
      console.log("🚀 ~ createDailyUpdateData ~ error:", error);
    }
  }

  async function fetchGSTNo() {
    if (!formData.gstNumber) {
      ToastMSG("warn", `Enter GST Number`);
    }
    try {
      const payload = await FetchCompanyDetails(formData.gstNumber);
      if (payload) {
        setFormData((pre) => ({
          ...pre,
          ...payload,
          stateCode: payload.stateCode
            ? payload.stateCode.toString()
            : pre.stateCode,
        }));
        companyGSTNo.current = formData.gstNumber;
      }
    } catch (error) {
      console.log("🚀 ~ fatchGSTNo ~ error:", error);
    }
  }

  const selectBusinessNature = (option) => {
    setFormData((prev) => ({ ...prev, businessNature: option }));
  };

  const nextStep = () => {
    if (!formData.stateCode && step == 1) {
      ToastMSG("error", "Please fill proper Details");
      return;
    }
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 w-full">
      <div className="text-center -mt-20 py-5">
        <img
          src={SunyaLogo}
          width={300}
          alt="logo"
          height={200}
          className="mix-blend-multiply"
        />
      </div>
      <div className="w-full max-w-lg mx-auto p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Step {step + 1} of {steps.length}
          </h2>
          <p className="text-sm text-gray-500">{steps[step]}</p>
        </div>
        <div className="space-y-6">
          {step === 0 && (
            <>
              <div>
                <Label htmlFor="userProfileImg">Upload Profile Image</Label>
                <Input
                  type="file"
                  id="userProfileImg"
                  name="photoURL"
                  accept="image/*"
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Full Name</Label>
                <Input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  name="userEmail"
                  value={formData.userEmail}
                  onChange={handleChange}
                  placeholder="e.g. john@example.com"
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2 mt-4">
                <div>
                  <Label htmlFor="userProfileImg">Upload Company Logo</Label>
                  <Input
                    type="file"
                    id="userProfileImg"
                    name="photoURL"
                    accept="image/*"
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label>Company Name</Label>
                  <Input
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label>
                    GST Number
                    <span className="text-xs text-red-600 ps-5">
                      {formData.gstNumber &&
                        !isValidGSTIN(formData.gstNumber) &&
                        "Field validation error for GSTIN"}
                    </span>
                  </Label>
                  <div className="flex items-center space-x-3 mt-1">
                    <Input
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      className="input-tag w-full "
                    />
                    <Button onClick={fetchGSTNo} className="btn-add">
                      Fetch
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Company Phone</Label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label>Pan Number</Label>
                    <Input
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                  <div className=" space-y-2">
                    <Label className="text-sm space-y-1 text-gray-600">
                      State <span className="text-red-500">*</span>
                    </Label>
                    <div>
                      <Select
                        value={formData.stateCode}
                        onValueChange={(value) => {
                          const data = GSTCodeState.find(
                            (s) => s.code.toString() == value
                          );
                          setFormData({
                            ...formData,
                            stateCode: data.code.toString(),
                            state: data.state,
                          });
                        }}
                        required
                      >
                        <SelectTrigger className="input-tag">
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          {GSTCodeState.map((option) => (
                            <SelectItem
                              key={option.code}
                              value={option.code.toString()}
                            >
                              {option.state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label>Pin Code</Label>
                    <Input
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              {/* )} */}
            </>
          )}

          {step === 2 && (
            <div>
              <Label>Select Business Nature</Label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {businessOptions.map((option) => (
                  <Button
                    key={option}
                    onClick={() => selectBusinessNature(option)}
                    className={`w-full py-3 px-4 border rounded-md text-sm font-medium transition-all ${
                      formData.businessNature === option
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-blue-50 border-gray-200"
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              onClick={prevStep}
              disabled={step === 0}
              className="btn-outline-blue"
            >
              Back
            </Button>
            <div className="flex gap-2">
              {step < steps.length - 1 && step != 1 && (
                <Button onClick={nextStep} className="btn-outline-blue">
                  Skip
                </Button>
              )}
              {step < steps.length - 1 ? (
                <Button onClick={nextStep} className="btn-add">
                  Next
                </Button>
              ) : (
                <Button className="btn-add" onClick={onSubmit}>
                  Finish
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyForm;
