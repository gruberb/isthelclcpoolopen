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
      <Layout title="South Shore Public Libraries">
        <Loading />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="South Shore Public Libraries">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p>Error: {error}</p>
          <p className="mt-2">Refresh the page to try again.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="South Shore Public Libraries" lastUpdated={lastUpdated}>
      <TabNavigation
        tabs={CONSTANTS.TABS.LIBRARIES}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === "status" ? (
        <div className="flex flex-wrap justify-center gap-6 mb-28">
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
