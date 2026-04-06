import React, { useMemo } from "react";
import { formatTime } from "../../utils/dateUtils";
import {
  findNextSlots,
  findNextMorningSlots,
  findMembersMorningSlots,
  findNextAfternoonSlots,
  findLongestSlots,
} from "../../utils/eventParser";

function SwimmersDisplay({ data }) {
  const now = useMemo(() => new Date(), []);

  const nextSlots = useMemo(
    () => findNextSlots(data, now, "lanes", 3),
    [data, now],
  );
  const morningSlots = useMemo(
    () => findNextMorningSlots(data, now, "lanes", 3),
    [data, now],
  );
  const membersMorningSlots = useMemo(
    () => findMembersMorningSlots(data, now, "lanes", 1),
    [data, now],
  );
  const afternoonSlots = useMemo(
    () => findNextAfternoonSlots(data, now, "lanes", 3),
    [data, now],
  );
  const longestSlots = useMemo(
    () => findLongestSlots(data, now, "lanes", 3),
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
        <span className="ml-2 brutal-badge bg-brutal-blue text-white">
          Members Only
        </span>
      );
    }
    if (analysis.isSensory) {
      return (
        <span className="ml-2 brutal-badge bg-brutal-teal text-white">
          Sensory
        </span>
      );
    }
    if (analysis.restrictedAccess) {
      return (
        <span className="ml-2 brutal-badge bg-brutal-purple text-white">
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
      className={`border-l-4 ${slot.isNow ? "border-l-brutal-green bg-brutal-yellow/10" : "border-l-brutal-green/60"} p-4 hover:bg-brutal-cream/50 transition-colors`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm font-display font-bold text-brutal-green uppercase tracking-wider mb-1 flex items-center gap-2">
            {formatDate(slot.start)}
            {slot.isNow && (
              <span className="brutal-badge bg-brutal-yellow text-brutal-black">
                NOW
              </span>
            )}
          </div>
          <div className="text-base font-display font-bold text-brutal-black uppercase tracking-wide mb-1">
            {slot.event.title}
            {getRestrictionBadge(slot.analysis)}
          </div>
          <div className="text-sm text-brutal-black/60 font-display tracking-wide">
            {formatTime(slot.start)} - {formatTime(slot.end)}
            <span className="mx-2 text-brutal-black/20 font-bold">|</span>
            <span className="font-bold text-brutal-black/80">
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
      <div className="border-2 border-brutal-black shadow-brutal overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-brutal-black bg-brutal-cream">
          <h3 className="font-display text-base font-bold text-brutal-black uppercase tracking-wider">
            When can I go lane swimming next?
          </h3>
        </div>
        <div className="divide-y divide-brutal-black/10">
          {nextSlots.length === 0 ? (
            <div className="text-center py-8 text-brutal-black/50 font-display uppercase tracking-wide">
              No upcoming slots found
            </div>
          ) : (
            nextSlots.map((slot, index) => renderSlotCard(slot, index))
          )}
        </div>
      </div>

      <div className="border-2 border-brutal-black shadow-brutal overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-brutal-black bg-brutal-cream">
          <h3 className="font-display text-base font-bold text-brutal-black uppercase tracking-wider">
            When is the next morning lane swim?
          </h3>
        </div>
        <div className="divide-y divide-brutal-black/10">
          {membersMorningSlots.length > 0 && (
            <div className="p-4">
              <h4 className="font-display text-xs font-bold text-brutal-black/70 mb-3 uppercase tracking-widest">
                Members Only
              </h4>
              <div className="divide-y divide-brutal-black/10">
                {membersMorningSlots.map((slot, index) =>
                  renderSlotCard(slot, index),
                )}
              </div>
              <div className="mt-4 border-t-2 border-brutal-black/10"></div>
            </div>
          )}
          {morningSlots.length === 0 ? (
            <div className="text-center py-8 text-brutal-black/50 font-display uppercase tracking-wide">
              No upcoming slots found
            </div>
          ) : (
            morningSlots.map((slot, index) => renderSlotCard(slot, index))
          )}
        </div>
      </div>

      <div className="border-2 border-brutal-black shadow-brutal overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-brutal-black bg-brutal-cream">
          <h3 className="font-display text-base font-bold text-brutal-black uppercase tracking-wider">
            When is the next afternoon lane swim?
          </h3>
        </div>
        <div className="divide-y divide-brutal-black/10">
          {afternoonSlots.length === 0 ? (
            <div className="text-center py-8 text-brutal-black/50 font-display uppercase tracking-wide">
              No upcoming slots found
            </div>
          ) : (
            afternoonSlots.map((slot, index) => renderSlotCard(slot, index))
          )}
        </div>
      </div>

      <div className="border-2 border-brutal-black shadow-brutal overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-brutal-black bg-brutal-cream">
          <h3 className="font-display text-base font-bold text-brutal-black uppercase tracking-wider">
            When is the most time I can spend in the lanes?
          </h3>
        </div>
        <div className="divide-y divide-brutal-black/10">
          {longestSlots.length === 0 ? (
            <div className="text-center py-8 text-brutal-black/50 font-display uppercase tracking-wide">
              No upcoming slots found
            </div>
          ) : (
            longestSlots.map((slot, index) => renderSlotCard(slot, index))
          )}
        </div>
      </div>
    </div>
  );
}

export default SwimmersDisplay;
