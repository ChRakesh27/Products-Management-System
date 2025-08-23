import { CheckCircle, Target } from "lucide-react";
import { useState } from "react";
function QualityControl() {
  const [qualityData, setQualityData] = useState({
    date: new Date().toISOString().split("T")[0],
    stages: {
      cutting: {
        inspected: "",
        passed: "",
        failed: "",
        reworked: "",
        defectTypes: "",
        inspector: "",
        notes: "",
      },
      sewing: {
        inspected: "",
        passed: "",
        failed: "",
        reworked: "",
        defectTypes: "",
        inspector: "",
        notes: "",
      },
      finishing: {
        inspected: "",
        passed: "",
        failed: "",
        reworked: "",
        defectTypes: "",
        inspector: "",
        notes: "",
      },
      final: {
        inspected: "",
        passed: "",
        failed: "",
        reworked: "",
        defectTypes: "",
        inspector: "",
        notes: "",
      },
    },
  });
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Quality Control Data Entry
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={qualityData.date}
              onChange={(e) =>
                setQualityData({ ...qualityData, date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(qualityData.stages).map(([stageName, stageData]) => (
            <div
              key={stageName}
              className="bg-gray-50 rounded-lg p-6 border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-purple-600" />
                <h4 className="text-lg font-medium text-gray-900 capitalize">
                  {stageName === "final"
                    ? "Final Inspection"
                    : `${stageName} Quality Check`}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Items Inspected *
                  </label>
                  <input
                    type="number"
                    value={stageData.inspected}
                    onChange={(e) =>
                      setQualityData({
                        ...qualityData,
                        stages: {
                          ...qualityData.stages,
                          [stageName]: {
                            ...stageData,
                            inspected: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passed *
                  </label>
                  <input
                    type="number"
                    value={stageData.passed}
                    onChange={(e) =>
                      setQualityData({
                        ...qualityData,
                        stages: {
                          ...qualityData.stages,
                          [stageName]: { ...stageData, passed: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Failed
                  </label>
                  <input
                    type="number"
                    value={stageData.failed}
                    onChange={(e) =>
                      setQualityData({
                        ...qualityData,
                        stages: {
                          ...qualityData.stages,
                          [stageName]: { ...stageData, failed: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reworked
                  </label>
                  <input
                    type="number"
                    value={stageData.reworked}
                    onChange={(e) =>
                      setQualityData({
                        ...qualityData,
                        stages: {
                          ...qualityData.stages,
                          [stageName]: {
                            ...stageData,
                            reworked: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inspector Name
                  </label>
                  <input
                    type="text"
                    value={stageData.inspector}
                    onChange={(e) =>
                      setQualityData({
                        ...qualityData,
                        stages: {
                          ...qualityData.stages,
                          [stageName]: {
                            ...stageData,
                            inspector: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Inspector name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Common Defect Types
                  </label>
                  <input
                    type="text"
                    value={stageData.defectTypes}
                    onChange={(e) =>
                      setQualityData({
                        ...qualityData,
                        stages: {
                          ...qualityData.stages,
                          [stageName]: {
                            ...stageData,
                            defectTypes: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., stitching issues, color mismatch"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quality Notes
                </label>
                <textarea
                  value={stageData.notes}
                  onChange={(e) =>
                    setQualityData({
                      ...qualityData,
                      stages: {
                        ...qualityData.stages,
                        [stageName]: { ...stageData, notes: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Quality issues, corrective actions taken, etc."
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QualityControl;
