import React, { useState } from "react";
import { CONSTANTS } from "../../utils/constants";

function LibrarySchedule({ libraries }) {
  const [selectedLibrary, setSelectedLibrary] = useState(
    libraries ? Object.keys(libraries)[0] : null,
  );

  if (!libraries || !selectedLibrary) {
    return <div>No library data available</div>;
  }

  const library = libraries[selectedLibrary];
  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

  // Day order for display
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          value={selectedLibrary}
          onChange={(e) => setSelectedLibrary(e.target.value)}
        >
          {Object.entries(libraries).map(([key, lib]) => (
            <option key={key} value={key}>
              {CONSTANTS.LIBRARY_DISPLAY_NAMES[lib.name] || lib.name}
            </option>
          ))}
        </select>
      </div>

      <h3 className="text-xl font-medium mb-2">{library.name}</h3>

      <div className="mb-4">
        <p className="text-gray-700">
          <strong>Address:</strong> {library.location}
        </p>
        <p className="text-gray-700">
          <strong>Phone:</strong> {library.phone}
        </p>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left border-b border-gray-200">Day</th>
            <th className="p-2 text-left border-b border-gray-200">Hours</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => {
            const isToday = day === today;
            const hours = library.hours[day];

            return (
              <tr
                key={day}
                className={`${isToday ? "bg-green-50 font-bold" : ""} border-b border-gray-200`}
              >
                <td className="p-2 capitalize">{day}</td>
                <td className="p-2">
                  {hours?.open && hours?.close
                    ? `${hours.open.replace(":00", "")} - ${hours.close.replace(":00", "")}`
                    : "Closed"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default LibrarySchedule;
