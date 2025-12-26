import React from "react";

function TabNavigation({ tabs, activeTab, setActiveTab }) {
  const handleTabClick = (tabId) => {
    if (window.plausible) {
      window.plausible("Tab Click", {
        props: { tab: tabId },
        callback: (result) => {
          if (result && result.status) {
            console.debug("Plausible event sent. Status:", result.status);
          } else if (result && result.error) {
            console.error("Plausible error:", result.error);
          } else {
            console.warn("Plausible request was ignored");
          }
        },
      });
    } else {
      console.warn("window.plausible is not defined");
    }
    setActiveTab(tabId);
  };

  return (
    <div className="border-b border-gray-200 mb-4 md:mb-6">
      <div className="flex gap-4 md:gap-8 justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`pb-2 md:pb-3 px-1 border-b-2 transition-colors text-sm font-medium ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-500 hover:border-blue-300"
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
