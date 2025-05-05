import React from "react";

function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-700 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  );
}

export default Loading;
