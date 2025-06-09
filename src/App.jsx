import React from "react";
import { Routes, Route } from "react-router-dom";
import Swimming from "./pages/Swimming";
import Skating from "./pages/Skating";
import Libraries from "./pages/Libraries";
import ScrollToTop from "./components/common/ScrollToTop";
import { HashRouter } from "react-router-dom";

function App() {
  return (
    <HashRouter basename={process.env.NODE_ENV === 'production' ? process.env.PUBLIC_URL : ''}>
      {/* Add ScrollToTop component to scroll to top on route change */}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Swimming />} />
        <Route path="/skating" element={<Skating />} />
        <Route path="/libraries" element={<Libraries />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
