import {
  Activity,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Eye,
  Factory,
  Filter,
  Pause,
  Play,
  Plus,
  Search,
  Settings,
  StopCircle,
  Trash2,
} from "lucide-react";
import { useState } from "react";

const DailyUsageManagement = () => {
  // Available inventory items
  const [availableItems] = useState([
    {
      id: 1,
      name: "Wireless Bluetooth Headphones",
      sku: "WBH-001",
      currentStock: 150,
      unit: "pcs",
    },
    {
      id: 2,
      name: "Ergonomic Office Chair",
      sku: "EOC-002",
      currentStock: 25,
      unit: "pcs",
    },
    {
      id: 3,
      name: "Stainless Steel Water Bottle",
      sku: "SSWB-003",
      currentStock: 8,
      unit: "pcs",
    },
    {
      id: 4,
      name: "Mechanical Gaming Keyboard",
      sku: "MGK-004",
      currentStock: 0,
      unit: "pcs",
    },
    {
      id: 5,
      name: "Plastic Components",
      sku: "PC-005",
      currentStock: 500,
      unit: "units",
    },
    {
      id: 6,
      name: "Steel Wire",
      sku: "SW-006",
      currentStock: 200,
      unit: "meters",
    },
    {
      id: 7,
      name: "Electronic Circuits",
      sku: "EC-007",
      currentStock: 75,
      unit: "pcs",
    },
  ]);

  // Production orders/usage records
  const [usageRecords, setUsageRecords] = useState([
    {
      id: 1,
      batchNumber: "BATCH-001",
      productionDate: "2024-07-29",
      status: "in-progress",
      department: "Assembly",
      supervisor: "John Smith",
      targetOutput: 50,
      actualOutput: 35,
      items: [
        {
          itemId: 1,
          itemName: "Wireless Bluetooth Headphones",
          quantityUsed: 35,
          unit: "pcs",
        },
        {
          itemId: 5,
          itemName: "Plastic Components",
          quantityUsed: 175,
          unit: "units",
        },
      ],
      startTime: "08:00",
      endTime: "16:00",
      notes: "Production running smoothly, minor delay due to quality check",
    },
    {
      id: 2,
      batchNumber: "BATCH-002",
      productionDate: "2024-07-28",
      status: "completed",
      department: "Manufacturing",
      supervisor: "Sarah Johnson",
      targetOutput: 20,
      actualOutput: 20,
      items: [
        {
          itemId: 2,
          itemName: "Ergonomic Office Chair",
          quantityUsed: 20,
          unit: "pcs",
        },
        { itemId: 6, itemName: "Steel Wire", quantityUsed: 40, unit: "meters" },
      ],
      startTime: "09:00",
      endTime: "17:00",
      notes: "Successfully completed all target units",
    },
    {
      id: 3,
      batchNumber: "BATCH-003",
      productionDate: "2024-07-29",
      status: "pending",
      department: "Electronics",
      supervisor: "Mike Davis",
      targetOutput: 30,
      actualOutput: 0,
      items: [
        {
          itemId: 4,
          itemName: "Mechanical Gaming Keyboard",
          quantityUsed: 0,
          unit: "pcs",
        },
        {
          itemId: 7,
          itemName: "Electronic Circuits",
          quantityUsed: 0,
          unit: "pcs",
        },
      ],
      startTime: "10:00",
      endTime: "",
      notes: "Waiting for inventory restock",
    },
    {
      id: 4,
      batchNumber: "BATCH-004",
      productionDate: "2024-07-27",
      status: "paused",
      department: "Assembly",
      supervisor: "Emily Chen",
      targetOutput: 100,
      actualOutput: 45,
      items: [
        {
          itemId: 3,
          itemName: "Stainless Steel Water Bottle",
          quantityUsed: 45,
          unit: "pcs",
        },
        {
          itemId: 5,
          itemName: "Plastic Components",
          quantityUsed: 90,
          unit: "units",
        },
      ],
      startTime: "07:00",
      endTime: "",
      notes: "Paused due to equipment maintenance",
    },
  ]);

  const [currentView, setCurrentView] = useState("list");
  const [showNewUsageModal, setShowNewUsageModal] = useState(false);
  const [showUsageDetails, setShowUsageDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // New usage form state
  const [newUsageForm, setNewUsageForm] = useState({
    department: "Assembly",
    supervisor: "",
    targetOutput: "",
    startTime: "",
    items: [{ itemId: "", quantityUsed: "" }],
    notes: "",
  });

  // Filter usage records
  const filteredRecords = usageRecords.filter((record) => {
    const matchesSearch =
      record.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.supervisor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || record.status === filterStatus;
    const matchesDate = !selectedDate || record.productionDate === selectedDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate stats
  const totalBatches = usageRecords.length;
  const activeBatches = usageRecords.filter(
    (r) => r.status === "in-progress"
  ).length;
  const completedToday = usageRecords.filter(
    (r) =>
      r.productionDate === new Date().toISOString().split("T")[0] &&
      r.status === "completed"
  ).length;
  const totalOutputToday = usageRecords
    .filter((r) => r.productionDate === new Date().toISOString().split("T")[0])
    .reduce((sum, r) => sum + r.actualOutput, 0);

  // Usage operations
  const addNewUsage = () => {
    if (newUsageForm.department.trim() && newUsageForm.supervisor.trim()) {
      const newUsage = {
        id: Date.now(),
        batchNumber: `BATCH-${String(usageRecords.length + 1).padStart(
          3,
          "0"
        )}`,
        productionDate: selectedDate,
        status: "pending",
        actualOutput: 0,
        endTime: "",
        ...newUsageForm,
        targetOutput: parseInt(newUsageForm.targetOutput) || 0,
        items: newUsageForm.items
          .map((item) => {
            const selectedItem = availableItems.find(
              (ai) => ai.id === parseInt(item.itemId)
            );
            return {
              ...item,
              itemId: parseInt(item.itemId),
              itemName: selectedItem?.name || "",
              quantityUsed: 0,
              unit: selectedItem?.unit || "pcs",
            };
          })
          .filter((item) => item.itemId),
      };

      setUsageRecords([...usageRecords, newUsage]);
      setNewUsageForm({
        department: "Assembly",
        supervisor: "",
        targetOutput: "",
        startTime: "",
        items: [{ itemId: "", quantityUsed: "" }],
        notes: "",
      });
      setShowNewUsageModal(false);
    }
  };

  const updateUsageStatus = (usageId, newStatus) => {
    setUsageRecords(
      usageRecords.map((record) => {
        if (record.id === usageId) {
          return {
            ...record,
            status: newStatus,
            endTime:
              newStatus === "completed"
                ? new Date().toLocaleTimeString("en-US", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : record.endTime,
          };
        }
        return record;
      })
    );
  };

  const updateItemUsage = (usageId, itemIndex, quantityUsed) => {
    setUsageRecords(
      usageRecords.map((record) => {
        if (record.id === usageId) {
          const updatedItems = record.items.map((item, index) =>
            index === itemIndex
              ? { ...item, quantityUsed: parseInt(quantityUsed) || 0 }
              : item
          );
          return { ...record, items: updatedItems };
        }
        return record;
      })
    );
  };

  const updateActualOutput = (usageId, actualOutput) => {
    setUsageRecords(
      usageRecords.map((record) =>
        record.id === usageId
          ? { ...record, actualOutput: parseInt(actualOutput) || 0 }
          : record
      )
    );
  };

  const deleteUsage = (usageId) => {
    setUsageRecords(usageRecords.filter((record) => record.id !== usageId));
  };

  const addUsageItem = () => {
    setNewUsageForm({
      ...newUsageForm,
      items: [...newUsageForm.items, { itemId: "", quantityUsed: "" }],
    });
  };

  const updateUsageItem = (index, field, value) => {
    const updatedItems = newUsageForm.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setNewUsageForm({ ...newUsageForm, items: updatedItems });
  };

  const removeUsageItem = (index) => {
    if (newUsageForm.items.length > 1) {
      setNewUsageForm({
        ...newUsageForm,
        items: newUsageForm.items.filter((_, i) => i !== index),
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-gray-600 bg-gray-100";
      case "in-progress":
        return "text-blue-600 bg-blue-100";
      case "paused":
        return "text-yellow-600 bg-yellow-100";
      case "completed":
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
        return <Clock className="w-4 h-4 text-gray-600" />;
      case "in-progress":
        return <Play className="w-4 h-4 text-blue-600" />;
      case "paused":
        return <Pause className="w-4 h-4 text-yellow-600" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "cancelled":
        return <StopCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  // Usage Details Modal
  const UsageDetailsModal = () => {
    if (!showUsageDetails) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Production Batch Details</h3>
            <button
              onClick={() => setShowUsageDetails(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Batch Number
                </label>
                <p className="text-sm text-gray-900">
                  {showUsageDetails.batchNumber}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <p className="text-sm text-gray-900">
                  {showUsageDetails.department}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Supervisor
                </label>
                <p className="text-sm text-gray-900">
                  {showUsageDetails.supervisor}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Production Date
                </label>
                <p className="text-sm text-gray-900">
                  {showUsageDetails.productionDate}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time
                </label>
                <p className="text-sm text-gray-900">
                  {showUsageDetails.startTime} -{" "}
                  {showUsageDetails.endTime || "Ongoing"}
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
                    showUsageDetails.status
                  )}`}
                >
                  {showUsageDetails.status.charAt(0).toUpperCase() +
                    showUsageDetails.status.slice(1).replace("-", " ")}
                </span>
                <select
                  value={showUsageDetails.status}
                  onChange={(e) => {
                    updateUsageStatus(showUsageDetails.id, e.target.value);
                    setShowUsageDetails({
                      ...showUsageDetails,
                      status: e.target.value,
                    });
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Target Output
                </label>
                <p className="text-sm text-gray-900">
                  {showUsageDetails.targetOutput} units
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Actual Output
                </label>
                <input
                  type="number"
                  value={showUsageDetails.actualOutput}
                  onChange={(e) => {
                    updateActualOutput(showUsageDetails.id, e.target.value);
                    setShowUsageDetails({
                      ...showUsageDetails,
                      actualOutput: parseInt(e.target.value) || 0,
                    });
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm w-24"
                />
                <span className="text-sm text-gray-600 ml-2">units</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items Usage
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                {showUsageDetails.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{item.itemName}</p>
                      <p className="text-sm text-gray-600">
                        Available:{" "}
                        {availableItems.find((ai) => ai.id === item.itemId)
                          ?.currentStock || 0}{" "}
                        {item.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={item.quantityUsed}
                        onChange={(e) =>
                          updateItemUsage(
                            showUsageDetails.id,
                            index,
                            e.target.value
                          )
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm w-20"
                        min="0"
                      />
                      <span className="text-sm text-gray-600">{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                {showUsageDetails.notes || "No notes"}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Efficiency:
                  </span>
                  <span className="ml-2 text-lg font-semibold text-blue-600">
                    {showUsageDetails.targetOutput > 0
                      ? Math.round(
                          (showUsageDetails.actualOutput /
                            showUsageDetails.targetOutput) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Status:
                  </span>
                  <span className="ml-2 text-sm font-medium">
                    {showUsageDetails.actualOutput}/
                    {showUsageDetails.targetOutput} units
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // New Usage Modal Component
  const NewUsageModal = () => {
    if (!showNewUsageModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">
            Create New Production Batch
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={newUsageForm.department}
                  onChange={(e) =>
                    setNewUsageForm({
                      ...newUsageForm,
                      department: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Assembly">Assembly</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Quality Control">Quality Control</option>
                  <option value="Packaging">Packaging</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supervisor
                </label>
                <input
                  type="text"
                  value={newUsageForm.supervisor}
                  onChange={(e) =>
                    setNewUsageForm({
                      ...newUsageForm,
                      supervisor: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter supervisor name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Output
                </label>
                <input
                  type="number"
                  value={newUsageForm.targetOutput}
                  onChange={(e) =>
                    setNewUsageForm({
                      ...newUsageForm,
                      targetOutput: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Expected units to produce"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={newUsageForm.startTime}
                  onChange={(e) =>
                    setNewUsageForm({
                      ...newUsageForm,
                      startTime: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Items to Use
                </label>
                <button
                  onClick={addUsageItem}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Add Item
                </button>
              </div>
              {newUsageForm.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-end mb-2"
                >
                  <div className="col-span-8">
                    <select
                      value={item.itemId}
                      onChange={(e) =>
                        updateUsageItem(index, "itemId", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select item</option>
                      {availableItems.map((availableItem) => (
                        <option key={availableItem.id} value={availableItem.id}>
                          {availableItem.name} (Stock:{" "}
                          {availableItem.currentStock} {availableItem.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={item.quantityUsed}
                      onChange={(e) =>
                        updateUsageItem(index, "quantityUsed", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Qty"
                      disabled
                    />
                  </div>
                  <div className="col-span-1">
                    {newUsageForm.items.length > 1 && (
                      <button
                        onClick={() => removeUsageItem(index)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={newUsageForm.notes}
                onChange={(e) =>
                  setNewUsageForm({ ...newUsageForm, notes: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Production notes, special instructions, etc."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowNewUsageModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addNewUsage}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Batch
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Usage Card Component
  const UsageCard = ({ usage }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900">{usage.batchNumber}</h4>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowUsageDetails(usage)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => deleteUsage(usage.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        {usage.department} • {usage.supervisor}
      </p>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              usage.status
            )}`}
          >
            {usage.status.charAt(0).toUpperCase() +
              usage.status.slice(1).replace("-", " ")}
          </span>
          {getStatusIcon(usage.status)}
        </div>
        <div className="text-sm font-medium text-gray-900">
          {usage.actualOutput}/{usage.targetOutput} units
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div>
          {usage.startTime} - {usage.endTime || "Ongoing"}
        </div>
        <div>{usage.productionDate}</div>
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
              Daily Usage & Production Management
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search batches..."
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
        {/* Production Overview */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full bg-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Production Overview
              </h2>
            </div>
          </div>

          {/* Production Stats */}
          <div className="grid grid-cols-4 gap-4 pt-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Factory className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">
                  Total Batches
                </span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {totalBatches}
              </span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-500">
                  Active
                </span>
              </div>
              <span className="text-lg font-semibold text-blue-600">
                {activeBatches}
              </span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-500">
                  Completed Today
                </span>
              </div>
              <span className="text-lg font-semibold text-green-600">
                {completedToday}
              </span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-500">
                  Output Today
                </span>
              </div>
              <span className="text-lg font-semibold text-purple-600">
                {totalOutputToday}
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
                <option value="in-progress">In Progress</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={() => setShowNewUsageModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Batch
          </button>
        </div>

        {/* Grid View */}
        {currentView === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map((usage) => (
              <div key={usage.id} className="cursor-pointer">
                <UsageCard usage={usage} />
              </div>
            ))}
            {filteredRecords.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No production batches found.{" "}
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
                <div className="col-span-2">Batch</div>
                <div className="col-span-2">Department</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Output</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Actions</div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredRecords.map((usage) => (
                <div key={usage.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(usage.status)}
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {usage.batchNumber}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {usage.supervisor}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">
                        {usage.department}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          usage.status
                        )}`}
                      >
                        {usage.status.charAt(0).toUpperCase() +
                          usage.status.slice(1).replace("-", " ")}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">
                        {usage.actualOutput}/{usage.targetOutput}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">
                        {usage.productionDate}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowUsageDetails(usage)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteUsage(usage.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredRecords.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-500">
                  No production batches found.{" "}
                  {searchTerm &&
                    `Try adjusting your search for "${searchTerm}".`}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewUsageModal />
      <UsageDetailsModal />
    </div>
  );
};

export default DailyUsageManagement;
