import { createSlice } from "@reduxjs/toolkit";

let initialState = {
  data: [],
};

const VendorSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {
    setAllVendorsDetails: (state, action) => {
      state.data = action.payload;
    },
    deleteVendorDetails: (state, action) => {
      const vendorId = action.payload;
      state.data = state.data.filter((ele) => ele.id !== vendorId);
    },
    setVendorDetails: (state, action) => {
      const vendorData = action.payload;
      state.data.push(vendorData);
    },
    updateVendorDetails: (state, action) => {
      const vendorData = action.payload;
      state.data = state.data.map((ele) => {
        if (ele.id === vendorData.id) {
          ele = vendorData;
        }
        return ele;
      });
    },
  },
});

export const {
  setAllVendorsDetails,
  setVendorDetails,
  deleteVendorDetails,
  updateVendorDetails,
} = VendorSlice.actions;

export default VendorSlice.reducer;
