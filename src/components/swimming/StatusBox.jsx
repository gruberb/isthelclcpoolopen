import React from "react";

function StatusBox({
  title,
  isOpen,
  statusText,
  restriction,
  membersOnly,
  sensory,
}) {
  const getStatusClass = () => {
    if (!isOpen) return "text-brutal-red";
    if (sensory) return "text-brutal-teal";
    if (restriction) return "text-brutal-purple";
    if (membersOnly) return "text-brutal-blue";
    return "text-brutal-green";
  };

  const getLeftBorder = () => {
    if (!isOpen) return "border-l-4 border-l-brutal-red";
    if (sensory) return "border-l-4 border-l-brutal-teal";
    if (restriction) return "border-l-4 border-l-brutal-purple";
    if (membersOnly) return "border-l-4 border-l-brutal-blue";
    return "border-l-4 border-l-brutal-green";
  };

  return (
    <div className={`brutal-card p-6 min-w-[250px] flex flex-col items-center ${getLeftBorder()}`}>
      <h2 className="font-display text-lg font-bold text-brutal-black uppercase tracking-wider mb-4">
        {title}
      </h2>
      <div
        className={`font-display text-6xl font-bold my-2 h-16 flex items-center justify-center ${getStatusClass()}`}
      >
        {isOpen ? "YES" : "NO"}
      </div>
      <div className="text-sm text-brutal-black/60 mt-2 h-10 font-display uppercase tracking-wide">
        {statusText}
      </div>
    </div>
  );
}

export default StatusBox;
