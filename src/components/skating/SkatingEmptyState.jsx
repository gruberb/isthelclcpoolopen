function SkatingEmptyState({ selectedWeek }) {
  const weekText = selectedWeek === 0 ? "this week" : "next week";

  return (
    <div className="mt-8 mb-28">
      <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md mx-auto">
        {/* Ice skating emoji */}
        <div className="text-6xl mb-6">⛸️</div>

        {/* Main message */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          No public skating {weekText}
        </h3>

        {/* Helpful message */}
        <p className="text-gray-600 mb-6 leading-relaxed">
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
