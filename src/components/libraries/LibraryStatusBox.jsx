import React from "react";
import { CONSTANTS } from "../../utils/constants";
import { formatMinutes } from "../../utils/dateUtils";

function LibraryStatusBox({ library, status }) {
  const displayName =
    CONSTANTS.LIBRARY_DISPLAY_NAMES[library.name] || library.name;

  // Status text
  const getStatusText = () => {
    if (status.isOpen) {
      return `${formatMinutes(status.timeRemaining)} remaining`;
    } else if (status.minutesUntilOpening) {
      return `Opens in ${formatMinutes(status.minutesUntilOpening)}`;
    } else {
      return "Closed today";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 min-w-[250px] h-[200px] flex flex-col items-center justify-between">
      <h2 className="text-xl font-medium text-gray-800 h-10 flex items-center">
        {displayName}
      </h2>

      <div
        className={`text-6xl font-bold h-20 flex items-center justify-center ${
          status.isOpen ? "text-green-600" : "text-red-600"
        }`}
      >
        {status.isOpen ? "YES" : "NO"}
      </div>

      <div className="text-lg text-gray-600 h-10 flex items-center">
        {getStatusText()}
      </div>
    </div>
  );
}

export default LibraryStatusBox;
