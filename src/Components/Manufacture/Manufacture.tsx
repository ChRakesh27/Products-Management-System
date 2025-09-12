import { Box, Clipboard, Factory } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { manufacturesAPI } from "../../Api/firebaseManufacture";
import { poReceivedAPI } from "../../Api/firebasePOsReceived";
import { useLoading } from "../../context/LoadingContext";
import type { POReceivedModel } from "../../Model/POEntry";
import ProductionData from "./ProductionData";

function Manufacture() {
  const { id } = useParams();
  const [currentTab, setCurrentTab] = useState("production");
  const [po, setPo] = useState<POReceivedModel>();

  const { setLoading } = useLoading();
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await manufacturesAPI.get(id);
        console.log("🚀 ~ fetchProduct ~ res:", res);
        const poRes = await poReceivedAPI.get(res.poId);
        setPo(poRes);
      } catch (error) {
        console.log("🚀 ~ fetchProduct ~ error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, []);

  const tabs = [
    { id: "production", label: "Production Data", icon: Factory },
    { id: "products", label: "Products", icon: Box },
    // { id: "materials", label: "Material Usage", icon: Box },
    // { id: "quality", label: "Quality Control", icon: CheckCircle },
    // { id: "inventory", label: "Inventory", icon: Layers },
    // { id: "workforce", label: "Workforce", icon: Users },
    // { id: "machines", label: "Machines", icon: Settings },
  ];
  if (!po) {
    return <div>Loading..</div>;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-9">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Clipboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manufacturing Data Input
            </h1>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            # PO: {po?.poNo}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      {/* <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  currentTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div> */}

      {/* Main Content */}
      {/* <div className="px-6 py-6">
        {currentTab === "production" &&  <ProductionData poData={po} />}
        {currentTab === "products" && <ProductView products={po.products} />}
        {currentTab === "materials" && (
          <MaterialUsage productData={product} products={po.products} />
        )}
        {currentTab === "machines" && <Machine />}
      </div> */}
      <div className="px-6 py-6">
        <ProductionData poData={po} />
      </div>
    </div>
  );
}

export default Manufacture;
