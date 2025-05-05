import { useState } from "react";

export function useTabState(initialTabId) {
  const [activeTab, setActiveTab] = useState(initialTabId);

  return {
    activeTab,
    setActiveTab,
  };
}
