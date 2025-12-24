import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function useTabState(initialTabId) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTabState] = useState(tabFromUrl || initialTabId);

  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab && currentTab !== activeTab) {
      setActiveTabState(currentTab);
    } else if (!currentTab && activeTab !== initialTabId) {
      setActiveTabState(initialTabId);
    }
  }, [searchParams, initialTabId, activeTab]);

  const setActiveTab = (tabId) => {
    setActiveTabState(tabId);
    setSearchParams({ tab: tabId });
  };

  return {
    activeTab,
    setActiveTab,
  };
}
