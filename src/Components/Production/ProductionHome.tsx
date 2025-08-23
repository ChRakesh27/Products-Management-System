import { Factory, RefreshCw } from "lucide-react";
import { useState } from "react";
import DailyReport from "./DailyReport";
import Dashboard from "./Dashboard";
import Materials from "./Materials";
import ProcessFlow from "./ProcessFlow";

const Production = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Raw Materials Data
  const [rawMaterials, setRawMaterials] = useState([
    {
      id: 1,
      name: "Cotton Fabric",
      category: "Primary Material",
      currentStock: 2450,
      unit: "yards",
      dailyUsage: 180,
      weeklyUsage: 1260,
      monthlyUsage: 5400,
      reorderLevel: 500,
      supplierName: "TextileCorp Ltd",
      costPerUnit: 8.5,
      qualityGrade: "A",
      lastUpdated: new Date().toISOString(),
      usageHistory: [
        { date: "2024-07-30", used: 180, remaining: 2450 },
        { date: "2024-07-29", used: 175, remaining: 2630 },
        { date: "2024-07-28", used: 190, remaining: 2805 },
        { date: "2024-07-27", used: 165, remaining: 2995 },
        { date: "2024-07-26", used: 200, remaining: 3160 },
      ],
    },
    {
      id: 2,
      name: "Polyester Thread",
      category: "Secondary Material",
      currentStock: 850,
      unit: "spools",
      dailyUsage: 25,
      weeklyUsage: 175,
      monthlyUsage: 750,
      reorderLevel: 100,
      supplierName: "ThreadMaster Inc",
      costPerUnit: 3.2,
      qualityGrade: "A+",
      lastUpdated: new Date().toISOString(),
      usageHistory: [
        { date: "2024-07-30", used: 25, remaining: 850 },
        { date: "2024-07-29", used: 22, remaining: 875 },
        { date: "2024-07-28", used: 28, remaining: 897 },
        { date: "2024-07-27", used: 24, remaining: 925 },
        { date: "2024-07-26", used: 30, remaining: 949 },
      ],
    },
    {
      id: 3,
      name: "Buttons (Plastic)",
      category: "Components",
      currentStock: 15000,
      unit: "pieces",
      dailyUsage: 450,
      weeklyUsage: 3150,
      monthlyUsage: 13500,
      reorderLevel: 2000,
      supplierName: "ButtonWorks Co",
      costPerUnit: 0.15,
      qualityGrade: "B+",
      lastUpdated: new Date().toISOString(),
      usageHistory: [
        { date: "2024-07-30", used: 450, remaining: 15000 },
        { date: "2024-07-29", used: 420, remaining: 15450 },
        { date: "2024-07-28", used: 480, remaining: 15870 },
        { date: "2024-07-27", used: 390, remaining: 16350 },
        { date: "2024-07-26", used: 510, remaining: 16740 },
      ],
    },
    {
      id: 4,
      name: "Zippers",
      category: "Components",
      currentStock: 1200,
      unit: "pieces",
      dailyUsage: 35,
      weeklyUsage: 245,
      monthlyUsage: 1050,
      reorderLevel: 150,
      supplierName: "ZipTech Solutions",
      costPerUnit: 1.8,
      qualityGrade: "A",
      lastUpdated: new Date().toISOString(),
      usageHistory: [
        { date: "2024-07-30", used: 35, remaining: 1200 },
        { date: "2024-07-29", used: 32, remaining: 1235 },
        { date: "2024-07-28", used: 38, remaining: 1267 },
        { date: "2024-07-27", used: 30, remaining: 1305 },
        { date: "2024-07-26", used: 40, remaining: 1335 },
      ],
    },
  ]);

  // Production Processes Data
  const [productionProcesses, setProductionProcesses] = useState([
    {
      id: 1,
      processName: "Cutting",
      stage: 1,
      inputMaterials: [
        {
          materialId: 1,
          name: "Cotton Fabric",
          requiredPerUnit: 2.5,
          unit: "yards",
        },
      ],
      outputMaterials: [
        { name: "Cut Pieces", quantityPerUnit: 1, unit: "sets" },
      ],
      dailyCapacity: 200,
      currentProduction: 180,
      efficiency: 90,
      qualityRate: 98,
      workers: 3,
      machinesUsed: 2,
      avgTimePerUnit: 15, // minutes
      dailyOutput: 180,
      weeklyOutput: 1260,
      monthlyOutput: 5400,
      processLead: "John Smith",
      status: "active",
    },
    {
      id: 2,
      processName: "Sewing",
      stage: 2,
      inputMaterials: [
        { materialId: 1, name: "Cut Pieces", requiredPerUnit: 1, unit: "sets" },
        {
          materialId: 2,
          name: "Polyester Thread",
          requiredPerUnit: 0.15,
          unit: "spools",
        },
        { materialId: 3, name: "Buttons", requiredPerUnit: 6, unit: "pieces" },
      ],
      outputMaterials: [
        { name: "Sewn Garments", quantityPerUnit: 1, unit: "pieces" },
      ],
      dailyCapacity: 150,
      currentProduction: 140,
      efficiency: 93,
      qualityRate: 96,
      workers: 8,
      machinesUsed: 6,
      avgTimePerUnit: 45, // minutes
      dailyOutput: 140,
      weeklyOutput: 980,
      monthlyOutput: 4200,
      processLead: "Sarah Johnson",
      status: "active",
    },
    {
      id: 3,
      processName: "Finishing",
      stage: 3,
      inputMaterials: [
        {
          materialId: 1,
          name: "Sewn Garments",
          requiredPerUnit: 1,
          unit: "pieces",
        },
      ],
      outputMaterials: [
        { name: "Finished Garments", quantityPerUnit: 1, unit: "pieces" },
      ],
      dailyCapacity: 160,
      currentProduction: 130,
      efficiency: 81,
      qualityRate: 99,
      workers: 4,
      machinesUsed: 3,
      avgTimePerUnit: 30, // minutes
      dailyOutput: 130,
      weeklyOutput: 910,
      monthlyOutput: 3900,
      processLead: "Mike Davis",
      status: "active",
    },
    {
      id: 4,
      processName: "Quality Control",
      stage: 4,
      inputMaterials: [
        {
          materialId: 1,
          name: "Finished Garments",
          requiredPerUnit: 1,
          unit: "pieces",
        },
      ],
      outputMaterials: [
        { name: "QC Approved Garments", quantityPerUnit: 0.97, unit: "pieces" },
        { name: "Rejected Items", quantityPerUnit: 0.03, unit: "pieces" },
      ],
      dailyCapacity: 140,
      currentProduction: 125,
      efficiency: 89,
      qualityRate: 97,
      workers: 2,
      machinesUsed: 1,
      avgTimePerUnit: 10, // minutes
      dailyOutput: 125,
      weeklyOutput: 875,
      monthlyOutput: 3750,
      processLead: "Emily Chen",
      status: "active",
    },
    {
      id: 5,
      processName: "Packaging",
      stage: 5,
      inputMaterials: [
        {
          materialId: 1,
          name: "QC Approved Garments",
          requiredPerUnit: 1,
          unit: "pieces",
        },
      ],
      outputMaterials: [
        { name: "Packaged Products", quantityPerUnit: 1, unit: "pieces" },
      ],
      dailyCapacity: 130,
      currentProduction: 120,
      efficiency: 92,
      qualityRate: 100,
      workers: 3,
      machinesUsed: 2,
      avgTimePerUnit: 8, // minutes
      dailyOutput: 120,
      weeklyOutput: 840,
      monthlyOutput: 3600,
      processLead: "David Wilson",
      status: "active",
    },
  ]);

  // Daily Production Data
  const [dailyProduction, setDailyProduction] = useState([
    {
      date: "2024-07-30",
      totalProduction: 120,
      processes: {
        cutting: { planned: 200, actual: 180, efficiency: 90 },
        sewing: { planned: 150, actual: 140, efficiency: 93 },
        finishing: { planned: 160, actual: 130, efficiency: 81 },
        quality: { planned: 140, actual: 125, efficiency: 89 },
        packaging: { planned: 130, actual: 120, efficiency: 92 },
      },
      materialUsage: {
        cottonFabric: 450, // yards
        thread: 21, // spools
        buttons: 720, // pieces
        zippers: 30, // pieces
      },
      qualityMetrics: {
        passRate: 97.5,
        reworkRate: 2.0,
        rejectRate: 0.5,
      },
      workers: {
        present: 18,
        total: 20,
        overtime: 2,
      },
      shift: {
        morning: { hours: 8, production: 65 },
        evening: { hours: 8, production: 55 },
      },
    },
    {
      date: "2024-07-29",
      totalProduction: 115,
      processes: {
        cutting: { planned: 200, actual: 175, efficiency: 87.5 },
        sewing: { planned: 150, actual: 135, efficiency: 90 },
        finishing: { planned: 160, actual: 125, efficiency: 78 },
        quality: { planned: 140, actual: 120, efficiency: 86 },
        packaging: { planned: 130, actual: 115, efficiency: 88 },
      },
      materialUsage: {
        cottonFabric: 437, // yards
        thread: 20, // spools
        buttons: 690, // pieces
        zippers: 28, // pieces
      },
      qualityMetrics: {
        passRate: 96.8,
        reworkRate: 2.5,
        rejectRate: 0.7,
      },
      workers: {
        present: 19,
        total: 20,
        overtime: 1,
      },
      shift: {
        morning: { hours: 8, production: 62 },
        evening: { hours: 8, production: 53 },
      },
    },
  ]);

  // Finished Goods Data
  const [finishedGoods, setFinishedGoods] = useState([
    {
      id: 1,
      productName: "Summer Casual Shirt",
      style: "SC-001",
      size: "M",
      color: "Navy Blue",
      quantity: 150,
      qualityGrade: "A",
      productionDate: "2024-07-30",
      batchNumber: "B-2024-001",
      status: "ready",
      unitCost: 12.5,
      sellingPrice: 25.0,
      warehouse: "WH-A",
      expiryDate: null,
    },
    {
      id: 2,
      productName: "Summer Casual Shirt",
      style: "SC-001",
      size: "L",
      color: "Navy Blue",
      quantity: 120,
      qualityGrade: "A",
      productionDate: "2024-07-29",
      batchNumber: "B-2024-002",
      status: "shipped",
      unitCost: 12.5,
      sellingPrice: 25.0,
      warehouse: "WH-A",
      expiryDate: null,
    },
  ]);

  // Calculate metrics
  const totalMaterialValue = rawMaterials.reduce(
    (sum, material) => sum + material.currentStock * material.costPerUnit,
    0
  );

  const totalDailyUsageValue = rawMaterials.reduce(
    (sum, material) => sum + material.dailyUsage * material.costPerUnit,
    0
  );

  const averageEfficiency =
    productionProcesses.reduce((sum, process) => sum + process.efficiency, 0) /
    productionProcesses.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Factory className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manufacturing Management
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentView("dashboard")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "dashboard"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView("materials")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "materials"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Materials
              </button>
              {/* <button
                onClick={() => setCurrentView("process")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "process"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Process Flow
              </button> */}
              <button
                onClick={() => setCurrentView("daily")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "daily"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Daily Report
              </button>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors">
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 py-6">
        {currentView === "dashboard" && <Dashboard />}
        {currentView === "materials" && <Materials />}
        {currentView === "process" && <ProcessFlow />}
        {currentView === "daily" && <DailyReport />}
      </div>
    </div>
  );
};

export default Production;
