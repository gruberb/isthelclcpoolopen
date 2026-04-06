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

  const getLeftBorder = () => {
    return status.isOpen
      ? "border-l-4 border-l-brutal-green"
      : "border-l-4 border-l-brutal-red";
  };

  const getStatusColor = () => {
    return status.isOpen ? "text-brutal-green" : "text-brutal-red";
  };

  return (
    <div
      className={`brutal-card p-6 min-w-[250px] flex flex-col items-center ${getLeftBorder()}`}
    >
      <h2 className="font-display text-lg font-bold text-brutal-black uppercase tracking-wider mb-4">
        {displayName}
      </h2>

      <div
        className={`font-display text-6xl font-bold my-2 h-16 flex items-center justify-center ${getStatusColor()}`}
      >
        {status.isOpen ? "YES" : "NO"}
      </div>

      <div className="text-sm text-brutal-black/60 mt-2 text-center font-display uppercase tracking-wide">
        {getStatusText()}
      </div>
    </div>
  );
}

export default LibraryStatusBox;
