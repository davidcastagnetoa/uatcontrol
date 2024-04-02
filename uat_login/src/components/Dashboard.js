// Dashboard.js
import React, { useContext } from "react";
import { DataContext } from "../context/DataContext.js";
import AuthContext from "../context/AuthContext";
import { useState } from "react";

import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { Link } from "react-router-dom";
import { Toaster } from "./ui/toaster";
import { UserNav } from "./UserNav.jsx";

import {
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  File,
  Home,
  LineChart,
  ListFilter,
  MoreVertical,
  Package,
  Package2,
  PanelLeft,
  Search,
  Settings,
  ShoppingCart,
  Truck,
  Users2,
} from "lucide-react";

import { Badge } from "./ui/badge";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

import { Button } from "./ui/button";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { Input } from "./ui/input";

import { Pagination, PaginationContent, PaginationItem } from "./ui/pagination";

import { Progress } from "./ui/progress";

import { Separator } from "./ui/separator";

import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

function Dashboard() {
  const { save } = useContext(DataContext);
  const { authState } = useContext(AuthContext);
  const [uatData, setUatData] = useState({ uat_link: "", uat_script: "" });
  const [error, setError] = useState("");
  const [openToaster, setOpenToaster] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  console.log("Valor de authState: " + JSON.stringify(authState));
  console.log("authState.user: ", authState.user);
  const username = authState.user ? authState.user.username : "Invitado";
  const email = authState.user ? authState.user.email : "Invitado@invitado.com";
  const picture = authState.user ? authState.user.picture : "./ruta_invitado_avatar";
  // console.log("Valor de username: " + username);
  // console.log("Valor de email: " + email);
  // console.log("Ruta de picture: " + picture);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUatData((preUatData) => ({
      ...preUatData,
      [name]: value,
    }));
  };

  const handleSaveUat = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (!uatData.uat_link || !uatData.uat_script) {
        setIsLoading(false);
        throw new Error("Se deben proporcionar tanto el enlace UAT como el script.");
      }
      // Aqui envias los datos al servidor para almacenarlos en la base de datos
      const saveUat = await save(uatData.uat_link, uatData.uat_script, username);
      if (saveUat) {
        console.log("Enlace guardada correctamente");
        toast({
          variant: "default", //outline
          title: "Enlace guardado correctamente",
          // description: "",
          open: { openToaster },
        });
        setUatData({ uat_link: "", uat_script: "" });
        setOpenToaster(true);
      } else {
        throw new Error("No hay respuesta por parte del servidor. Intente más tarde.");
      }
    } catch (err) {
      const errorMessage = err.message;
      console.warn(err.message);
      setError(errorMessage);

      toast({
        variant: "destructive",
        title: "Error al Guardar UAT",
        description: errorMessage,
        open: { openToaster },
      });

      console.warn("Toaster mostrado");
      console.error(error);
      setOpenToaster(true);
    } finally {
      setIsLoading(false); // Termina el indicador de carga
    }
  };

  return (
    // <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
    //   <div className="flex items-center justify-between space-y-2">
    //     <div>
    //       <h2 className="text-2xl font-bold tracking-tight">Welcome back! {username}</h2>
    //       <p className="text-muted-foreground">Listado de UATs</p>
    //       <p className="text-muted-foreground">Email: {email} </p>
    //     </div>
    //     <div className="flex items-center space-x-2">
    //       <UserNav />
    //     </div>
    //   </div>

    //   <div>
    //     <form onSubmit={handleSaveUat} className="flex flex-col gap-1">
    //       <Label>Introduce enlace de UAT</Label>
    //       <Input
    //         id="link"
    //         name="uat_link"
    //         value={uatData.uat_link}
    //         onChange={handleChange}
    //         placeholder="Introduce Enlace UAT"
    //         type="text"
    //         autoCapitalize="none"
    //         autoCorrect="off"
    //         // disabled={isLoading}
    //       />
    //       <Label>Introduce scripting al que pertenece</Label>
    //       <Input
    //         id="script"
    //         name="uat_script"
    //         value={uatData.uat_script}
    //         onChange={handleChange}
    //         placeholder="Introduce Script al que pertenece la UAT"
    //         type="text"
    //         autoCapitalize="none"
    //         autoCorrect="off"
    //         // disabled={isLoading}
    //       />
    //       <button type="submit" disabled={isLoading}>
    //         Guardar
    //       </button>
    //     </form>
    //   </div>
    //   <Toaster />
    // </div>
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        {/* BARRA LATERAL IZQUIERDA */}
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
            <Link
              to="/dashboard"
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
              <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
            </Link>

            {/* Dashboard */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Dashboard</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Dashboard</TooltipContent>
            </Tooltip>
            {/* Orders */}
            {/* <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Orders</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Orders</TooltipContent>
            </Tooltip> */}
            {/* Products */}
            {/* <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Package className="h-5 w-5" />
                  <span className="sr-only">Products</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Products</TooltipContent>
            </Tooltip> */}
            {/* Customers */}
            {/* <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Users2 className="h-5 w-5" />
                  <span className="sr-only">Customers</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Customers</TooltipContent>
            </Tooltip> */}
            {/* Analytics */}
            {/* <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <LineChart className="h-5 w-5" />
                  <span className="sr-only">Analytics</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Analytics</TooltipContent>
            </Tooltip> */}
          </nav>
          <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </nav>
        </aside>

        {/* BODY */}
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          {/* HEADER */}
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
                  <Link
                    href="#"
                    className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                  >
                    <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                    <span className="sr-only">Acme Inc</span>
                  </Link>
                  <Link href="#" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                    <Home className="h-5 w-5" />
                    Dashboard
                  </Link>
                  {/* Orders Aside Link */}
                  <Link href="#" className="flex items-center gap-4 px-2.5 text-foreground">
                    <ShoppingCart className="h-5 w-5" />
                    Orders
                  </Link>
                  {/* Products Aside Link */}
                  <Link href="#" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                    <Package className="h-5 w-5" />
                    Products
                  </Link>
                  {/* Customers Aside Link */}
                  <Link href="#" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                    <Users2 className="h-5 w-5" />
                    Customers
                  </Link>
                  {/* Settings Aside Link */}
                  <Link href="#" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                    <LineChart className="h-5 w-5" />
                    Settings
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="#">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {/* <BreadcrumbSeparator /> */}
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

          {/* MAIN */}
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-4 xl:grid-cols-4">
            {/* LEFT CENTRAL BODY */}
            <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
              {/* TARJETAS SUPERIORES */}
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {/* TARJETA 1 */}
                {/* <Card className="sm:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle>Your Orders</CardTitle>
                    <CardDescription className="max-w-lg text-balance leading-relaxed">
                      Introducing Our Dynamic Orders Dashboard for Seamless Management and Insightful Analysis.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button>Create New Order</Button>
                  </CardFooter>
                </Card> */}

                {/* TARJETA 2 */}
                {/* <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>This Week</CardDescription>
                    <CardTitle className="text-4xl">$1329</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">+25% from last week</div>
                  </CardContent>
                  <CardFooter>
                    <Progress value={25} aria-label="25% increase" />
                  </CardFooter>
                </Card> */}

                {/* TARJETA 3 */}
                {/* <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>This Month</CardDescription>
                    <CardTitle className="text-3xl">$5,329</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">+10% from last month</div>
                  </CardContent>
                  <CardFooter>
                    <Progress value={12} aria-label="12% increase" />
                  </CardFooter>
                </Card> */}
              </div>

              {/* TABLAS */}
              <Tabs defaultValue="week">
                <div className="flex items-center">
                  {/* LISTADO DE TABLAS */}
                  <TabsList>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="year">Year</TabsTrigger>
                  </TabsList>
                  <div className="ml-auto flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 gap-1 text-sm">
                          <ListFilter className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only">Filter</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked>Fulfilled</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Declined</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Refunded</DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {/* Export Button */}
                    {/* <Button size="sm" variant="outline" className="h-7 gap-1 text-sm">
                      <File className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only">Export</span>
                    </Button> */}
                  </div>
                </div>
                {/* TABLA SEMANAL */}
                <TabsContent value="week">
                  <Card>
                    <CardHeader className="px-7">
                      <CardTitle>UATs</CardTitle>
                      <CardDescription>Enlaces de pruebas de scriptings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        {/* CABECERA DE LA TABLA */}
                        <TableHeader>
                          <TableRow>
                            <TableHead>Scripting</TableHead>
                            <TableHead className="hidden sm:table-cell">Estado</TableHead>
                            <TableHead className="hidden md:table-cell">Fecha</TableHead>
                            <TableHead className="text-right">OSA</TableHead>
                          </TableRow>
                        </TableHeader>
                        {/* CUERPO DE LA TABLA */}
                        <TableBody>
                          {/* Fila 1 */}
                          {/* <TableRow className="bg-accent"></TableCell>*/}
                          <TableRow>
                            <TableCell>
                              <div className="font-medium">Customer Completo</div>
                              <div className="hidden text-sm text-muted-foreground md:inline">
                                <Link to="#">Click aquí para acceder</Link>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge className="text-xs" variant="secondary">
                                Desplegado
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">2023-06-23</TableCell>
                            <TableCell className="text-right">OSA-2426</TableCell>
                          </TableRow>
                          {/* Fila 2 */}
                          <TableRow>
                            <TableCell>
                              <div className="font-medium">Saltos de Alarma</div>
                              <div className="hidden text-sm text-muted-foreground md:inline">
                                <Link to="#">Click aquí para acceder</Link>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge className="text-xs" variant="outline">
                                En desarrollo
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">2023-06-24</TableCell>
                            <TableCell className="text-right">OSA-2285</TableCell>
                          </TableRow>
                          {/* Fila 3*/}
                          <TableRow>
                            <TableCell>
                              <div className="font-medium">Nuevo Proceso Tamper</div>
                              <div className="hidden text-sm text-muted-foreground md:inline">
                                <Link to="#">Click aquí para acceder</Link>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge className="text-xs" variant="default">
                                En evaluacion
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">2023-06-23</TableCell>
                            <TableCell className="text-right">OSA-2212</TableCell>
                          </TableRow>
                        </TableBody>
                        {/* PIE DE LA TABLA */}
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* RIGHT CENTRAL BODY */}
            <div className=" lg:col-span-2">
              {/* FORM FOR UAT */}
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-start bg-muted/50">
                  <div className="grid gap-0.5">
                    <CardTitle className="group flex items-center gap-2 text-lg">
                      OSA ID: OSA-2426
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Copy className="h-3 w-3" />
                        <span className="sr-only">Copy Order ID</span>
                      </Button>
                    </CardTitle>
                    <CardDescription>Date: November 23, 2023</CardDescription>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                      <Truck className="h-3.5 w-3.5" />
                      <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">Track Order</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="outline" className="h-8 w-8">
                          <MoreVertical className="h-3.5 w-3.5" />
                          <span className="sr-only">More</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        {/* <DropdownMenuItem>Export</DropdownMenuItem> */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Trash</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="p-6 text-sm">
                  <div className="grid gap-3">
                    <div className="font-semibold">Order Details</div>
                    <ul className="grid gap-3">
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Glimmer Lamps x <span>2</span>
                        </span>
                        <span>$250.00</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Aqua Filters x <span>1</span>
                        </span>
                        <span>$49.00</span>
                      </li>
                    </ul>
                    <Separator className="my-2" />
                    <ul className="grid gap-3">
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>$299.00</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>$5.00</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span>$25.00</span>
                      </li>
                      <li className="flex items-center justify-between font-semibold">
                        <span className="text-muted-foreground">Total</span>
                        <span>$329.00</span>
                      </li>
                    </ul>
                  </div>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-3">
                      <div className="font-semibold">Shipping Information</div>
                      <address className="grid gap-0.5 not-italic text-muted-foreground">
                        <span>Liam Johnson</span>
                        <span>1234 Main St.</span>
                        <span>Anytown, CA 12345</span>
                      </address>
                    </div>
                    <div className="grid auto-rows-max gap-3">
                      <div className="font-semibold">Billing Information</div>
                      <div className="text-muted-foreground">Same as shipping address</div>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="grid gap-3">
                    <div className="font-semibold">Customer Information</div>
                    <dl className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">Customer</dt>
                        <dd>Liam Johnson</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">Email</dt>
                        <dd>
                          <a href="mailto:">liam@acme.com</a>
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">Phone</dt>
                        <dd>
                          <a href="tel:">+1 234 567 890</a>
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <Separator className="my-4" />
                  <div className="grid gap-3">
                    <div className="font-semibold">Payment Information</div>
                    <dl className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <dt className="flex items-center gap-1 text-muted-foreground">
                          <CreditCard className="h-4 w-4" />
                          Visa
                        </dt>
                        <dd>**** **** **** 4532</dd>
                      </div>
                    </dl>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
                  <div className="text-xs text-muted-foreground">
                    Updated <time dateTime="2023-11-23">November 23, 2023</time>
                  </div>
                  <Pagination className="ml-auto mr-0 w-auto">
                    <PaginationContent>
                      <PaginationItem>
                        <Button size="icon" variant="outline" className="h-6 w-6">
                          <ChevronLeft className="h-3.5 w-3.5" />
                          <span className="sr-only">Previous Order</span>
                        </Button>
                      </PaginationItem>
                      <PaginationItem>
                        <Button size="icon" variant="outline" className="h-6 w-6">
                          <ChevronRight className="h-3.5 w-3.5" />
                          <span className="sr-only">Next Order</span>
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </CardFooter>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default Dashboard;
