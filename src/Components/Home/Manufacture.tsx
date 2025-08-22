import {
  Box,
  CheckCircle,
  Clipboard,
  Download,
  Factory,
  Flag,
  Info,
  Layers,
  Package,
  Plus,
  RefreshCw,
  Save,
  Scissors,
  Settings,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";

const Manufacture = () => {
  const [currentTab, setCurrentTab] = useState("production");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Production Data Form State
  const [productionData, setProductionData] = useState({
    date: new Date().toISOString().split("T")[0],
    shift: "morning",
    processes: {
      cutting: {
        planned: "",
        actual: "",
        workers: "",
        machines: "",
        startTime: "",
        endTime: "",
        supervisor: "",
        remarks: "",
      },
      sewing: {
        planned: "",
        actual: "",
        workers: "",
        machines: "",
        startTime: "",
        endTime: "",
        supervisor: "",
        remarks: "",
      },
      finishing: {
        planned: "",
        actual: "",
        workers: "",
        machines: "",
        startTime: "",
        endTime: "",
        supervisor: "",
        remarks: "",
      },
      quality: {
        planned: "",
        actual: "",
        workers: "",
        machines: "",
        startTime: "",
        endTime: "",
        supervisor: "",
        remarks: "",
      },
      packaging: {
        planned: "",
        actual: "",
        workers: "",
        machines: "",
        startTime: "",
        endTime: "",
        supervisor: "",
        remarks: "",
      },
    },
  });

  // Material Usage Form State
  const [materialData, setMaterialData] = useState({
    date: new Date().toISOString().split("T")[0],
    materials: [
      {
        name: "Cotton Fabric",
        used: "",
        wastage: "",
        unit: "yards",
        batchNumber: "",
        notes: "",
      },
      {
        name: "Polyester Thread",
        used: "",
        wastage: "",
        unit: "spools",
        batchNumber: "",
        notes: "",
      },
      {
        name: "Buttons",
        used: "",
        wastage: "",
        unit: "pieces",
        batchNumber: "",
        notes: "",
      },
      {
        name: "Zippers",
        used: "",
        wastage: "",
        unit: "pieces",
        batchNumber: "",
        notes: "",
      },
    ],
  });

  // Quality Control Form State
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

  // Inventory Adjustment Form State
  const [inventoryData, setInventoryData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "receipt", // receipt, adjustment, transfer
    materials: [
      {
        name: "",
        quantity: "",
        unit: "",
        reason: "",
        supplierLot: "",
        cost: "",
        notes: "",
      },
    ],
  });

  // Workforce Data Form State
  const [workforceData, setWorkforceData] = useState({
    date: new Date().toISOString().split("T")[0],
    shift: "morning",
    attendance: {
      totalWorkers: "",
      present: "",
      absent: "",
      overtime: "",
      newJoiners: "",
      trainees: "",
    },
    departments: {
      cutting: { present: "", overtime: "", productivity: "" },
      sewing: { present: "", overtime: "", productivity: "" },
      finishing: { present: "", overtime: "", productivity: "" },
      quality: { present: "", overtime: "", productivity: "" },
      packaging: { present: "", overtime: "", productivity: "" },
      maintenance: { present: "", overtime: "", productivity: "" },
    },
  });

  // Machine Data Form State
  const [machineData, setMachineData] = useState({
    date: new Date().toISOString().split("T")[0],
    machines: [
      {
        name: "",
        type: "",
        runningHours: "",
        downtime: "",
        maintenanceType: "",
        efficiency: "",
        operator: "",
        notes: "",
      },
    ],
  });

  const addMaterialRow = (section) => {
    if (section === "inventory") {
      setInventoryData({
        ...inventoryData,
        materials: [
          ...inventoryData.materials,
          {
            name: "",
            quantity: "",
            unit: "",
            reason: "",
            supplierLot: "",
            cost: "",
            notes: "",
          },
        ],
      });
    }
  };

  const addMachineRow = () => {
    setMachineData({
      ...machineData,
      machines: [
        ...machineData.machines,
        {
          name: "",
          type: "",
          runningHours: "",
          downtime: "",
          maintenanceType: "",
          efficiency: "",
          operator: "",
          notes: "",
        },
      ],
    });
  };

  const removeMaterialRow = (section, index) => {
    if (section === "inventory") {
      setInventoryData({
        ...inventoryData,
        materials: inventoryData.materials.filter((_, i) => i !== index),
      });
    }
  };

  const removeMachineRow = (index) => {
    setMachineData({
      ...machineData,
      machines: machineData.machines.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Data submitted successfully!");
    }, 2000);
  };

  const ProductionDataTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <Factory className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Daily Production Data Entry
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={productionData.date}
              onChange={(e) =>
                setProductionData({ ...productionData, date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shift *
            </label>
            <select
              value={productionData.shift}
              onChange={(e) =>
                setProductionData({ ...productionData, shift: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="morning">Morning Shift (6 AM - 2 PM)</option>
              <option value="evening">Evening Shift (2 PM - 10 PM)</option>
              <option value="night">Night Shift (10 PM - 6 AM)</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(productionData.processes).map(
            ([processName, processData]) => (
              <div
                key={processName}
                className="bg-gray-50 rounded-lg p-6 border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  {processName === "cutting" && (
                    <Scissors className="w-5 h-5 text-orange-600" />
                  )}
                  {processName === "sewing" && (
                    <Settings className="w-5 h-5 text-blue-600" />
                  )}
                  {processName === "finishing" && (
                    <Flag className="w-5 h-5 text-purple-600" />
                  )}
                  {processName === "quality" && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {processName === "packaging" && (
                    <Package className="w-5 h-5 text-indigo-600" />
                  )}
                  <h4 className="text-lg font-medium text-gray-900 capitalize">
                    {processName}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Planned Output *
                    </label>
                    <input
                      type="number"
                      value={processData.planned}
                      onChange={(e) =>
                        setProductionData({
                          ...productionData,
                          processes: {
                            ...productionData.processes,
                            [processName]: {
                              ...processData,
                              planned: e.target.value,
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
                      Actual Output *
                    </label>
                    <input
                      type="number"
                      value={processData.actual}
                      onChange={(e) =>
                        setProductionData({
                          ...productionData,
                          processes: {
                            ...productionData.processes,
                            [processName]: {
                              ...processData,
                              actual: e.target.value,
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
                      Workers *
                    </label>
                    <input
                      type="number"
                      value={processData.workers}
                      onChange={(e) =>
                        setProductionData({
                          ...productionData,
                          processes: {
                            ...productionData.processes,
                            [processName]: {
                              ...processData,
                              workers: e.target.value,
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
                      Machines Used
                    </label>
                    <input
                      type="number"
                      value={processData.machines}
                      onChange={(e) =>
                        setProductionData({
                          ...productionData,
                          processes: {
                            ...productionData.processes,
                            [processName]: {
                              ...processData,
                              machines: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={processData.startTime}
                      onChange={(e) =>
                        setProductionData({
                          ...productionData,
                          processes: {
                            ...productionData.processes,
                            [processName]: {
                              ...processData,
                              startTime: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={processData.endTime}
                      onChange={(e) =>
                        setProductionData({
                          ...productionData,
                          processes: {
                            ...productionData.processes,
                            [processName]: {
                              ...processData,
                              endTime: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supervisor
                    </label>
                    <input
                      type="text"
                      value={processData.supervisor}
                      onChange={(e) =>
                        setProductionData({
                          ...productionData,
                          processes: {
                            ...productionData.processes,
                            [processName]: {
                              ...processData,
                              supervisor: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Supervisor name"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    value={processData.remarks}
                    onChange={(e) =>
                      setProductionData({
                        ...productionData,
                        processes: {
                          ...productionData.processes,
                          [processName]: {
                            ...processData,
                            remarks: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Any issues, delays, or special notes..."
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );

  const MaterialUsageTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <Box className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Daily Material Usage Entry
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={materialData.date}
              onChange={(e) =>
                setMaterialData({ ...materialData, date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">
            Material Consumption
          </h4>
          {materialData.materials.map((material, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-6 border border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material Name *
                  </label>
                  <input
                    type="text"
                    value={material.name}
                    onChange={(e) => {
                      const updatedMaterials = [...materialData.materials];
                      updatedMaterials[index].name = e.target.value;
                      setMaterialData({
                        ...materialData,
                        materials: updatedMaterials,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Material name"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity Used *
                  </label>
                  <input
                    type="number"
                    value={material.used}
                    onChange={(e) => {
                      const updatedMaterials = [...materialData.materials];
                      updatedMaterials[index].used = e.target.value;
                      setMaterialData({
                        ...materialData,
                        materials: updatedMaterials,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wastage
                  </label>
                  <input
                    type="number"
                    value={material.wastage}
                    onChange={(e) => {
                      const updatedMaterials = [...materialData.materials];
                      updatedMaterials[index].wastage = e.target.value;
                      setMaterialData({
                        ...materialData,
                        materials: updatedMaterials,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={material.unit}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    value={material.batchNumber}
                    onChange={(e) => {
                      const updatedMaterials = [...materialData.materials];
                      updatedMaterials[index].batchNumber = e.target.value;
                      setMaterialData({
                        ...materialData,
                        materials: updatedMaterials,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Batch #"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={material.notes}
                    onChange={(e) => {
                      const updatedMaterials = [...materialData.materials];
                      updatedMaterials[index].notes = e.target.value;
                      setMaterialData({
                        ...materialData,
                        materials: updatedMaterials,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notes"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const QualityControlTab = () => (
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

  const InventoryTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <Layers className="w-6 h-6 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Inventory Adjustments
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={inventoryData.date}
              onChange={(e) =>
                setInventoryData({ ...inventoryData, date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type *
            </label>
            <select
              value={inventoryData.type}
              onChange={(e) =>
                setInventoryData({ ...inventoryData, type: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="receipt">Material Receipt</option>
              <option value="adjustment">Stock Adjustment</option>
              <option value="transfer">Internal Transfer</option>
              <option value="return">Return to Supplier</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">
              Material Details
            </h4>
            <button
              type="button"
              onClick={() => addMaterialRow("inventory")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Material
            </button>
          </div>

          {inventoryData.materials.map((material, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-medium text-gray-900">
                  Material #{index + 1}
                </h5>
                {inventoryData.materials.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMaterialRow("inventory", index)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material Name *
                  </label>
                  <select
                    value={material.name}
                    onChange={(e) => {
                      const updatedMaterials = [...inventoryData.materials];
                      updatedMaterials[index].name = e.target.value;
                      setInventoryData({
                        ...inventoryData,
                        materials: updatedMaterials,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Material</option>
                    <option value="Cotton Fabric">Cotton Fabric</option>
                    <option value="Polyester Thread">Polyester Thread</option>
                    <option value="Buttons">Buttons</option>
                    <option value="Zippers">Zippers</option>
                    <option value="Labels">Labels</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={material.quantity}
                    onChange={(e) => {
                      const updatedMaterials = [...inventoryData.materials];
                      updatedMaterials[index].quantity = e.target.value;
                      setInventoryData({
                        ...inventoryData,
                        materials: updatedMaterials,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={material.unit}
                    onChange={(e) => {
                      const updatedMaterials = [...inventoryData.materials];
                      updatedMaterials[index].unit = e.target.value;
                      setInventoryData({
                        ...inventoryData,
                        materials: updatedMaterials,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unit</option>
                    <option value="yards">Yards</option>
                    <option value="meters">Meters</option>
                    <option value="pieces">Pieces</option>
                    <option value="spools">Spools</option>
                    <option value="kg">Kilograms</option>
                    <option value="rolls">Rolls</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier/Lot
                  </label>
                  <input
                    type="text"
                    value={material.supplierLot}
                    onChange={(e) => {
                      const updatedMaterials = [...inventoryData.materials];
                      updatedMaterials[index].supplierLot = e.target.value;
                      setInventoryData({
                        ...inventoryData,
                        materials: updatedMaterials,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Supplier/Lot #"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Cost
                  </label>
                  <input
                    type="number"
                    value={material.cost}
                    onChange={(e) => {
                      const updatedMaterials = [...inventoryData.materials];
                      updatedMaterials[index].cost = e.target.value;
                      setInventoryData({
                        ...inventoryData,
                        materials: updatedMaterials,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <select
                    value={material.reason}
                    onChange={(e) => {
                      const updatedMaterials = [...inventoryData.materials];
                      updatedMaterials[index].reason = e.target.value;
                      setInventoryData({
                        ...inventoryData,
                        materials: updatedMaterials,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Reason</option>
                    <option value="purchase">New Purchase</option>
                    <option value="correction">Stock Correction</option>
                    <option value="damage">Damage/Loss</option>
                    <option value="return">Return</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={material.notes}
                    onChange={(e) => {
                      const updatedMaterials = [...inventoryData.materials];
                      updatedMaterials[index].notes = e.target.value;
                      setInventoryData({
                        ...inventoryData,
                        materials: updatedMaterials,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const WorkforceTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Workforce Data Entry
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={workforceData.date}
              onChange={(e) =>
                setWorkforceData({ ...workforceData, date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shift *
            </label>
            <select
              value={workforceData.shift}
              onChange={(e) =>
                setWorkforceData({ ...workforceData, shift: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="morning">Morning Shift</option>
              <option value="evening">Evening Shift</option>
              <option value="night">Night Shift</option>
            </select>
          </div>
        </div>

        {/* Overall Attendance */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Overall Attendance
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Workers
              </label>
              <input
                type="number"
                value={workforceData.attendance.totalWorkers}
                onChange={(e) =>
                  setWorkforceData({
                    ...workforceData,
                    attendance: {
                      ...workforceData.attendance,
                      totalWorkers: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Present
              </label>
              <input
                type="number"
                value={workforceData.attendance.present}
                onChange={(e) =>
                  setWorkforceData({
                    ...workforceData,
                    attendance: {
                      ...workforceData.attendance,
                      present: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Absent
              </label>
              <input
                type="number"
                value={workforceData.attendance.absent}
                onChange={(e) =>
                  setWorkforceData({
                    ...workforceData,
                    attendance: {
                      ...workforceData.attendance,
                      absent: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overtime
              </label>
              <input
                type="number"
                value={workforceData.attendance.overtime}
                onChange={(e) =>
                  setWorkforceData({
                    ...workforceData,
                    attendance: {
                      ...workforceData.attendance,
                      overtime: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Joiners
              </label>
              <input
                type="number"
                value={workforceData.attendance.newJoiners}
                onChange={(e) =>
                  setWorkforceData({
                    ...workforceData,
                    attendance: {
                      ...workforceData.attendance,
                      newJoiners: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trainees
              </label>
              <input
                type="number"
                value={workforceData.attendance.trainees}
                onChange={(e) =>
                  setWorkforceData({
                    ...workforceData,
                    attendance: {
                      ...workforceData.attendance,
                      trainees: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Department-wise Data */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">
            Department-wise Data
          </h4>
          {Object.entries(workforceData.departments).map(
            ([deptName, deptData]) => (
              <div
                key={deptName}
                className="bg-gray-50 rounded-lg p-6 border border-gray-200"
              >
                <h5 className="font-medium text-gray-900 capitalize mb-4">
                  {deptName}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Present Workers
                    </label>
                    <input
                      type="number"
                      value={deptData.present}
                      onChange={(e) =>
                        setWorkforceData({
                          ...workforceData,
                          departments: {
                            ...workforceData.departments,
                            [deptName]: {
                              ...deptData,
                              present: e.target.value,
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
                      Overtime Hours
                    </label>
                    <input
                      type="number"
                      value={deptData.overtime}
                      onChange={(e) =>
                        setWorkforceData({
                          ...workforceData,
                          departments: {
                            ...workforceData.departments,
                            [deptName]: {
                              ...deptData,
                              overtime: e.target.value,
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
                      Productivity %
                    </label>
                    <input
                      type="number"
                      value={deptData.productivity}
                      onChange={(e) =>
                        setWorkforceData({
                          ...workforceData,
                          departments: {
                            ...workforceData.departments,
                            [deptName]: {
                              ...deptData,
                              productivity: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );

  const MachineTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Machine Performance Data
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={machineData.date}
              onChange={(e) =>
                setMachineData({ ...machineData, date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">
              Machine Details
            </h4>
            <button
              type="button"
              onClick={addMachineRow}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Machine
            </button>
          </div>

          {machineData.machines.map((machine, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-medium text-gray-900">
                  Machine #{index + 1}
                </h5>
                {machineData.machines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMachineRow(index)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Machine Name *
                  </label>
                  <input
                    type="text"
                    value={machine.name}
                    onChange={(e) => {
                      const updatedMachines = [...machineData.machines];
                      updatedMachines[index].name = e.target.value;
                      setMachineData({
                        ...machineData,
                        machines: updatedMachines,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Machine ID/Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={machine.type}
                    onChange={(e) => {
                      const updatedMachines = [...machineData.machines];
                      updatedMachines[index].type = e.target.value;
                      setMachineData({
                        ...machineData,
                        machines: updatedMachines,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="cutting">Cutting Machine</option>
                    <option value="sewing">Sewing Machine</option>
                    <option value="overlock">Overlock Machine</option>
                    <option value="buttonhole">Buttonhole Machine</option>
                    <option value="pressing">Pressing Machine</option>
                    <option value="packaging">Packaging Machine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Running Hours
                  </label>
                  <input
                    type="number"
                    value={machine.runningHours}
                    onChange={(e) => {
                      const updatedMachines = [...machineData.machines];
                      updatedMachines[index].runningHours = e.target.value;
                      setMachineData({
                        ...machineData,
                        machines: updatedMachines,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Downtime (hrs)
                  </label>
                  <input
                    type="number"
                    value={machine.downtime}
                    onChange={(e) => {
                      const updatedMachines = [...machineData.machines];
                      updatedMachines[index].downtime = e.target.value;
                      setMachineData({
                        ...machineData,
                        machines: updatedMachines,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maintenance
                  </label>
                  <select
                    value={machine.maintenanceType}
                    onChange={(e) => {
                      const updatedMachines = [...machineData.machines];
                      updatedMachines[index].maintenanceType = e.target.value;
                      setMachineData({
                        ...machineData,
                        machines: updatedMachines,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    <option value="routine">Routine</option>
                    <option value="preventive">Preventive</option>
                    <option value="breakdown">Breakdown</option>
                    <option value="repair">Repair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Efficiency %
                  </label>
                  <input
                    type="number"
                    value={machine.efficiency}
                    onChange={(e) => {
                      const updatedMachines = [...machineData.machines];
                      updatedMachines[index].efficiency = e.target.value;
                      setMachineData({
                        ...machineData,
                        machines: updatedMachines,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operator
                  </label>
                  <input
                    type="text"
                    value={machine.operator}
                    onChange={(e) => {
                      const updatedMachines = [...machineData.machines];
                      updatedMachines[index].operator = e.target.value;
                      setMachineData({
                        ...machineData,
                        machines: updatedMachines,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Operator name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={machine.notes}
                    onChange={(e) => {
                      const updatedMachines = [...machineData.machines];
                      updatedMachines[index].notes = e.target.value;
                      setMachineData({
                        ...machineData,
                        machines: updatedMachines,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Issues, repairs, etc."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: "production", label: "Production Data", icon: Factory },
    { id: "materials", label: "Material Usage", icon: Box },
    { id: "quality", label: "Quality Control", icon: CheckCircle },
    { id: "inventory", label: "Inventory", icon: Layers },
    { id: "workforce", label: "Workforce", icon: Users },
    { id: "machines", label: "Machines", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Clipboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manufacturing Data Input
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Selected Date:{" "}
              <span className="font-medium">
                {new Date(selectedDate).toLocaleDateString()}
              </span>
            </div>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium transition-colors">
              <Download className="w-4 h-4" />
              Import Data
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  currentTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {currentTab === "production" && <ProductionDataTab />}
        {currentTab === "materials" && <MaterialUsageTab />}
        {currentTab === "quality" && <QualityControlTab />}
        {currentTab === "inventory" && <InventoryTab />}
        {currentTab === "workforce" && <WorkforceTab />}
        {currentTab === "machines" && <MachineTab />}

        {/* Submit Button */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info className="w-4 h-4" />
              <span>
                All required fields (*) must be filled before submission
              </span>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2 font-medium transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Submit Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manufacture;
