import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import POManagement from "../POManagement/POManagement";
import SetPo from "../POManagement/SetPo";
import ProductsList from "../Products/ProductsList";
import { ProductView } from "../Products/productView";
import SetProduct from "../Products/SetProduct";
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import Manufacture from "./Manufacture";
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
              <Route path="/products" element={<ProductsList />} />
              <Route path="/products/new" element={<SetProduct />} />
              <Route path="/products/:id" element={<ProductView />} />
              <Route path="/products/:id/edit" element={<SetProduct />} />
              <Route path="/input" element={<Manufacture />} />
            </Routes>
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}

export default Home;
