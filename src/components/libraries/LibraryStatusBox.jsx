import React from "react";
import { CONSTANTS } from "../../utils/constants";
import { formatMinutes } from "../../utils/dateUtils";

function LibraryStatusBox({ library, status }) {
  const displayName =
    CONSTANTS.LIBRARY_DISPLAY_NAMES[library.name] || library.name;

  const getStatusText = () => {
    if (status.isOpen) {
      return `${formatMinutes(status.timeRemaining)} remaining`;
    } else if (status.minutesUntilOpening) {
      return `Opens in ${formatMinutes(status.minutesUntilOpening)}`;
    } else {
      return "Closed today";
    }
  };

  const getTileStyles = () => {
    if (status.isOpen) {
      return "bg-green-50 border-2 border-green-300 hover:border-green-400";
    } else {
      return "bg-red-50 border-2 border-red-300 hover:border-red-400";
    }
  };

  const getStatusColor = () => {
    return status.isOpen ? "text-green-600" : "text-red-600";
  };

  return (
    <div
      className={`rounded-lg shadow-md p-6 min-w-[250px] flex flex-col items-center transition-all ${getTileStyles()}`}
    >
      <h2 className="text-xl font-medium text-gray-800 mb-4">{displayName}</h2>

      <div
        className={`text-6xl font-light my-2 h-16 flex items-center justify-center ${getStatusColor()}`}
      >
        {status.isOpen ? "YES" : "NO"}
      </div>

      <div className="text-lg text-gray-600 mt-2 text-center">
        {getStatusText()}
      </div>
    </div>
  );
}

export default LibraryStatusBox;
