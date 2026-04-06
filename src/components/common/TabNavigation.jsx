import React from "react";

function TabNavigation({ tabs, activeTab, setActiveTab }) {
  const handleTabClick = (tabId) => {
    if (window.plausible) {
      window.plausible("Tab Click", { props: { tab: tabId } });
    }
    setActiveTab(tabId);
  };

  return (
    <div className="mb-4 md:mb-6">
      <div className="flex gap-2 md:gap-3 justify-center flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`px-3 py-1.5 font-display font-bold text-sm uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? "bg-brutal-blue text-white border-2 border-brutal-black shadow-brutal-sm"
                : "border-2 border-transparent text-brutal-black/70 hover:border-brutal-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TabNavigation;
