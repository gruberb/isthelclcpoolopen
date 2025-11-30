import React from "react";

function StatusBox({
  title,
  isOpen,
  statusText,
  restriction,
  membersOnly,
  sensory,
}) {
  // Determine the appropriate CSS class based on the status
  const getStatusClass = () => {
    if (!isOpen) return "text-red-600";
    if (sensory) return "text-teal-600";
    if (restriction) return "text-purple-700";
    if (membersOnly) return "text-blue-700";
    return "text-green-600";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 min-w-[250px] flex flex-col items-center">
      <h2 className="text-xl font-medium text-gray-800 mb-4">{title}</h2>
      <div
        className={`text-6xl font-bold my-2 h-16 flex items-center justify-center ${getStatusClass()}`}
      >
        {isOpen ? "YES" : "NO"}
      </div>
      <div className="text-lg text-gray-600 mt-2 h-10">{statusText}</div>
    </div>
  );
}

export default StatusBox;
