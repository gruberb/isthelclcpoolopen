import React from "react";
import Footer from "./Footer";

function Layout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-brutal-white">
      <div className="max-w-6xl mx-auto px-4 py-3 md:py-6">
        {title && (
          <div className="mb-4 md:mb-6 text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-brutal-black uppercase tracking-wider mb-1">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs md:text-sm text-brutal-black/60 uppercase tracking-wide">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="border-b-3 border-brutal-blue mb-4 md:mb-6" />
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
