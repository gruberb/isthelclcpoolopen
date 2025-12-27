import React, { useMemo } from "react";
import { formatTime } from "../../utils/dateUtils";
import {
  findNextSlots,
  findNextMorningSlots,
  findMembersMorningSlots,
  findNextAfternoonSlots,
  findLongestSlots,
} from "../../utils/eventParser";

function FamilyPlanningDisplay({ data }) {
  const now = useMemo(() => new Date(), []);

  const nextSlots = useMemo(
    () => findNextSlots(data, now, "kids", 3),
    [data, now],
  );
  const morningSlots = useMemo(
    () => findNextMorningSlots(data, now, "kids", 3),
    [data, now],
  );
  const membersMorningSlot = useMemo(
    () => findMembersMorningSlots(data, now, "kids", 1),
    [data, now],
  );
  const afternoonSlots = useMemo(
    () => findNextAfternoonSlots(data, now, "kids", 3),
    [data, now],
  );
  const longestSlots = useMemo(
    () => findLongestSlots(data, now, "kids", 3),
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
          {analysis.type === "Women's Only (All Pools)"
            ? "Women Only"
            : "Seniors 60+"}
        </span>
      );
    }
    return null;
  };

  const renderSlotCard = (slot, index) => (
    <div
      key={index}
      className={`border-l-4 ${slot.isNow ? "border-green-500 bg-green-50" : "border-blue-300 bg-white"} p-4 hover:bg-gray-50 transition-colors`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium text-blue-600 mb-1 flex items-center gap-2">
            {formatDate(slot.start)}
            {slot.isNow && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-500 text-white">
                NOW
              </span>
            )}
          </div>
          <div className="text-base font-medium text-gray-900 mb-1">
            {slot.event.title}
            {getRestrictionBadge(slot.analysis)}
          </div>
          <div className="text-sm text-gray-600">
            {formatTime(slot.start)} – {formatTime(slot.end)}
            <span className="mx-2 text-gray-400">•</span>
            <span className="font-medium text-gray-700">
              {slot.isNow
                ? `${formatDuration(slot.remainingMinutes)} remaining`
                : formatDuration(slot.duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto mb-24 space-y-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            When can I go swimming with my kids next?
          </h3>
        </div>
        <div className="p-4">
          {nextSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No upcoming slots found
            </div>
          ) : (
            <div className="space-y-3">
              {nextSlots.map((slot, index) => renderSlotCard(slot, index))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            When is the next morning swim with the kids?
          </h3>
        </div>
        <div className="p-4">
          {membersMorningSlot.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Members Only
              </h4>
              <div className="space-y-3">
                {membersMorningSlot.map((slot, index) =>
                  renderSlotCard(slot, index),
                )}
              </div>
              <div className="mt-4 mb-4 border-t border-gray-200"></div>
            </div>
          )}
          {morningSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No upcoming slots found
            </div>
          ) : (
            <div className="space-y-3">
              {morningSlots.map((slot, index) => renderSlotCard(slot, index))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            When is the next afternoon swim with the kids?
          </h3>
        </div>
        <div className="p-4">
          {afternoonSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No upcoming slots found
            </div>
          ) : (
            <div className="space-y-3">
              {afternoonSlots.map((slot, index) => renderSlotCard(slot, index))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            When is the most time I can spend with the kids in the pool?
          </h3>
        </div>
        <div className="p-4">
          {longestSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No upcoming slots found
            </div>
          ) : (
            <div className="space-y-3">
              {longestSlots.map((slot, index) => renderSlotCard(slot, index))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FamilyPlanningDisplay;
