import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Manufacture from "../Manufacture/Manufacture";
import ManufactureHome from "../Manufacture/ManufactureHome";
import SetManufactureHome from "../Manufacture/SetManufactureHome";
import POManagement from "../POManagement/POManagement";
import PoView from "../POManagement/PoView";
import SetPo from "../POManagement/SetPo";
import SetPoGiven from "../POManagement/SetPoGiven";
import ProductForm from "../Products/ProductForm";
import Products from "../Products/Products";
import ProductView from "../Products/ProductView";
import RawMaterialForm from "../RawMaterials/RawMaterialForm";
import RawMaterialsList from "../RawMaterials/RawMaterialsList";
import RawMaterialView from "../RawMaterials/RawMaterialView";
import { SidebarProvider } from "../ui/sidebar";
import { VendorList } from "../Vendor/VendorList";
import { VendorUpsert } from "../Vendor/VendorUpsert";
import PartnerView from "../Vendor/VendorView";
import { AppSidebar } from "./AppSidebar";
import Navbar from "./Navbar";
import Production from "./Production";

function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (location.pathname == "/") {
      navigate("/po-given");
    }
  }, []);

  return (
    <div className="w-full overflow-y-auto h-screen">
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <Navbar />
          <div className=" full-body-container w-full">
            <Routes>
              <Route path="/materials" element={<RawMaterialsList />} />
              <Route path="/materials/new" element={<RawMaterialForm />} />
              <Route path="/materials/:id" element={<RawMaterialView />} />
              <Route path="/materials/:id/edit" element={<RawMaterialForm />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/new" element={<ProductForm />} />
              <Route path="/products/:id" element={<ProductView />} />
              <Route path="/products/:id/edit" element={<ProductForm />} />
              <Route
                path="/po-received/:id"
                element={<PoView field={"received"} />}
              />
              <Route
                path="/po-received"
                element={<POManagement field={"received"} />}
              />
              <Route path="/po-received/create" element={<SetPo />} />
              <Route path="/po-received/:id/edit" element={<SetPo />} />
              <Route
                path="/po-given"
                element={<POManagement field={"given"} />}
              />
              <Route
                path="/po-given/:id"
                element={<PoView field={"given"} />}
              />
              <Route path="/po-given/create" element={<SetPoGiven />} />
              <Route path="/po-given/:id/edit" element={<SetPoGiven />} />
              <Route path="/production" element={<Production />} />
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
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}

export default Home;
