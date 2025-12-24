import React from "react";
import Footer from "./Footer";

function Layout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-3 md:py-6">
        {title && (
          <div className="mb-4 md:mb-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs md:text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
        )}
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
