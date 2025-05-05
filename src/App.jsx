import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Swimming from "./pages/Swimming";
import Skating from "./pages/Skating";
import Libraries from "./pages/Libraries";
import ScrollToTop from "./components/common/ScrollToTop";

function App() {
  return (
    <BrowserRouter>
      {/* Add ScrollToTop component to scroll to top on route change */}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Swimming />} />
        <Route path="/skating" element={<Skating />} />
        <Route path="/libraries" element={<Libraries />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
