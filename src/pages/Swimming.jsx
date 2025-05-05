import React from "react";
import Layout from "../components/common/Layout";
import TabNavigation from "../components/common/TabNavigation";
import StatusDisplay from "../components/swimming/StatusDisplay";
import ScheduleDisplay from "../components/swimming/ScheduleDisplay";
import Loading from "../components/common/Loading";
import { useSwimmingData } from "../hooks/useSwimmingData";
import { useTabState } from "../hooks/useTabState";
import { CONSTANTS } from "../utils/constants";

function Swimming() {
  const { data, loading, error, lastUpdated } = useSwimmingData();
  const { activeTab, setActiveTab } = useTabState("status");

  if (loading) {
    return (
      <Layout title="Is The LCLC Pool Open?">
        <Loading />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Is The LCLC Pool Open?">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p>Error: {error}</p>
          <p className="mt-2">Refresh the page to try again.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Is The LCLC Pool Open?" lastUpdated={lastUpdated}>
      <TabNavigation
        tabs={CONSTANTS.TABS.SWIMMING}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === "status" ? (
        <StatusDisplay data={data} />
      ) : (
        <ScheduleDisplay data={data} />
      )}
    </Layout>
  );
}

export default Swimming;
