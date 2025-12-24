import React, { useMemo } from "react";
import { formatTime } from "../../utils/dateUtils";
import {
  findNextSlots,
  findNextMorningSlots,
  findNextAfternoonSlots,
  findLongestSlots,
} from "../../utils/eventParser";

function FamilyPlanningDisplay({ data }) {
  const now = useMemo(() => new Date(), []);

  const sections = useMemo(() => {
    return [
      {
        title: "When can I go swimming with my kids next?",
        slots: findNextSlots(data, now, "kids", 3),
      },
      {
        title: "When is the next morning swim with the kids?",
        slots: findNextMorningSlots(data, now, "kids", 3),
      },
      {
        title: "When is the next afternoon swim with the kids?",
        slots: findNextAfternoonSlots(data, now, "kids", 3),
      },
      {
        title: "When is the most time I can spend with the kids in the pool?",
        slots: findLongestSlots(data, now, "kids", 3),
      },
    ];
  }, [data, now]);

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

  const getRestrictionBadge = (analysis) => {
    if (analysis.membersOnly) {
      return (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
          Members Only
        </span>
      );
    }
    if (analysis.isSensory) {
      return (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-700">
          Sensory
        </span>
      );
    }
    if (analysis.restrictedAccess) {
      return (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
          {analysis.type === "Women's Only (All Pools)" ? "Women Only" : "Seniors 60+"}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto mb-24 space-y-8">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
          </div>
          <div className="p-4">
            {section.slots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No upcoming slots found
              </div>
            ) : (
              <div className="space-y-3">
                {section.slots.map((slot, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-blue-300 bg-white p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-blue-600 mb-1">
                          {formatDate(slot.start)}
                        </div>
                        <div className="text-base font-medium text-gray-900 mb-1">
                          {slot.event.title}
                          {getRestrictionBadge(slot.analysis)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatTime(slot.start)} – {formatTime(slot.end)}
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="font-medium text-gray-700">
                            {formatDuration(slot.duration)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default FamilyPlanningDisplay;
