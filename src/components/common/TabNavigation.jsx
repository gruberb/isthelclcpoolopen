import React, { useEffect, useRef } from "react";

function TabNavigation({ tabs, activeTab, setActiveTab }) {
  const activeRef = useRef(null);

  // A deep link such as ?tab=special can land with its tab scrolled out of view, which reads
  // as nothing being selected. block:"nearest" so this never fights ScrollToTop.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [activeTab]);

  const handleTabClick = (tabId) => {
    if (window.plausible) {
      window.plausible("Tab Click", { props: { tab: tabId } });
    }
    setActiveTab(tabId);
  };

  // Scrolls rather than wraps: the five labels need ~355px against the 358px a 390px phone
  // gives, so wrapping cost a whole second row on every phone. mx-auto on a w-max track
  // centres it wherever it fits and resolves to zero once it does not, so a narrow phone
  // gets a left-aligned scrollable row with nothing unreachable. The negative margin lets a
  // clipped tab meet the screen edge instead of stopping 16px short, and py-1.5 keeps the
  // active tab's offset shadow and the focus ring outside the overflow clip.
  return (
    <div
      data-tabs
      className="-mx-4 mb-3 md:mb-5 overflow-x-auto no-scrollbar"
    >
      <div className="flex w-max mx-auto gap-1 md:gap-3 px-4 py-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              ref={isActive ? activeRef : null}
              onClick={() => handleTabClick(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={`shrink-0 px-2 py-3 md:px-3 font-display font-bold text-xs md:text-sm uppercase tracking-wider transition-all ${
                isActive
                  ? "bg-brutal-blue text-white border-2 border-brutal-black shadow-brutal-sm"
                  : "border-2 border-transparent text-brutal-black/70 hover:border-brutal-black"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TabNavigation;
