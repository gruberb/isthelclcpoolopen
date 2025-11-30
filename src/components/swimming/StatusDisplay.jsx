import React, { useMemo } from "react";
import StatusBox from "./StatusBox";
import { findFeatureStatus } from "../../utils/eventParser";
import { formatTime, formatTimeRemaining } from "../../utils/dateUtils";

function StatusDisplay({ data }) {
  // Use useMemo to avoid recalculating on every render
  const statuses = useMemo(() => {
    // Create new Date inside the useMemo callback
    const now = new Date();
    const lanesStatus = findFeatureStatus(data, now, "lanes");
    const kidsStatus = findFeatureStatus(data, now, "kids");

    return { lanesStatus, kidsStatus, now };
  }, [data]); // Remove 'now' from dependencies

  // Format the status text for display
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

  return (
    <div className="flex flex-wrap justify-center gap-6">
      <StatusBox
        title="LANE SWIMMING"
        isOpen={statuses.lanesStatus.isActive}
        statusText={formatStatusText(statuses.lanesStatus)}
        restriction={statuses.lanesStatus.restrictedAccess}
        membersOnly={statuses.lanesStatus.membersOnly}
        sensory={statuses.lanesStatus.restrictionType === "Sensory Swim"}
      />

      <StatusBox
        title="KIDS SWIMMING"
        isOpen={statuses.kidsStatus.isActive}
        statusText={formatStatusText(statuses.kidsStatus)}
        restriction={statuses.kidsStatus.restrictedAccess}
        membersOnly={statuses.kidsStatus.membersOnly}
        sensory={statuses.kidsStatus.restrictionType === "Sensory Swim"}
      />
    </div>
  );
}

export default StatusDisplay;
