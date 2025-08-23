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
function Materials() {
  return (
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
}

export default Materials;
