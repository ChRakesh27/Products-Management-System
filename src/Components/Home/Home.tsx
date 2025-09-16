import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { SidebarProvider } from "../ui/sidebar";
import { VendorList } from "../Vendor/VendorList";
import { VendorUpsert } from "../Vendor/VendorUpsert";
import { AppSidebar } from "./AppSidebar";
import Navbar from "./Navbar";

// 🔹 Lazy imports
const UserProfile = lazy(() => import("../Settings/UserProfile"));
const CompanyProfile = lazy(() => import("../Settings/CompanyProfile"));
const Manufacture = lazy(() => import("../Manufacture/Manufacture"));
const ManufactureHome = lazy(() => import("../Manufacture/ManufactureHome"));
const SetManufactureHome = lazy(
  () => import("../Manufacture/SetManufactureHome")
);

const PoCustomer = lazy(() => import("../PoCustomer/PoCustomer"));
const PoCustomerView = lazy(() => import("../PoCustomer/PoCustomerView"));
const SetPoCustomer = lazy(() => import("../PoCustomer/SetPoCustomer"));

const PoVendor = lazy(() => import("../PoVendor/PoVendor"));
const PoVendorView = lazy(() => import("../PoVendor/PoVendorView"));
const SetPoVendor = lazy(() => import("../PoVendor/SetPoVendor"));

const Products = lazy(() => import("../Products/Products"));
const ProductForm = lazy(() => import("../Products/ProductForm"));
const ProductView = lazy(() => import("../Products/ProductView"));

const RawMaterialsList = lazy(() => import("../RawMaterials/RawMaterialsList"));
const RawMaterialForm = lazy(() => import("../RawMaterials/RawMaterialForm"));
const RawMaterialView = lazy(() => import("../RawMaterials/RawMaterialView"));

const PartnerView = lazy(() => import("../Vendor/VendorView"));

function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/po-given");
    }
  }, [location.pathname, navigate]);

  return (
    <div className="w-full overflow-y-auto h-screen">
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <Navbar />
          <div className="full-body-container w-full">
            <Suspense fallback={<div className="p-4">Loading...</div>}>
              <Routes>
                <Route path="/UserProfile" element={<UserProfile />} />
                <Route path="/companyProfile" element={<CompanyProfile />} />
                <Route path="/materials" element={<RawMaterialsList />} />
                <Route path="/materials/new" element={<RawMaterialForm />} />
                <Route path="/materials/:id" element={<RawMaterialView />} />
                <Route
                  path="/materials/:id/edit"
                  element={<RawMaterialForm />}
                />

                <Route path="/products" element={<Products />} />
                <Route path="/products/new" element={<ProductForm />} />
                <Route path="/products/:id" element={<ProductView />} />
                <Route path="/products/:id/edit" element={<ProductForm />} />

                <Route path="/po-customer" element={<PoCustomer />} />
                <Route path="/po-customer/create" element={<SetPoCustomer />} />
                <Route path="/po-customer/:id" element={<PoCustomerView />} />

                <Route path="/po-vendor" element={<PoVendor />} />
                <Route path="/po-vendor/create" element={<SetPoVendor />} />
                <Route path="/po-vendor/:id" element={<PoVendorView />} />

                <Route path="/manufactures" element={<ManufactureHome />} />
                <Route
                  path="/manufactures/new"
                  element={<SetManufactureHome />}
                />
                <Route
                  path="/manufactures/:id/edit"
                  element={<SetManufactureHome />}
                />
                <Route path="/manufactures/:id" element={<Manufacture />} />

                <Route path="/partners" element={<VendorList />} />
                <Route path="/partners/new" element={<VendorUpsert />} />
                <Route path="/partners/:id" element={<PartnerView />} />
                <Route path="/partners/:id/edit" element={<VendorUpsert />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}

export default Home;
