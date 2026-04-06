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
    if (!status.isActive) return "text-brutal-red";
    if (status.restrictionType === "Sensory Swim") return "text-brutal-teal";
    if (status.restrictedAccess) return "text-brutal-purple";
    if (status.membersOnly) return "text-brutal-blue";
    return "text-brutal-green";
  };

  const getLeftBorder = (status) => {
    if (!status.isActive) return "border-l-4 border-l-brutal-red";
    if (status.restrictionType === "Sensory Swim") return "border-l-4 border-l-brutal-teal";
    if (status.restrictedAccess) return "border-l-4 border-l-brutal-purple";
    if (status.membersOnly) return "border-l-4 border-l-brutal-blue";
    return "border-l-4 border-l-brutal-green";
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-4 md:mb-6">
      <div
        className={`brutal-card p-4 md:p-6 min-w-[250px] flex flex-col items-center ${getLeftBorder(statuses.lanesStatus)}`}
      >
        <h2 className="font-display text-lg font-bold text-brutal-black uppercase tracking-wider mb-2 md:mb-3">
          Lane Swimming
        </h2>
        <div
          className={`font-display text-6xl font-bold my-1 md:my-2 h-16 flex items-center justify-center ${getStatusColor(statuses.lanesStatus)}`}
        >
          {statuses.lanesStatus.isActive ? "YES" : "NO"}
        </div>
        <div className="text-sm text-brutal-black/60 mt-1 md:mt-2 text-center font-display uppercase tracking-wide">
          {formatStatusText(statuses.lanesStatus)}
        </div>
      </div>

      <div
        className={`brutal-card p-4 md:p-6 min-w-[250px] flex flex-col items-center ${getLeftBorder(statuses.kidsStatus)}`}
      >
        <h2 className="font-display text-lg font-bold text-brutal-black uppercase tracking-wider mb-2 md:mb-3">
          Kids Swimming
        </h2>
        <div
          className={`font-display text-6xl font-bold my-1 md:my-2 h-16 flex items-center justify-center ${getStatusColor(statuses.kidsStatus)}`}
        >
          {statuses.kidsStatus.isActive ? "YES" : "NO"}
        </div>
        <div className="text-sm text-brutal-black/60 mt-1 md:mt-2 text-center font-display uppercase tracking-wide">
          {formatStatusText(statuses.kidsStatus)}
        </div>
      </div>
    </div>
  );
}

export default StatusDisplay;
