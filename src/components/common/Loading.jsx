import React from "react";

function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-10 h-10 border-3 border-brutal-black border-t-brutal-blue animate-spin mb-3"></div>
      <p className="font-display text-sm text-brutal-black uppercase tracking-widest font-bold">
        Loading
      </p>
    </div>
  );
}

export default Loading;
