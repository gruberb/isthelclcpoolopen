import React from "react";
import Footer from "./Footer";

function Layout({ children, title }) {
  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          {title}
        </h1>
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
