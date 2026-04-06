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
    if (analysis.isSensory) return "border-l-brutal-teal";
    if (analysis.membersOnly) return "border-l-brutal-blue";
    if (analysis.restrictedAccess) return "border-l-brutal-purple";
    return "border-l-brutal-black/30";
  };

  const getDateColor = (analysis) => {
    if (analysis.isSensory) return "text-brutal-teal";
    if (analysis.membersOnly) return "text-brutal-blue";
    if (analysis.restrictedAccess) return "text-brutal-purple";
    return "text-brutal-black/60";
  };

  const getEventTypeBadge = (analysis) => {
    if (analysis.isSensory) {
      return (
        <span className="brutal-badge bg-brutal-teal text-white">
          Sensory - Quiet
        </span>
      );
    }
    if (analysis.membersOnly) {
      return (
        <span className="brutal-badge bg-brutal-blue text-white">
          Members Only
        </span>
      );
    }
    if (analysis.restrictedAccess) {
      if (analysis.type === "Women's Only (All Pools)") {
        return (
          <span className="brutal-badge bg-brutal-purple text-white">
            Women Only
          </span>
        );
      } else if (analysis.type === "Seniors 60+ Only") {
        return (
          <span className="brutal-badge bg-brutal-purple text-white">
            Seniors 60+ Only
          </span>
        );
      }
    }
    return null;
  };

  const getAvailabilityInfo = (analysis) => {
    const items = [];

    items.push(
      <span key="lanes" className={`font-bold ${analysis.lanes ? "text-brutal-green" : "text-brutal-red"}`}>
        Lanes: {analysis.lanes ? "Y" : "N"}
      </span>
    );

    items.push(
      <span key="kids" className={`font-bold ${analysis.kids ? "text-brutal-green" : "text-brutal-red"}`}>
        Kids: {analysis.kids ? "Y" : "N"}
      </span>
    );

    return items;
  };

  return (
    <div className="max-w-4xl mx-auto mb-24">
      <div className="border-2 border-brutal-black shadow-brutal overflow-hidden">
        <div className="px-6 py-6 text-center border-b-2 border-brutal-black bg-brutal-cream">
          <h2 className="font-display text-xl font-bold text-brutal-black uppercase tracking-wider">
            Upcoming Special Events
          </h2>
          <p className="text-xs text-brutal-black/50 mt-1 font-display uppercase tracking-wider">
            Sensory, Members Only, Women Only & Seniors 60+
          </p>
        </div>

        <div className="divide-y divide-brutal-black/10">
          {specialEvents.length === 0 ? (
            <div className="text-center py-12 text-brutal-black/50 font-display uppercase tracking-wide">
              No upcoming special events found
            </div>
          ) : (
            specialEvents.map((slot, index) => (
              <div
                key={index}
                className={`border-l-4 ${getBorderColor(slot.analysis)} p-4 hover:bg-brutal-cream/50 transition-colors`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div
                      className={`text-sm font-display font-bold mb-2 uppercase tracking-wider ${getDateColor(slot.analysis)}`}
                    >
                      {formatDate(slot.start)}
                    </div>
                    <div className="font-display text-base font-bold text-brutal-black uppercase tracking-wide mb-2">
                      {slot.event.title}
                    </div>
                    <div className="mb-2">{getEventTypeBadge(slot.analysis)}</div>
                    <div className="text-sm text-brutal-black/60 mb-2 font-display tracking-wide">
                      {formatTime(slot.start)} - {formatTime(slot.end)}
                      <span className="mx-2 text-brutal-black/20 font-bold">|</span>
                      <span className="font-bold text-brutal-black/80">
                        {formatDuration(slot.duration)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-display uppercase tracking-wider">
                      {getAvailabilityInfo(slot.analysis).map(
                        (item, i, arr) => (
                          <React.Fragment key={i}>
                            {item}
                            {i < arr.length - 1 && (
                              <span className="text-brutal-black/20 font-bold">|</span>
                            )}
                          </React.Fragment>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default SpecialEventsDisplay;
