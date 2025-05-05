import React from "react";

function TabNavigation({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="flex justify-center mb-6 gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-6 py-2 rounded-md transition ${
            activeTab === tab.id
              ? "bg-blue-700 text-white border-blue-700"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          } border`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default TabNavigation;
