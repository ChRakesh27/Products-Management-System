import { Clipboard } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { manufacturesAPI } from "../../Api/firebaseManufacture";
import { poReceivedAPI } from "../../Api/firebasePOsReceived";
import { useLoading } from "../../context/LoadingContext";
import type { ManufactureModel } from "../../Model/DailyProductionModel";
import type { POReceivedModel } from "../../Model/POEntry";
import ProductionData from "./ProductionData";

function Manufacture() {
  const { id } = useParams();
  const [po, setPo] = useState<POReceivedModel>();
  const [workOrder, setWorkOrder] = useState<ManufactureModel>();

  const { setLoading } = useLoading();
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await manufacturesAPI.get(id);
        setWorkOrder(res);
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

  if (!po) {
    return <div>Loading..</div>;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-9">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Clipboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            # PO: {po?.poNo}
          </div>
        </div>
      </header>
      <div className="px-6 py-6">
        <ProductionData poData={po} workOrder={workOrder} />
      </div>
    </div>
  );
}

export default Manufacture;
