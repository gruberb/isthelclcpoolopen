import React, { useMemo } from "react";
import { formatTime } from "../../utils/dateUtils";
import { findSpecialEvents } from "../../utils/eventParser";

function SpecialEventsDisplay({ data }) {
  const now = useMemo(() => new Date(), []);

  const specialEvents = useMemo(
    () => findSpecialEvents(data, now, 15),
    [data, now],
  );

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const getBorderColor = (analysis) => {
    if (analysis.isSensory) {
      return "border-teal-400";
    }
    if (analysis.membersOnly) {
      return "border-blue-500";
    }
    if (analysis.restrictedAccess) {
      return "border-purple-400";
    }
    return "border-gray-300";
  };

  const getDateColor = (analysis) => {
    if (analysis.isSensory) {
      return "text-teal-600";
    }
    if (analysis.membersOnly) {
      return "text-blue-600";
    }
    if (analysis.restrictedAccess) {
      return "text-purple-600";
    }
    return "text-gray-600";
  };

  const getEventTypeBadge = (analysis) => {
    if (analysis.isSensory) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-700">
          Sensory - Quiet
        </span>
      );
    }
    if (analysis.membersOnly) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
          Members Only
        </span>
      );
    }
    if (analysis.restrictedAccess) {
      if (analysis.type === "Women's Only (All Pools)") {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
            Women Only
          </span>
        );
      } else if (analysis.type === "Seniors 60+ Only") {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
            Seniors 60+ Only
          </span>
        );
      }
    }
    return null;
  };

  const getAvailabilityInfo = (analysis) => {
    const items = [];

    if (analysis.lanes) {
      items.push(
        <span key="lanes" className="text-green-600 font-semibold">
          Lanes: ✓
        </span>
      );
    } else {
      items.push(
        <span key="lanes" className="text-red-600 font-semibold">
          Lanes: ✗
        </span>
      );
    }

    if (analysis.kids) {
      items.push(
        <span key="kids" className="text-green-600 font-semibold">
          Kids: ✓
        </span>
      );
    } else {
      items.push(
        <span key="kids" className="text-red-600 font-semibold">
          Kids: ✗
        </span>
      );
    }

    return items;
  };

  return (
    <div className="max-w-4xl mx-auto mb-24">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-6 text-center border-b border-gray-200">
          <h2 className="text-2xl font-light text-gray-900 tracking-wide">
            Upcoming Special Events
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Sensory, Members Only, Women Only & Seniors 60+
          </p>
        </div>

        <div className="p-4">
          {specialEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No upcoming special events found
            </div>
          ) : (
            <div className="space-y-3">
              {specialEvents.map((slot, index) => (
                <div
                  key={index}
                  className={`border-l-4 ${getBorderColor(slot.analysis)} bg-white p-4 hover:bg-gray-50 transition-colors`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div
                        className={`text-sm font-medium mb-2 ${getDateColor(slot.analysis)}`}
                      >
                        {formatDate(slot.start)}
                      </div>
                      <div className="text-base font-medium text-gray-900 mb-2">
                        {slot.event.title}
                      </div>
                      <div className="mb-2">{getEventTypeBadge(slot.analysis)}</div>
                      <div className="text-sm text-gray-600 mb-2">
                        {formatTime(slot.start)} – {formatTime(slot.end)}
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="font-medium text-gray-700">
                          {formatDuration(slot.duration)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        {getAvailabilityInfo(slot.analysis).map(
                          (item, i, arr) => (
                            <React.Fragment key={i}>
                              {item}
                              {i < arr.length - 1 && (
                                <span className="text-gray-400">|</span>
                              )}
                            </React.Fragment>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SpecialEventsDisplay;
