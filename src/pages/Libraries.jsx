import React from "react";
import Layout from "../components/common/Layout";
import TabNavigation from "../components/common/TabNavigation";
import LibraryStatusBox from "../components/libraries/LibraryStatusBox";
import LibrarySchedule from "../components/libraries/LibrarySchedule";
import Loading from "../components/common/Loading";
import { useLibrariesData } from "../hooks/useLibrariesData";
import { useTabState } from "../hooks/useTabState";
import { CONSTANTS } from "../utils/constants";

function Libraries() {
  const { libraries, loading, error, lastUpdated, isLibraryOpen } =
    useLibrariesData();
  const { activeTab, setActiveTab } = useTabState("status");

  if (loading) {
    return (
      <Layout
        title="South Shore Libraries Dashboard"
        subtitle="Library hours and availability information"
      >
        <Loading />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        title="South Shore Libraries Dashboard"
        subtitle="Library hours and availability information"
      >
        <div className="border-2 border-brutal-red p-4 text-brutal-red font-display uppercase tracking-wide">
          <p>Error: {error}</p>
          <p className="mt-2 text-sm">Refresh the page to try again.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="South Shore Libraries Dashboard"
      subtitle="Library hours and availability information"
      lastUpdated={lastUpdated}
    >
      <TabNavigation
        tabs={CONSTANTS.TABS.LIBRARIES}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === "status" ? (
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {libraries &&
            Object.entries(libraries).map(([key, library]) => (
              <LibraryStatusBox
                key={key}
                library={library}
                status={isLibraryOpen(key)}
              />
            ))}
        </div>
      ) : (
        <LibrarySchedule libraries={libraries} />
      )}
    </Layout>
  );
}

export default Libraries;
