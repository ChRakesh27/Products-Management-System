import { Layers, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
function Inventory() {
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

  const removeMaterialRow = (section, index) => {
    if (section === "inventory") {
      setInventoryData({
        ...inventoryData,
        materials: inventoryData.materials.filter((_, i) => i !== index),
      });
    }
  };

  return (
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
            <label className="block text-sm font-medium text-gra y-700 mb-2">
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
}

export default Inventory;
