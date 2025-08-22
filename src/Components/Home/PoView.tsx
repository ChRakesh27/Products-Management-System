import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DateFormate from "../../Constants/DateFormate";
import { useLoading } from "../../context/LoadingContext";
import { db } from "../../firebase";
import type { POEntry } from "../../Model/POEntry";
import { Button } from "../ui/button";
import ToastMSG from "../ui/Toaster";

const PoView = () => {
  const { id } = useParams();
  const [PODetails, setPODetails] = useState<POEntry>(null);
  const { setLoading } = useLoading();
  const navigate = useNavigate();

  const updatePOStatus = async (newStatus) => {
    try {
      await updateDoc(doc(db, "poManagement", id), {
        status: newStatus,
        updatedAt: Timestamp.now(),
      });
      setPODetails({
        ...PODetails,
        status: newStatus,
      });
      ToastMSG("success", "Successfully updated the Status");
    } catch (error) {
      ToastMSG("error", "Failed updated the Status");
      console.log("🚀 ~ updatePOStatus ~ error:", error);
    }
  };

  useEffect(() => {
    const fetchPOData = async () => {
      setLoading(true);
      try {
        const data = (
          await getDoc(doc(db, "poManagement", id))
        ).data() as POEntry;
        setPODetails(data);
      } catch (error) {
        console.log("🚀 ~ fetchPOData ~ error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPOData();
  }, []);

  return (
    <div className="p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Purchase Order Details
        </h3>
        <div className="">
          <Button variant="outline" onClick={() => navigate("/po/edit/" + id)}>
            Edit
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PO Number
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {PODetails?.poNumber}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buyer Name
              </label>
              <p className="text-lg text-gray-900">{PODetails?.supplier}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PO Date
              </label>
              <p className="text-gray-900">{DateFormate(PODetails?.poDate)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date
              </label>
              <p className="text-gray-900">
                {DateFormate(PODetails?.deliveryDate)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Amount
              </label>
              <p className="text-2xl font-bold text-green-600">
                ${PODetails?.totalAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex items-center gap-4">
                <select
                  value={PODetails?.status}
                  onChange={(e) => {
                    updatePOStatus(e.target.value);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Production">In Production</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div>
          <label className="block text-lg font-medium text-gray-900 mb-4">
            Items ({PODetails?.products?.length} style
            {PODetails?.products?.length !== 1 ? "s" : ""})
          </label>
          <div className="space-y-6">
            {PODetails?.products.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-6 border border-gray-200"
              >
                {/* Style Header */}
                <div className="mb-4">
                  <h4 className="font-semibold text-lg text-gray-900 mb-2">
                    {item.name}
                  </h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>

                {/* Variants Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left border-b">Color</th>
                        <th className="px-4 py-2 text-left border-b">Size</th>
                        <th className="px-4 py-2 text-center border-b">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-center border-b">
                          Unit Price
                        </th>
                        <th className="px-4 py-2 text-right border-b">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.variants.map((variant, vi) => (
                        <tr key={vi} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border-b">
                            {variant.color}
                          </td>
                          <td className="px-4 py-2 border-b">{variant.size}</td>
                          <td className="px-4 py-2 border-b text-center">
                            {variant.quantityOrdered}
                          </td>
                          <td className="px-4 py-2 border-b text-center">
                            ₹ {variant.unitPrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 border-b text-right font-medium text-gray-900">
                            ₹ {variant.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Style Total */}
                <div className="text-right mt-4">
                  <p className="text-sm text-gray-600">Style Total</p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{" "}
                    {item.variants
                      .reduce((sum, v) => sum + (v.total || 0), 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice & Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h5 className="font-medium text-gray-900 mb-3">Payment Status</h5>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                PODetails?.paymentStatus === "paid"
                  ? "bg-green-100 text-green-700"
                  : PODetails?.paymentStatus === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {PODetails?.paymentStatus.charAt(0).toUpperCase() +
                PODetails?.paymentStatus.slice(1)}
            </span>
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remarks
          </label>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-gray-900">
              {PODetails?.remarks || "No remarks"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoView;
