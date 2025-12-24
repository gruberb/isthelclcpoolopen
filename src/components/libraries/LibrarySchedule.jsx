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
    <div className="flex flex-col items-center max-w-4xl mx-auto mb-24">
      <div className="mb-6 w-full max-w-md">
        <select
          className="w-full px-4 py-2 text-sm bg-white border border-gray-300 hover:border-blue-400 transition-colors focus:border-blue-500"
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

      <div className="bg-white rounded-lg shadow-md w-full">
        <div className="px-6 py-6 text-center border-b border-gray-200">
          <h2 className="text-2xl font-light text-gray-900 tracking-wide mb-3">
            {library.name}
          </h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>{library.location}</p>
            <p>{library.phone}</p>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-3">
            {days.map((day) => {
              const isToday = day === today;
              const hours = library.hours[day];
              const isClosed = !hours?.open || !hours?.close;

              return (
                <div
                  key={day}
                  className={`p-4 rounded-md border-l-4 transition-colors ${
                    isToday
                      ? "border-blue-400 bg-blue-50"
                      : "border-transparent bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div
                        className={`text-base font-medium capitalize ${
                          isToday ? "text-blue-600" : "text-gray-900"
                        }`}
                      >
                        {day}
                        {isToday && (
                          <span className="ml-2 inline-flex items-center text-xs font-semibold text-blue-600">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5" />
                            TODAY
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`text-sm ${
                        isClosed
                          ? "text-red-600 font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {isClosed
                        ? "Closed"
                        : `${hours.open.replace(":00", "")} – ${hours.close.replace(":00", "")}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LibrarySchedule;
