import React from "react";
import AsideBar from "./AsideBar";
import Header from "./Header";
import { Toaster } from "./ui/toaster";
import { Outlet } from "react-router-dom";

const Layout = ({ pageTitle, isDashboard = false }) => {
  const mainClass = `grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 ${isDashboard ? "xl:grid-cols-4" : ""}`;
  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        {/* BARRA LATERAL IZQUIERDA */}
        <AsideBar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 md:h-full xl:h-screen">
          {/* HEADER */}
          <Header page={pageTitle} />
          <main className={mainClass}>
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster />
    </>
  );
};

export default Layout;
