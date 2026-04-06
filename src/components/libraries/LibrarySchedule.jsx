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
          className="w-full px-4 py-2 text-sm bg-white border-2 border-brutal-black font-display font-bold uppercase tracking-wider hover:bg-brutal-cream transition-colors"
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

      <div className="border-2 border-brutal-black shadow-brutal w-full">
        <div className="px-6 py-6 text-center border-b-2 border-brutal-black bg-brutal-cream">
          <h2 className="font-display text-xl font-bold text-brutal-black uppercase tracking-wider mb-3">
            {library.name}
          </h2>
          <div className="text-xs text-brutal-black/50 font-display uppercase tracking-wider space-y-1">
            <p>{library.location}</p>
            <p>{library.phone}</p>
          </div>
        </div>

        <div className="divide-y divide-brutal-black/10">
          {days.map((day) => {
            const isToday = day === today;
            const hours = library.hours[day];
            const isClosed = !hours?.open || !hours?.close;

            return (
              <div
                key={day}
                className={`p-4 border-l-4 transition-colors ${
                  isToday
                    ? "border-l-brutal-blue bg-brutal-yellow/10"
                    : "border-l-transparent hover:bg-brutal-cream/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div
                      className={`font-display text-sm font-bold uppercase tracking-wider ${
                        isToday ? "text-brutal-blue" : "text-brutal-black"
                      }`}
                    >
                      {day}
                      {isToday && (
                        <span className="ml-2 brutal-badge bg-brutal-blue text-white text-xs">
                          Today
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`text-sm font-display font-bold uppercase tracking-wider ${
                      isClosed
                        ? "text-brutal-red"
                        : "text-brutal-black/70"
                    }`}
                  >
                    {isClosed
                      ? "Closed"
                      : `${hours.open.replace(":00", "")} - ${hours.close.replace(":00", "")}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LibrarySchedule;
