import React from "react";
import { cn } from "../../lib/utils";
import { Link, useLocation } from "react-router-dom";
import { buttonVariants } from "../ui/button";

const SidebarNav = ({ className, items, ...props }) => {
  const location = useLocation();

  return (
    <nav className={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)} {...props}>
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            location.pathname === item.to ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
            "justify-start"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
};

export default SidebarNav;
