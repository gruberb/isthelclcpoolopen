import React from "react";

function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
      <p className="text-sm text-gray-600 font-medium">Loading...</p>
    </div>
  );
}

export default Loading;
