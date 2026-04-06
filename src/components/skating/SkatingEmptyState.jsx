function SkatingEmptyState({ selectedWeek }) {
  const weekText = selectedWeek === 0 ? "this week" : "next week";

  return (
    <div className="mt-8 mb-28">
      <div className="border-2 border-brutal-black shadow-brutal p-12 text-center max-w-md mx-auto">
        <img
          src="/icons/Ice-Skating--Streamline-Flex.png"
          alt=""
          className="w-16 h-16 mx-auto mb-6"
        />

        <h3 className="font-display text-lg font-bold text-brutal-black uppercase tracking-wider mb-4">
          No public skating {weekText}
        </h3>

        <p className="text-sm text-brutal-black/60">
          {selectedWeek === 0
            ? "Check back later or try next week - skating schedules can change!"
            : "The skating schedule for next week hasn't been posted yet, or there are no public sessions planned."
          }
        </p>
      </div>
    </div>
  );
}

export default SkatingEmptyState;
