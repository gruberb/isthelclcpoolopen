import React, { useMemo } from "react";
import { findFeatureStatus } from "../../utils/eventParser";
import { formatTime, formatTimeRemaining } from "../../utils/dateUtils";

function StatusDisplay({ data }) {
  const statuses = useMemo(() => {
    const now = new Date();
    const lanesStatus = findFeatureStatus(data, now, "lanes");
    const kidsStatus = findFeatureStatus(data, now, "kids");

    return { lanesStatus, kidsStatus, now };
  }, [data]);

  function formatStatusText(status) {
    if (!status.isActive) {
      if (status.inGap) {
        let openText = `Opens at ${formatTime(status.nextStartTime)}`;
        if (status.restrictedAccess) {
          if (status.restrictionType === "Women's Only (All Pools)") {
            openText += " (Women Only)";
          } else if (status.restrictionType === "Seniors 60+ Only") {
            openText += " (Seniors 60+)";
          } else if (status.restrictionType === "Sensory Swim") {
            openText += " (Sensory)";
          } else {
            openText += " (Restricted)";
          }
        } else if (status.membersOnly) {
          openText += " (Members Only)";
        }
        return openText;
      }
      return "No more swimming today";
    }

    let timeRemaining = formatTimeRemaining(status.endTime);

    if (status.restrictedAccess) {
      let restrictionType;
      if (status.restrictionType === "Women's Only (All Pools)") {
        restrictionType = "Women only";
      } else if (status.restrictionType === "Seniors 60+ Only") {
        restrictionType = "Seniors 60+";
      } else if (status.restrictionType === "Sensory Swim") {
        restrictionType = "Sensory swim";
      } else {
        restrictionType = "Restricted access";
      }
      return `${restrictionType} - ${timeRemaining}`;
    } else if (status.membersOnly) {
      return `Members only - ${timeRemaining}`;
    }

    return timeRemaining;
  }

  const getStatusColor = (status) => {
    if (!status.isActive) return "text-red-600";
    if (status.restrictionType === "Sensory Swim") return "text-teal-600";
    if (status.restrictedAccess) return "text-purple-700";
    if (status.membersOnly) return "text-blue-700";
    return "text-green-600";
  };

  const getTileStyles = (status) => {
    if (!status.isActive) {
      return "bg-red-50 border-2 border-red-300 hover:border-red-400";
    }
    if (status.restrictionType === "Sensory Swim") {
      return "bg-teal-50 border-2 border-teal-300 hover:border-teal-400";
    }
    if (status.restrictedAccess) {
      return "bg-purple-50 border-2 border-purple-300 hover:border-purple-400";
    }
    if (status.membersOnly) {
      return "bg-blue-50 border-2 border-blue-300 hover:border-blue-400";
    }
    return "bg-green-50 border-2 border-green-300 hover:border-green-400";
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-4 md:mb-6">
      <div
        className={`rounded-lg shadow-md p-4 md:p-6 min-w-[250px] flex flex-col items-center transition-all ${getTileStyles(statuses.lanesStatus)}`}
      >
        <h2 className="text-xl font-medium text-gray-800 mb-2 md:mb-3">
          LANE SWIMMING
        </h2>
        <div
          className={`text-6xl font-light my-1 md:my-2 h-16 flex items-center justify-center ${getStatusColor(statuses.lanesStatus)}`}
        >
          {statuses.lanesStatus.isActive ? "YES" : "NO"}
        </div>
        <div className="text-lg text-gray-600 mt-1 md:mt-2 text-center">
          {formatStatusText(statuses.lanesStatus)}
        </div>
      </div>

      <div
        className={`rounded-lg shadow-md p-4 md:p-6 min-w-[250px] flex flex-col items-center transition-all ${getTileStyles(statuses.kidsStatus)}`}
      >
        <h2 className="text-xl font-medium text-gray-800 mb-2 md:mb-3">
          KIDS SWIMMING
        </h2>
        <div
          className={`text-6xl font-light my-1 md:my-2 h-16 flex items-center justify-center ${getStatusColor(statuses.kidsStatus)}`}
        >
          {statuses.kidsStatus.isActive ? "YES" : "NO"}
        </div>
        <div className="text-lg text-gray-600 mt-1 md:mt-2 text-center">
          {formatStatusText(statuses.kidsStatus)}
        </div>
      </div>
    </div>
  );
}

export default StatusDisplay;
