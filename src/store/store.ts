import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./UserSlice";
import VendorSlice from "./VenderSlice";

const store = configureStore({
  reducer: {
    users: userSlice,
    vendors: VendorSlice,
  },
});

export default store;
