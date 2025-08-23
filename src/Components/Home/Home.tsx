import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import ManufactureHome from "../Manufacture/ManufactureHome";
import POManagement from "../POManagement/POManagement";
import SetPo from "../POManagement/SetPo";
import ProductsList from "../Products/ProductsList";
import { ProductView } from "../Products/productView";
import SetProduct from "../Products/SetProduct";
import { SidebarProvider } from "../ui/sidebar";
import { VendorList } from "../Vendor/VendorList";
import { VendorUpsert } from "../Vendor/VendorUpsert";
import { VendorView } from "../Vendor/VendorView";
import { AppSidebar } from "./AppSidebar";
import Navbar from "./Navbar";
import PoView from "./PoView";
import Production from "./Production";

function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (location.pathname == "/") {
      navigate("/po");
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
              <Route path="/po" element={<POManagement />} />
              <Route path="/po/:id" element={<PoView />} />
              <Route path="/po/create" element={<SetPo />} />
              <Route path="/po/edit/:id" element={<SetPo />} />
              <Route path="/production" element={<Production />} />
              <Route path="/materials" element={<ProductsList />} />
              <Route path="/materials/new" element={<SetProduct />} />
              <Route path="/materials/:id" element={<ProductView />} />
              <Route path="/materials/:id/edit" element={<SetProduct />} />
              <Route path="/input" element={<ManufactureHome />} />
              <Route path="/vendors" element={<VendorList />} />
              <Route path="/vendors/new" element={<VendorUpsert />} />
              <Route path="/vendors/:id" element={<VendorView />} />
              <Route path="/vendors/:id/edit" element={<VendorUpsert />} />
            </Routes>
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}

export default Home;
