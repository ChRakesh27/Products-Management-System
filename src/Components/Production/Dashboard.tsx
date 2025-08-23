import {
  AlertTriangle,
  ArrowRight,
  Box,
  CheckCircle,
  Factory,
  Gauge,
  TrendingUp,
} from "lucide-react";
function Dashboard({ productionProcesses }) {
  const totalDailyProduction =
    productionProcesses[productionProcesses.length - 1]?.dailyOutput || 0;

  return (
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
              <p className="text-2xl font-bold text-gray-900">{0}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Gauge className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${0}%` }}
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
}

export default Dashboard;
