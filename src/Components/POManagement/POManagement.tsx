import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import {
  Bell,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  DollarSign,
  FileText,
  Filter,
  Palette,
  Plus,
  Scissors,
  Search,
  Settings,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DateFormate from "../../Constants/DateFormate";
import { useLoading } from "../../context/LoadingContext";
import { db } from "../../firebase";
import type { POEntry } from "../../Model/POEntry";
import ToastMSG from "../ui/Toaster";

const POManagement = () => {
  const { setLoading } = useLoading();

  const [purchaseOrders, setPurchaseOrders] = useState<
    (POEntry & { id: string })[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentView, setCurrentView] = useState("list");
  const navigate = useNavigate();
  // Filter purchase orders
  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || po.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  // Calculate stats
  const totalPOs = purchaseOrders.length;
  const totalValue = purchaseOrders.reduce(
    (sum, po) => sum + po.totalAmount,
    0
  );
  const pendingCount = purchaseOrders.filter(
    (po) => po.status === "Pending"
  ).length;
  const inProductionCount = purchaseOrders.filter(
    (po) => po.status === "In Production"
  ).length;
  const completedCount = purchaseOrders.filter(
    (po) => po.status === "Completed"
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "text-yellow-700 bg-yellow-100 border-yellow-200";
      case "In Production":
        return "text-blue-700 bg-blue-100 border-blue-200";
      case "Completed":
        return "text-green-700 bg-green-100 border-green-200";
      case "Cancelled":
        return "text-red-700 bg-red-100 border-red-200";
      default:
        return "text-gray-700 bg-gray-100 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "In production":
        return <Settings className="w-4 h-4 text-blue-600" />;
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Cancelled":
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const deletePO = async (poId: string) => {
    if (
      window.confirm("Are you sure you want to delete this Purchase Order?")
    ) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, "poManagement", poId));
        setPurchaseOrders(purchaseOrders.filter((po) => po.id !== poId));
        ToastMSG("success", "Successfully delete the PO");
      } catch (error) {
        ToastMSG("error", "Failed to delete the PO");
        console.log("🚀 ~ deletePO ~ error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const fetchPOData = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "poManagement"));
        const data: (POEntry & { id: string })[] = querySnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...(doc.data() as POEntry),
          })
        );
        setPurchaseOrders(data);
      } catch (error) {
        console.log("🚀 ~ fetchPOData ~ error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPOData();
  }, []);

  const POCard = ({ po }) => (
    <div
      className="bg-white p-6 rounded-lg cursor-pointer shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
      onClick={() => {
        navigate("/po/" + po.id);
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900 text-lg">{po.poNumber}</h4>
          <p className="text-sm text-gray-600 mt-1">{po.buyerName}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => deletePO(po.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete PO"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
              po.status
            )}`}
          >
            {po.status.charAt(0).toUpperCase() +
              po.status.slice(1).replace("-", " ")}
          </span>
          {getStatusIcon(po.status)}
        </div>
        <div className="text-lg font-semibold text-gray-900">
          ${po.totalAmount.toFixed(2)}
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-4 h-4" />
          <span>
            {po.products.length} style{po.products.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="text-xs">
          {po.products
            .slice(0, 2)
            .map((item) => `${item.styleName} (${item.color})`)
            .join(", ")}
          {po.products.length > 2 && ` +${po.products.length - 2} more`}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>PO: {new Date(po.poDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Truck className="w-3 h-3" />
          <span>
            Delivery: {new Date(po.deliveryDate).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">PO Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search POs, buyers, styles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* PO Overview */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-600 rounded-full" />
              <h2 className="text-xl font-semibold text-gray-900">
                Production Overview
              </h2>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>

          {/* PO Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">
                  Total POs
                </span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {totalPOs}
              </span>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Total Value
                </span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                ${totalValue.toFixed(2)}
              </span>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">
                  Pending
                </span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {pendingCount}
              </span>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  In Production
                </span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {inProductionCount}
              </span>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Completed
                </span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {completedCount}
              </span>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-700">
                  Cancelled
                </span>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {totalPOs - completedCount - inProductionCount - pendingCount}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentView("grid")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "grid"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setCurrentView("list")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                List View
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Production">In Production</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => {
              navigate("/po/create");
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            New PO Entry
          </button>
        </div>

        {/* Grid View */}
        {currentView === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPOs.map((po) => (
              <POCard key={po.id} po={po} />
            ))}
            {filteredPOs.length === 0 && (
              <div className="col-span-full text-center py-16">
                <Scissors className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No purchase orders found
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm
                    ? `No results for "${searchTerm}". Try adjusting your search.`
                    : "Get started by creating your first purchase order."}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate("/po/create")}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    New PO Entry
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {currentView === "list" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                <div className="col-span-3">Purchase Order</div>
                <div className="col-span-2">Buyer</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Styles</div>
                <div className="col-span-2">Total Amount</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredPOs.map((po) => (
                <div
                  key={po.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer "
                  onClick={() => {
                    navigate("/po/" + po.id);
                  }}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(po.status)}
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {po.poNumber}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {DateFormate(po.poDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-medium text-gray-900">
                        {po.supplier}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
                          po.status
                        )}`}
                      >
                        {po.status.charAt(0).toUpperCase() +
                          po.status.slice(1).replace("-", " ")}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {po.products.length} style
                          {po.products.length !== 1 ? "s" : ""}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {po.products[0]?.name}
                          {po.products.length > 1 &&
                            ` +${po.products.length - 1} more`}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-lg font-semibold text-gray-900">
                        ${po.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePO(po.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete PO"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredPOs.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <Scissors className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No purchase orders found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm
                      ? `No results for "${searchTerm}". Try adjusting your search.`
                      : "Get started by creating your first purchase order."}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => navigate("/po/create")}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      New PO Entry
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POManagement;
