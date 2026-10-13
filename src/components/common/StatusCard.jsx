import React from "react";

const SIZES = {
  lg: {
    box: "min-h-[13rem] p-6",
    title: "text-xl md:text-2xl",
    answer: "text-[7rem] md:text-[9rem] my-3",
    detail: "text-base md:text-lg",
  },
  md: {
    box: "min-h-[9rem] p-4",
    title: "text-lg",
    answer: "text-6xl md:text-7xl my-2",
    detail: "text-sm",
  },
};

// The answer is the page: cards stretch to fill their grid cell, so on a phone two of them
// take half the screen each.
function StatusCard({ title, open, detail, size = "lg" }) {
  const s = SIZES[size];
  return (
    <div
      className={`brutal-card border-l-8 ${open ? "border-l-brutal-green" : "border-l-brutal-red"} ${s.box} flex flex-col items-center justify-center text-center`}
    >
      <h2 className={`font-display font-bold uppercase tracking-wider ${s.title}`}>{title}</h2>
      <div className={`font-display font-bold leading-none ${s.answer} ${open ? "text-brutal-green" : "text-brutal-red"}`}>
        {open ? "YES" : "NO"}
      </div>
      <div className={`font-display uppercase tracking-wide text-brutal-muted ${s.detail}`}>{detail}</div>
    </div>
  );
}

export default StatusCard;
