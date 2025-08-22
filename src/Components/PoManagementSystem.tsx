import {
  Bell,
  CheckCircle,
  Circle,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Filter,
  Package,
  Plus,
  Search,
  Settings,
  Trash2,
  Truck,
} from "lucide-react";
import { useState } from "react";

const PurchaseOrderManagement = () => {
  // Purchase Orders data
  const [purchaseOrders, setPurchaseOrders] = useState([
    {
      id: 1,
      poNumber: "PO-2024-001",
      supplier: "TechCorp",
      orderDate: "2024-07-25",
      expectedDelivery: "2024-08-05",
      status: "pending",
      totalAmount: 2399.5,
      items: [
        {
          productName: "Wireless Bluetooth Headphones",
          quantity: 30,
          unitPrice: 79.99,
        },
      ],
      notes: "Urgent order for Q3 inventory restocking",
      createdBy: "John Smith",
      lastUpdated: "2024-07-29",
    },
    {
      id: 2,
      poNumber: "PO-2024-002",
      supplier: "OfficeMax",
      orderDate: "2024-07-20",
      expectedDelivery: "2024-07-30",
      status: "approved",
      totalAmount: 5999.75,
      items: [
        {
          productName: "Ergonomic Office Chair",
          quantity: 20,
          unitPrice: 299.99,
        },
      ],
      notes: "Bulk order for new office setup",
      createdBy: "Sarah Johnson",
      lastUpdated: "2024-07-28",
    },
    {
      id: 3,
      poNumber: "PO-2024-003",
      supplier: "EcoProducts",
      orderDate: "2024-07-15",
      expectedDelivery: "2024-07-25",
      status: "shipped",
      totalAmount: 1249.5,
      items: [
        {
          productName: "Stainless Steel Water Bottle",
          quantity: 50,
          unitPrice: 24.99,
        },
      ],
      notes: "Emergency restock - low inventory alert",
      createdBy: "Mike Davis",
      lastUpdated: "2024-07-29",
    },
    {
      id: 4,
      poNumber: "PO-2024-004",
      supplier: "GameTech",
      orderDate: "2024-07-10",
      expectedDelivery: "2024-07-20",
      status: "received",
      totalAmount: 2999.85,
      items: [
        {
          productName: "Mechanical Gaming Keyboard",
          quantity: 20,
          unitPrice: 149.99,
        },
      ],
      notes: "Pre-order for upcoming product launch",
      createdBy: "Emily Chen",
      lastUpdated: "2024-07-21",
    },
    {
      id: 5,
      poNumber: "PO-2024-005",
      supplier: "TechCorp",
      orderDate: "2024-07-12",
      expectedDelivery: "2024-07-22",
      status: "cancelled",
      totalAmount: 1799.7,
      items: [
        { productName: "Wireless Mouse", quantity: 60, unitPrice: 29.99 },
      ],
      notes: "Cancelled due to supplier issues",
      createdBy: "John Smith",
      lastUpdated: "2024-07-18",
    },
  ]);

  const [currentView, setCurrentView] = useState("list");
  const [showNewPOModal, setShowNewPOModal] = useState(false);
  const [showPODetails, setShowPODetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // New PO form state
  const [newPOForm, setNewPOForm] = useState({
    supplier: "",
    expectedDelivery: "",
    items: [{ productName: "", quantity: "", unitPrice: "" }],
    notes: "",
  });

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
    (po) => po.status === "pending"
  ).length;

  const receivedCount = purchaseOrders.filter(
    (po) => po.status === "received"
  ).length;

  // PO operations
  const addNewPO = () => {
    if (newPOForm.supplier.trim() && newPOForm.items[0].productName.trim()) {
      const totalAmount = newPOForm.items.reduce(
        (sum, item) =>
          sum +
          (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0),
        0
      );

      const newPO = {
        id: Date.now(),
        poNumber: `PO-2024-${String(purchaseOrders.length + 1).padStart(
          3,
          "0"
        )}`,
        orderDate: new Date().toISOString().split("T")[0],
        status: "pending",
        totalAmount: totalAmount,
        createdBy: "Current User",
        lastUpdated: new Date().toISOString().split("T")[0],
        ...newPOForm,
        items: newPOForm.items.map((item) => ({
          ...item,
          quantity: parseInt(item.quantity) || 0,
          unitPrice: parseFloat(item.unitPrice) || 0,
        })),
      };

      setPurchaseOrders([...purchaseOrders, newPO]);
      setNewPOForm({
        supplier: "",
        expectedDelivery: "",
        items: [{ productName: "", quantity: "", unitPrice: "" }],
        notes: "",
      });
      setShowNewPOModal(false);
    }
  };

  const updatePOStatus = (poId, newStatus) => {
    setPurchaseOrders(
      purchaseOrders.map((po) => {
        if (po.id === poId) {
          return {
            ...po,
            status: newStatus,
            lastUpdated: new Date().toISOString().split("T")[0],
          };
        }
        return po;
      })
    );
  };

  const deletePO = (poId) => {
    setPurchaseOrders(purchaseOrders.filter((po) => po.id !== poId));
  };

  const addPOItem = () => {
    setNewPOForm({
      ...newPOForm,
      items: [
        ...newPOForm.items,
        { productName: "", quantity: "", unitPrice: "" },
      ],
    });
  };

  const updatePOItem = (index, field, value) => {
    const updatedItems = newPOForm.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setNewPOForm({ ...newPOForm, items: updatedItems });
  };

  const removePOItem = (index) => {
    if (newPOForm.items.length > 1) {
      setNewPOForm({
        ...newPOForm,
        items: newPOForm.items.filter((_, i) => i !== index),
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "approved":
        return "text-blue-600 bg-blue-100";
      case "shipped":
        return "text-purple-600 bg-purple-100";
      case "received":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case "shipped":
        return <Truck className="w-4 h-4 text-purple-600" />;
      case "received":
        return <Package className="w-4 h-4 text-green-600" />;
      case "cancelled":
        return <Circle className="w-4 h-4 text-red-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  // PO Details Modal
  const PODetailsModal = () => {
    if (!showPODetails) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Purchase Order Details</h3>
            <button
              onClick={() => setShowPODetails(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              x
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  PO Number
                </label>
                <p className="text-sm text-gray-900">
                  {showPODetails.poNumber}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Supplier
                </label>
                <p className="text-sm text-gray-900">
                  {showPODetails.supplier}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Order Date
                </label>
                <p className="text-sm text-gray-900">
                  {showPODetails.orderDate}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Expected Delivery
                </label>
                <p className="text-sm text-gray-900">
                  {showPODetails.expectedDelivery}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    showPODetails.status
                  )}`}
                >
                  {showPODetails.status.charAt(0).toUpperCase() +
                    showPODetails.status.slice(1)}
                </span>
                <select
                  value={showPODetails.status}
                  onChange={(e) => {
                    updatePOStatus(showPODetails.id, e.target.value);
                    setShowPODetails({
                      ...showPODetails,
                      status: e.target.value,
                    });
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="shipped">Shipped</option>
                  <option value="received">Received</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                {showPODetails.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × ${item.unitPrice}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-300">
                  <p className="font-semibold">Total Amount:</p>
                  <p className="font-semibold text-lg">
                    ${showPODetails.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <p className="text-sm text-gray-900">
                {showPODetails.notes || "No notes"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Created By
                </label>
                <p className="text-sm text-gray-900">
                  {showPODetails.createdBy}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Updated
                </label>
                <p className="text-sm text-gray-900">
                  {showPODetails.lastUpdated}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // New PO Modal Component
  const NewPOModal = () => {
    if (!showNewPOModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">
            Create New Purchase Order
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <input
                  type="text"
                  value={newPOForm.supplier}
                  onChange={(e) =>
                    setNewPOForm({ ...newPOForm, supplier: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter supplier name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Delivery
                </label>
                <input
                  type="date"
                  value={newPOForm.expectedDelivery}
                  onChange={(e) =>
                    setNewPOForm({
                      ...newPOForm,
                      expectedDelivery: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Items
                </label>
                <button
                  onClick={addPOItem}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Add Item
                </button>
              </div>
              {newPOForm.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-end mb-2"
                >
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.productName}
                      onChange={(e) =>
                        updatePOItem(index, "productName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Product name"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updatePOItem(index, "quantity", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Qty"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updatePOItem(index, "unitPrice", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Unit price"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="flex gap-1">
                      <span className="text-sm text-gray-600 py-2">
                        $
                        {(
                          (parseFloat(item.quantity) || 0) *
                          (parseFloat(item.unitPrice) || 0)
                        ).toFixed(2)}
                      </span>
                      {newPOForm.items.length > 1 && (
                        <button
                          onClick={() => removePOItem(index)}
                          className="text-red-600 hover:text-red-700 px-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={newPOForm.notes}
                onChange={(e) =>
                  setNewPOForm({ ...newPOForm, notes: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Additional notes or requirements"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowNewPOModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addNewPO}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create PO
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // PO Card Component
  const POCard = ({ po }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900">{po.poNumber}</h4>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowPODetails(po)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => deletePO(po.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3">{po.supplier}</p>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              po.status
            )}`}
          >
            {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
          </span>
          {getStatusIcon(po.status)}
        </div>
        <div className="text-sm font-medium text-gray-900">
          ${po.totalAmount.toFixed(2)}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div>Order: {po.orderDate}</div>
        <div>Expected: {po.expectedDelivery}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Purchase Order Management
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search POs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* PO Overview */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full bg-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Purchase Order Overview
              </h2>
            </div>
          </div>

          {/* PO Stats */}
          <div className="grid grid-cols-4 gap-4 pt-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">
                  Total POs
                </span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {totalPOs}
              </span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-500">
                  Total Value
                </span>
              </div>
              <span className="text-lg font-semibold text-green-600">
                ${totalValue.toFixed(2)}
              </span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-500">
                  Pending
                </span>
              </div>
              <span className="text-lg font-semibold text-yellow-600">
                {pendingCount}
              </span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Package className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-500">
                  Received
                </span>
              </div>
              <span className="text-lg font-semibold text-green-600">
                {receivedCount}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
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
                Grid
              </button>
              <button
                onClick={() => setCurrentView("list")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                List
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="shipped">Shipped</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setShowNewPOModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create PO
          </button>
        </div>

        {/* Grid View */}
        {currentView === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPOs.map((po) => (
              <div key={po.id} className="cursor-pointer">
                <POCard po={po} />
              </div>
            ))}
            {filteredPOs.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No purchase orders found.{" "}
                {searchTerm && `Try adjusting your search for "${searchTerm}".`}
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {currentView === "list" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
                <div className="col-span-2">PO Number</div>
                <div className="col-span-2">Supplier</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Order Date</div>
                <div className="col-span-2">Total Amount</div>
                <div className="col-span-2">Actions</div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredPOs.map((po) => (
                <div key={po.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(po.status)}
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {po.poNumber}
                          </h4>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">
                        {po.supplier}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          po.status
                        )}`}
                      >
                        {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">
                        {po.orderDate}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-medium text-gray-900">
                        ${po.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowPODetails(po)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePO(po.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredPOs.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-500">
                  No purchase orders found.{" "}
                  {searchTerm &&
                    `Try adjusting your search for "${searchTerm}".`}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewPOModal />
      <PODetailsModal />
    </div>
  );
};

export default PurchaseOrderManagement;
