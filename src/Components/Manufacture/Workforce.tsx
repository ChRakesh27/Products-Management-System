import { Users } from "lucide-react";
import { useState } from "react";
function Workforce() {
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
  return (
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
}

export default Workforce;
