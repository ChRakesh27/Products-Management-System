import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import {
  collection,
  doc,
  type DocumentData,
  DocumentReference,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import loginImg from "../../assets/loginImg.jpg";
import SunyaLogo from "../../assets/techLogo.jpg";
import updatedSingleDataCompanyDetails from "../../Constants/updatedCompanyDetails";
import { useLoading } from "../../context/LoadingContext";
import { auth, db } from "../../firebase";
import { setUserLogin } from "../../store/UserSlice";
import ToastMSG from "../ui/Toaster";
import CompanyForm from "./CompanyForm";

// Extend the Window interface to include recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

const Login = () => {
  const { setLoading } = useLoading();
  const [isOtpStage, setIsOtpStage] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [userDocRef, setUserDocRef] =
    useState<DocumentReference<DocumentData> | null>(null);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [isResendAllowed, setIsResendAllowed] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isCompanyProfileDone, setIsCompanyProfileDone] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (isOtpStage && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setIsResendAllowed(true);
    }
    return () => clearInterval(timer);
  }, [isOtpStage, countdown]);

  const closeModal = () => {
    setIsOtpStage(false);
    setPhoneNumber("");
    setOtp("");
  };

  const handlePhoneNumberChange = (event) => {
    const inputValue = event.target.value;
    const isValidPhoneNumber = /^\d{0,10}$/.test(inputValue);
    if (isValidPhoneNumber) {
      setPhoneNumber(inputValue);
    }
  };

  const configureRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            console.log("ReCAPTCHA verified:", response);
          },
          "expired-callback": () => {
            console.log("reCAPTCHA expired");
          },
        }
      );
    }
  };

  const handlePhoneNumberSubmit = async () => {
    setLoading(true);
    if (phoneNumber) {
      const userRef = collection(db, "users");
      const q = query(userRef, where("phone", "==", phoneNumber));
      const userData = await getDocs(q);
      if (userData.docs.length != 0) {
        setIsLogin(true);
      } else {
        setIsLogin(false);
      }
      configureRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      try {
        const authResult = await signInWithPhoneNumber(
          auth,
          `+91${phoneNumber}`, // Replace with your country code
          appVerifier
        );
        setConfirmationResult(authResult);
        setIsOtpStage(true);
        setCountdown(60);
        setIsResendAllowed(false);
      } catch (error) {
        console.error("Error during phone number sign-in:", error);
        ToastMSG(
          "error",
          `Failed to send OTP. Please check the number or try again.`
        );
      } finally {
        setLoading(false);
      }
    } else {
      ToastMSG("error", `Please enter a valid phone number.`);
    }
  };

  async function updateAllStaffDocs(userId, phoneNumber) {
    try {
      const staffRef = collection(db, "staff");
      const staffQ = query(staffRef, where("phone", "==", phoneNumber));
      const staffData = await getDocs(staffQ);
      await Promise.all(
        staffData.docs.map(async (docRef) => {
          const { companyRef } = docRef.data();
          await updateDoc(doc(db, "staff", docRef.id), { userId: userId });
          const field = {
            name: "staffRef",
            type: "array",
          };
          await updatedSingleDataCompanyDetails(companyRef.id, field, userId);
          return docRef.id;
        })
      );
    } catch (error) {
      console.log("🚀 ~ updateAllStaffDocs ~ error:", error);
    }
  }
  const handleOtpSubmit = async () => {
    if (otp && confirmationResult) {
      try {
        setLoading(true);
        const authResult = await confirmationResult.confirm(otp);
        const authUser = authResult.user;
        const token = await authUser.getIdToken();
        const docRef = doc(db, "users", authUser.uid);
        setUserDocRef(docRef);
        type UserType = {
          uid: string;
          displayName: string;
          email: string;
          phone: string;
          phone_number: string;
          photoURL: string;
          createdAt: Timestamp;
          isCompanyProfileDone: boolean;
          plan: string;
          [key: string]: unknown;
        };
        let user: UserType | undefined = undefined;
        let companiesData = [];
        let isCompanyProfileDone = false;
        const companiesRef = collection(db, "companies");
        if (!isLogin) {
          user = {
            uid: authUser.uid,
            displayName: "",
            email: "",
            phone: phoneNumber,
            phone_number: "+91" + phoneNumber,
            photoURL: "",
            createdAt: Timestamp.fromDate(new Date()),
            isCompanyProfileDone: isCompanyProfileDone,
            plan: "Free",
          };
          await setDoc(docRef, user);
          await updateAllStaffDocs(authUser.uid, phoneNumber);
          setIsCompanyProfileDone(false);
        } else {
          const userDoc = await getDoc(docRef);
          user = userDoc.data() as UserType | undefined;
          if (!user?.isCompanyProfileDone) {
            setIsCompanyProfileDone(false);
            return;
          }
          isCompanyProfileDone = true;

          const q = query(
            companiesRef,
            where("ownersRef", "array-contains", authUser.uid)
          );
          const company = await getDocs(q);
          companiesData = company.docs.map((doc) => {
            const { ownersRef, staffRef, ...rest } = doc.data();
            return {
              companyId: doc.id,
              ...rest,
              createdAt: JSON.stringify(rest.createdAt),
            };
          });
        }

        const payload = {
          userId: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          phone: user.phone || "",
          isLogin: true,
          asCompanies: companiesData,
          asCustomer: [],
          asVendor: [],
          asStaff: [],
          token,
          selectedDashboard: "",
          isCompanyProfileDone: isCompanyProfileDone,
          selectedCompanyIndex: 0,
          asStaffSelectedCompanyIndex: 0,
        };
        dispatch(setUserLogin(payload));
        ToastMSG("success", "Successfully logged in.");
        closeModal();
        navigate("/");
      } catch {
        ToastMSG("error", "Invalid OTP. Please try again.");
        setOtp("");
      } finally {
        setLoading(false);
      }
    } else {
      ToastMSG("warn", "Please enter the OTP.");
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    if (isResendAllowed) {
      configureRecaptcha();
      try {
        const authResult = await signInWithPhoneNumber(
          auth,
          `+91${phoneNumber}`,
          window.recaptchaVerifier
        );
        setConfirmationResult(authResult);
        setCountdown(60);
        setIsResendAllowed(false);
      } catch {
        ToastMSG("error", "Failed to resend OTP.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="h-screen">
      {/* <nav className="text-white py-3 w-full ">
        <div className="  flex justify-between  items-center px-4">
          <div className="text-2xl font-bold text-blue-600">Sunya</div>
        </div>
      </nav> */}
      <div className="bg-gray-100 flex justify-center items-center h-screen ">
        {!isCompanyProfileDone ? (
          <CompanyForm userRef={userDocRef} />
        ) : (
          <div className=" bg-white flex  justify-center items-center h-screen w-full">
            <div
              className="flex flex-col justify-center bg-white px-14 rounded-2xl"
              style={{ width: "93%", height: "80%" }}
            >
              <div className="relative  rounded-xl ">
                <div className="flex flex-col xl:flex-row items-center w-full gap-y-12">
                  <div className="basis-full xl:basis-1/2 flex justify-center ps-10 w-full ">
                    <div className="w-full  xl:w-[480px]  relative z-20">
                      <div className="max-w-lg w-full h-auto ">
                        <div className="py-5 w-full  rounded-lg  p-3">
                          {/* <div className="text-center mb-3 text-3xl font-bold py-3 text-[hsl(250,92%,70%)]">
                            Sunya
                          </div> */}
                          <div className=" pt-5">
                            <img
                              src={SunyaLogo}
                              width={300}
                              alt="logo"
                              height={200}
                              className="mix-blend-multiply"
                            />
                          </div>
                          <div className=" text-2xl  my-6">
                            Welcome to Sunya Tech Management App
                          </div>

                          <div>
                            <div className="h-80 overflow-y-auto pt-14">
                              <div>
                                <div className="w-full">
                                  <h2 className="text-1xl text-grey-500 mb-2">
                                    Phone
                                  </h2>
                                  <div className="flex items-center mb-4">
                                    <span className="px-3 py-3 border border-r-0 rounded-l-md text-gray-700">
                                      +91
                                    </span>
                                    <input
                                      type="text"
                                      maxLength={10}
                                      placeholder="Enter your Phone number"
                                      value={phoneNumber}
                                      onChange={handlePhoneNumberChange}
                                      className={
                                        "px-4 py-3 border w-full focus:outline-none " +
                                        (isOtpStage ? " " : " rounded-r-md")
                                      }
                                      required
                                    />
                                    {isOtpStage && (
                                      <button
                                        type="button"
                                        className="btn-outline-blue border-l-0 py-3.5 rounded-l-none"
                                        onClick={() => setIsOtpStage(false)}
                                      >
                                        Edit
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {isOtpStage && (
                                <div>
                                  <h2 className="text-xl text-grey-500 mb-2">
                                    Enter OTP
                                  </h2>
                                  <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="px-4 py-3 border rounded-md w-full mb-4"
                                  />
                                </div>
                              )}
                            </div>
                            {isOtpStage ? (
                              <>
                                <button
                                  className={
                                    "btn-add text-base py-3 w-full mb-10  "
                                  }
                                  onClick={handleOtpSubmit}
                                >
                                  Verify OTP
                                </button>

                                <div className="text-sm text-gray-500 mt-3">
                                  {countdown > 0
                                    ? `You can request another OTP in ${countdown} seconds`
                                    : ""}
                                </div>
                                {countdown === 0 && (
                                  <button
                                    className="mt-2 text-blue-500 underline"
                                    onClick={handleResendOtp}
                                  >
                                    Resend OTP
                                  </button>
                                )}
                              </>
                            ) : (
                              <button
                                className={
                                  "btn-add text-base py-3 w-full mb-10  "
                                }
                                onClick={handlePhoneNumberSubmit}
                              >
                                Submit
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="basis-full xl:basis-1/2 hidden xl:block relative w-[500px] ">
                    <svg
                      className="absolute top-0 -right-0 "
                      width="1008"
                      height="580"
                      viewBox="0 0 1208 1080"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g filter="url(#filter0_f_4801_13605)">
                        <circle
                          cx="604"
                          cy="565"
                          r="404"
                          fill="url(#paint0_radial_4801_13605)"
                        />
                      </g>
                      <defs>
                        <filter
                          id="filter0_f_4801_13605"
                          x="0"
                          y="-39"
                          width="1208"
                          height="1208"
                          filterUnits="userSpaceOnUse"
                          colorInterpolationFilters="sRGB"
                        >
                          <feFlood
                            floodOpacity="0"
                            result="BackgroundImageFix"
                          />
                          <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="BackgroundImageFix"
                            result="shape"
                          />
                          <feGaussianBlur
                            stdDeviation="100"
                            result="effect1_foregroundBlur_4801_13605"
                          />
                        </filter>
                        <radialGradient
                          id="paint0_radial_4801_13605"
                          cx="0"
                          cy="0"
                          r="1"
                          gradientUnits="userSpaceOnUse"
                          gradientTransform="translate(805.322 373.168) rotate(134.675) scale(1098.13)"
                        >
                          <stop stopColor="#826AF9" stopOpacity="0.6" />
                          <stop
                            offset="1"
                            stopColor="#826AF9"
                            stopOpacity="0"
                          />
                        </radialGradient>
                      </defs>
                    </svg>
                    <div className="bg-[hsl(250,92%,70%)] h-full w-full rounded-3xl rounded-tr-none   relative  overflow-hidden min-h-[500px]">
                      <svg
                        className="absolute -top-[25px] -right-6 hidden lg:block [&>*]:fill-background"
                        width="209"
                        height="162"
                        viewBox="0 0 209 162"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M62 25H0V0H209V162H185C184.317 129.162 169.576 122.271 158.235 120.921H121.512C100.402 119.676 90.7287 104.351 90.7287 93.7286V57.8571C89.4326 35.64 71.0009 26.7357 62 25Z"
                          fill="white"
                        />
                      </svg>
                      <img src={loginImg} width={"100%"} height={"100%"} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Login;
