import React from "react";
import { Routes, Route } from "react-router-dom";
import Swimming from "./pages/Swimming";
import Skating from "./pages/Skating";
import Libraries from "./pages/Libraries";
import ScrollToTop from "./components/common/ScrollToTop";
import { HashRouter } from "react-router-dom";

function App() {
  return (
    <HashRouter>
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
