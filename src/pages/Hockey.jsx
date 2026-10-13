import Skating from "./Skating";

// Hockey titles are team and league names, so the status box names what is on the ice.
const HOCKEY_SERIES = [{ id: "hockey", label: "Hockey", fill: "#2563eb", ink: "#fff", showTitle: true }];

function Hockey() {
  return <Skating title="LCLC Hockey" dataFile="hockey" series={HOCKEY_SERIES} />;
}

export default Hockey;
