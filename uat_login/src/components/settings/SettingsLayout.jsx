import { Separator } from "../ui/separator";
import React from "react";
import SidebarNav from "./SidebarNav";
import { Outlet } from "react-router-dom";

const sidebarNavItems = [
  {
    title: "Perfil de Usuario",
    to: "/settings/profile",
  },
  {
    title: "Acceso de UATs",
    to: "/settings/uats",
  },
  {
    title: "Apariencia",
    to: "/settings/appearance",
  },
];

const SettingsLayout = () => {
  return (
    <div className="space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Maneja tus configuraciones de usuario y accesos de las UATs.</p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
