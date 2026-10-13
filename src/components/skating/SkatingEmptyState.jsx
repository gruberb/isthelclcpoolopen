const COPY = {
  skating: {
    icon: "/icons/Ice-Skating--Streamline-Flex.png",
    heading: "No public skating",
    thisWeek: "Check back later or try next week - skating schedules can change!",
    nextWeek: "The skating schedule for next week hasn't been posted yet, or there are no public sessions planned.",
  },
  hockey: {
    icon: "/icons/Hockey--Streamline-Flex.png",
    heading: "No hockey",
    thisWeek: "Check back later or try next week - the arena schedule can change!",
    nextWeek: "The arena schedule for next week hasn't been posted yet, or there is no hockey planned.",
  },
};

function SkatingEmptyState({ selectedWeek, sport = "skating" }) {
  const weekText = selectedWeek === 0 ? "this week" : "next week";
  const copy = COPY[sport];

  return (
    <div>
      <div className="border-2 border-brutal-black shadow-brutal p-12 text-center max-w-md mx-auto">
        <img src={copy.icon} alt="" className="w-16 h-16 mx-auto mb-6" />

        <h3 className="font-display text-lg font-bold text-brutal-black uppercase tracking-wider mb-4">
          {copy.heading} {weekText}
        </h3>

        <p className="text-sm text-brutal-black/60">
          {selectedWeek === 0 ? copy.thisWeek : copy.nextWeek}
        </p>
      </div>
    </div>
  );
}

export default SkatingEmptyState;
