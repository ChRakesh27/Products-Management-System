import {
  AlertTriangle,
  ArrowRight,
  Box,
  CheckCircle,
  DollarSign,
  Download,
  Factory,
  Gauge,
  Layers,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

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
  const totalDailyProduction =
    productionProcesses[productionProcesses.length - 1]?.dailyOutput || 0;

  const Dashboard = () => (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Daily Production
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalDailyProduction}
              </p>
              <p className="text-sm text-gray-500">pieces</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Factory className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+8% from yesterday</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Overall Efficiency
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {averageEfficiency.toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Gauge className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${averageEfficiency}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Material Inventory
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalMaterialValue.toFixed(0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Box className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-600">
              Daily usage: ${totalDailyUsageValue.toFixed(0)}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quality Rate</p>
              <p className="text-2xl font-bold text-gray-900">97.5%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">Above target (95%)</span>
          </div>
        </div>
      </div>

      {/* Production Flow */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Production Flow - Real Time
        </h3>
        <div className="flex items-center justify-between overflow-x-auto pb-4">
          {productionProcesses.map((process, index) => (
            <div key={process.id} className="flex items-center">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {process.processName}
                  </h4>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      process.efficiency >= 90
                        ? "bg-green-100 text-green-700"
                        : process.efficiency >= 80
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {process.efficiency}%
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Output:</span>
                    <span className="font-medium">
                      {process.currentProduction}/{process.dailyCapacity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (process.currentProduction / process.dailyCapacity) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Workers: {process.workers}</span>
                    <span>Quality: {process.qualityRate}%</span>
                  </div>
                </div>
              </div>
              {index < productionProcesses.length - 1 && (
                <ArrowRight className="w-6 h-6 text-gray-400 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Material Usage Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Daily Material Usage
          </h3>
          <div className="space-y-4">
            {rawMaterials.map((material) => {
              const usagePercentage =
                (material.dailyUsage / material.currentStock) * 100;
              const isLowStock = material.currentStock <= material.reorderLevel;

              return (
                <div key={material.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {material.name}
                    </h4>
                    {isLowStock && (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Current Stock:</span>
                      <span
                        className={`ml-2 font-medium ${
                          isLowStock ? "text-red-600" : "text-gray-900"
                        }`}
                      >
                        {material.currentStock} {material.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Daily Usage:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {material.dailyUsage} {material.unit}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          isLowStock ? "bg-red-500" : "bg-blue-600"
                        }`}
                        style={{
                          width: `${Math.min(usagePercentage * 10, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Production Efficiency Trends
          </h3>
          <div className="space-y-4">
            {productionProcesses.map((process) => (
              <div
                key={process.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      process.efficiency >= 90
                        ? "bg-green-500"
                        : process.efficiency >= 80
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <span className="font-medium text-gray-900">
                    {process.processName}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {process.efficiency}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {process.currentProduction} units/day
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const MaterialsView = () => (
    <div className="space-y-6">
      {/* Materials Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Materials
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {rawMaterials.length}
              </p>
            </div>
            <Layers className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Low Stock Items
              </p>
              <p className="text-2xl font-bold text-red-600">
                {
                  rawMaterials.filter((m) => m.currentStock <= m.reorderLevel)
                    .length
                }
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600">
                ${totalMaterialValue.toFixed(0)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Raw Materials Inventory
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Material
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Current Stock
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Daily Usage
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Days Left
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Cost/Unit
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {rawMaterials.map((material) => {
                  const daysLeft = Math.floor(
                    material.currentStock / material.dailyUsage
                  );
                  const isLowStock =
                    material.currentStock <= material.reorderLevel;

                  return (
                    <tr
                      key={material.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {material.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {material.supplierName}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {material.category}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span
                          className={`font-medium ${
                            isLowStock ? "text-red-600" : "text-gray-900"
                          }`}
                        >
                          {material.currentStock} {material.unit}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-900">
                        {material.dailyUsage} {material.unit}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span
                          className={`font-medium ${
                            daysLeft <= 7
                              ? "text-red-600"
                              : daysLeft <= 14
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {daysLeft} days
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-900">
                        ${material.costPerUnit.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            isLowStock
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {isLowStock ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const ProcessView = () => (
    <div className="space-y-6">
      {/* Process Flow Diagram */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Manufacturing Process Flow
        </h3>
        <div className="space-y-6">
          {productionProcesses.map((process, index) => (
            <div
              key={process.id}
              className="bg-gray-50 rounded-lg p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {process.stage}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {process.processName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Lead: {process.processLead}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Efficiency</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {process.efficiency}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Output</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {process.currentProduction}/{process.dailyCapacity}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Input Materials */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">
                    Input Materials
                  </h5>
                  <div className="space-y-2">
                    {process.inputMaterials.map((input, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded border border-gray-200"
                      >
                        <div className="font-medium text-gray-900">
                          {input.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {input.requiredPerUnit} {input.unit} per unit
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Process Details */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">
                    Process Details
                  </h5>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Workers:</span>
                      <span className="font-medium">{process.workers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Machines:</span>
                      <span className="font-medium">
                        {process.machinesUsed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time/Unit:</span>
                      <span className="font-medium">
                        {process.avgTimePerUnit} min
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quality Rate:</span>
                      <span className="font-medium">
                        {process.qualityRate}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Output Materials */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">
                    Output Materials
                  </h5>
                  <div className="space-y-2">
                    {process.outputMaterials.map((output, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded border border-gray-200"
                      >
                        <div className="font-medium text-gray-900">
                          {output.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {output.quantityPerUnit} {output.unit} per unit
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Daily Progress</span>
                  <span>
                    {process.currentProduction} / {process.dailyCapacity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (process.currentProduction / process.dailyCapacity) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const DailyReportView = () => (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Daily Production Report
          </h3>
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Today's Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-700">
              Total Production
            </div>
            <div className="text-2xl font-bold text-blue-900">120 pieces</div>
            <div className="text-sm text-blue-600">+4.3% vs yesterday</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm font-medium text-green-700">Efficiency</div>
            <div className="text-2xl font-bold text-green-900">91.2%</div>
            <div className="text-sm text-green-600">+2.1% vs yesterday</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="text-sm font-medium text-orange-700">
              Material Usage
            </div>
            <div className="text-2xl font-bold text-orange-900">$1,247</div>
            <div className="text-sm text-orange-600">$10.39 per unit</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-sm font-medium text-purple-700">
              Quality Rate
            </div>
            <div className="text-2xl font-bold text-purple-900">97.5%</div>
            <div className="text-sm text-purple-600">Target: 95%</div>
          </div>
        </div>

        {/* Process Performance */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            Process Performance
          </h4>
          <div className="space-y-3">
            {Object.entries(dailyProduction[0].processes).map(
              ([processName, data]) => (
                <div
                  key={processName}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="capitalize font-medium text-gray-900">
                      {processName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {data.actual} / {data.planned} units
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${data.efficiency}%` }}
                      ></div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 w-12">
                      {data.efficiency}%
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Material Usage */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            Material Usage Today
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(dailyProduction[0].materialUsage).map(
              ([material, usage]) => {
                const materialData = rawMaterials.find((m) =>
                  m.name.toLowerCase().includes(
                    material
                      .toLowerCase()
                      .replace(/([A-Z])/g, " $1")
                      .trim()
                  )
                );
                return (
                  <div key={material} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {material.replace(/([A-Z])/g, " $1").trim()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Used: {usage} {materialData?.unit || "units"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          $
                          {materialData
                            ? (usage * materialData.costPerUnit).toFixed(2)
                            : "0.00"}
                        </div>
                        <div className="text-sm text-gray-600">
                          ${materialData?.costPerUnit.toFixed(2) || "0.00"}/
                          {materialData?.unit || "unit"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Workforce Details */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">
            Workforce Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Workers Present</div>
              <div className="text-xl font-semibold text-gray-900">
                {dailyProduction[0].workers.present} /{" "}
                {dailyProduction[0].workers.total}
              </div>
              <div className="text-sm text-gray-600">
                Attendance:{" "}
                {(
                  (dailyProduction[0].workers.present /
                    dailyProduction[0].workers.total) *
                  100
                ).toFixed(1)}
                %
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Overtime Workers</div>
              <div className="text-xl font-semibold text-gray-900">
                {dailyProduction[0].workers.overtime}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Shift Performance</div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Morning:</span>
                  <span>
                    {dailyProduction[0].shift.morning.production} units
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Evening:</span>
                  <span>
                    {dailyProduction[0].shift.evening.production} units
                  </span>
                </div>
              </div>
            </div>
          </div>
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
              <button
                onClick={() => setCurrentView("process")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "process"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Process Flow
              </button>
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
        {currentView === "materials" && <MaterialsView />}
        {currentView === "process" && <ProcessView />}
        {currentView === "daily" && <DailyReportView />}
      </div>
    </div>
  );
};

export default Production;
