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
function DailyReport() {
  return (
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
}

export default DailyReport;
