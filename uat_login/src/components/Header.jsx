import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Home, LineChart, Package, Package2, PanelLeft, Search, Users2 } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "./ui/breadcrumb";
import { Input } from "./ui/input";
import { UserNav } from "./UserNav";

const Header = ({ page }) => {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            {/* Home Aside Link */}
            <Link
              to="/"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Home</span>
            </Link>

            {/* Dashboard Aside Link */}
            <Link
              to="/dashboard"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>

            {/* UATs Aside Link */}
            <Link to="/uats" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Package className="h-5 w-5" />
              UATs
            </Link>

            {/* Users Aside Link */}
            <Link to="/users" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Users2 className="h-5 w-5" />
              Users
            </Link>

            {/* Settings Aside Link */}
            <Link to="/settings" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <LineChart className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      <Breadcrumb className="hidden md:flex">
        {/* Listado Breadcrumb */}
        <BreadcrumbList>
          {/* Breadcrumb Dashboard */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/${page.toLowerCase()}`}>{page}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {/* <BreadcrumbSeparator /> */}

          {/* Breadcrumb UATs */}
          {/* <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/uats">UATs</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem> */}

          {/* <BreadcrumbSeparator /> */}

          {/* Hijo Breadcrumb Edit UATs*/}
          {/* <BreadcrumbItem>
                  <BreadcrumbPage>Edit UATs</BreadcrumbPage>
                </BreadcrumbItem> */}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      <UserNav />
    </header>
  );
};

export default Header;
