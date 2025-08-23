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
function ProcessFlow() {
  return (
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
}

export default ProcessFlow;
