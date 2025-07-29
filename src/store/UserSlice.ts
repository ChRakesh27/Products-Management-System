// UserSlice.ts
import { createSlice, } from "@reduxjs/toolkit";

// Type definitions
interface Company {
  name?: string;
  userType?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  pinCode?: string;
  stateCode?: string;
  state?: string;
  gst?: string;
  weekOff?: string[];
  companyLogo?: string;
  isCalendarMonth?: boolean;
}

interface UserState {
  userId: string;
  name: string;
  email: string;
  phone: string;
  token: string;
  selectedDashboard: string;
  isCompanyProfileDone: string;
  selectedCompanyIndex: number;
  asStaffSelectedCompanyIndex: number;
  isLogin: boolean;
  asCompanies: Company[];
  asCustomer: any; // Replace with proper type if known
  asVendor: any;
  asStaff: any;
  userAsOtherCompanies?: any;
}

const defaultState: UserState = {
  userId: "",
  name: "",
  email: "",
  phone: "",
  token: "",
  selectedDashboard: "",
  isCompanyProfileDone: "",
  selectedCompanyIndex: 0,
  asStaffSelectedCompanyIndex: 0,
  isLogin: false,
  asCompanies: [],
  asCustomer: null,
  asVendor: null,
  asStaff: null,
};

let initialState: UserState = defaultState;

try {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    initialState = {
      ...defaultState,
      ...JSON.parse(storedUser),
      isLogin: true,
    };
  }
} catch {
  // fallback to defaultState if localStorage is malformed
  initialState = defaultState;
}

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUserLogin: (state, action) => {
      Object.assign(state, action.payload);
      state.isLogin = true;
      localStorage.setItem("user", JSON.stringify(state));
    },

    setCompanyData: (state, action) => {
      state.asCompanies.push(action.payload);
      state.isLogin = true;
      state.isCompanyProfileDone = "true";
      localStorage.setItem("user", JSON.stringify(state));
    },

    setUserLogout: (state) => {
      localStorage.clear();
      Object.assign(state, defaultState);
    },

    updateUserDetails: (
      state,
      action
    ) => {
      state.name = action.payload.name ?? state.name;
      state.email = action.payload.email ?? state.email;
      state.phone = action.payload.phone ?? state.phone;
      state.selectedCompanyIndex =
        action.payload.selectedCompanyIndex ?? state.selectedCompanyIndex;

      localStorage.setItem("user", JSON.stringify(state));
    },

    updateCompanyDetails: (state, action) => {
      const index = state.selectedCompanyIndex;
      const updatedCompany = {
        ...state.asCompanies[index],
        ...action.payload,
      };
      state.asCompanies[index] = updatedCompany;

      localStorage.setItem("user", JSON.stringify(state));
    },

    setAsStaff: (
      state,
      action
    ) => {
      state.asStaff = action.payload.asStaff ?? state.asStaff;
      state.asStaffSelectedCompanyIndex =
        action.payload.asStaffSelectedCompanyIndex ??
        state.asStaffSelectedCompanyIndex;

      localStorage.setItem("user", JSON.stringify(state));
    },

    setUserAsOtherCompanies: (state, action) => {
      state.userAsOtherCompanies = action.payload;
      localStorage.setItem("user", JSON.stringify(state));
    },
  },
});

export const {
  setUserLogin,
  setUserLogout,
  updateUserDetails,
  updateCompanyDetails,
  setCompanyData,
  setAsStaff,
  setUserAsOtherCompanies,
} = userSlice.actions;

export default userSlice.reducer;
