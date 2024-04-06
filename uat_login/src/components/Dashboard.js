// Dashboard.js
import React, { useContext, useEffect } from "react";
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
  MoreHorizontal,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

function Dashboard() {
  const { saveUAT, getAllUATs, getUATstadistics, removeUAT } = useContext(DataContext);
  const { authState } = useContext(AuthContext);
  const [uatData, setUatData] = useState({ uat_link: "", uat_script: "", uat_osa: "", uat_status: "" });
  const [uats, setUats] = useState([]);
  const [uatStats, setUatStats] = useState([]);
  const [error, setError] = useState("");
  const [openToaster, setOpenToaster] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  console.log("Valor de authState: " + JSON.stringify(authState));
  console.log("authState.user: ", authState.user);

  const username = authState.user ? authState.user.username : "Invitado";
  const email = authState.user ? authState.user.email : "Invitado@invitado.com";
  const picture = authState.user ? authState.user.picture : "./ruta_invitado_avatar";
  // console.debug("Valor de username: " + username);
  // console.debug("Valor de email: " + email);
  // console.debug("Ruta de picture: " + picture);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUatData((preUatData) => ({
      ...preUatData,
      [name]: value,
    }));
  };

  // Guarda una UAT en el servidor
  const handleSaveUat = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (!uatData.uat_link || !uatData.uat_script || !uatData.uat_osa || !uatData.uat_status) {
        setIsLoading(false);
        throw new Error("Rellene todos los campos.");
      }
      // Aqui envias los datos al servidor para almacenarlos en la base de datos
      const saveUat = await saveUAT(uatData.uat_link, uatData.uat_script, uatData.uat_osa, uatData.uat_status);
      if (saveUat) {
        console.log("UAT guardada correctamente: ", saveUat);
        toast({
          variant: "default", //outline
          title: "Enlace guardado correctamente",
          // description: "",
          open: { openToaster },
        });
        setUatData({ uat_link: "", uat_script: "", uat_osa: "", uat_status: "" });
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
      handleGetAllUATs();
      handleGetStadisticsUATs();
      setIsLoading(false); // Termina el indicador de carga
    }
  };

  // Elimina una UAT en el servidor
  const handleDeleteUAT = async (script, link, osa) => {
    setIsLoading(true);

    try {
      if (!link || !script || !osa) {
        setIsLoading(false);
        throw new Error("Faltan datos de UAT a eliminar");
      }

      // Aqui envias los datos de la UAT a borrar de la base de datos del servidor
      const deleteUat = await removeUAT(script, link, osa);

      if (deleteUat) {
        console.log("UAT eliminada correctamente: ", deleteUat);
        toast({
          variant: "default", //outline
          title: "Enlace eliminado correctamente",
          // description: "",
          open: { openToaster },
        });
        setOpenToaster(true);
      } else {
        throw new Error("No hay respuesta por parte del servidor. Intente más tarde.");
      }

      console.log("UAT eliminada correctamente.");
    } catch (err) {
      const errorMessage = "Error al eliminar la UAT";
      console.warn(err.message);
      setError(errorMessage);

      toast({
        variant: "destructive",
        title: "Error al Eliminar UAT",
        description: errorMessage,
        open: { openToaster },
      });

      console.warn("Toaster mostrado");
      console.error(error);
      setOpenToaster(true);
    } finally {
      handleGetAllUATs(); // Actualiza el listado en Dashboard
      handleGetStadisticsUATs();
      setIsLoading(false); // Termina el indicador de carga
    }
  };

  // Importa las UATs del servidor
  const handleGetAllUATs = async () => {
    try {
      const uatData = await getAllUATs(); // getAllUATs() es la función que recuperará las UATs
      setUats(uatData);
      console.log("UATs recuperadas correctamente:", uatData);
    } catch (error) {
      console.error("Hubo un problema al recuperar las UATs:", error);
    }
  };

  // Importa las estadisticas de las UATs del servidor
  const handleGetStadisticsUATs = async () => {
    console.warn("Importando estadisticas");
    try {
      const uatStats = await getUATstadistics(); // getUATstadistics() es la función que recuperará las estadiscticas de las UATs
      setUatStats(uatStats);
      console.log("Estadisticas de las UATs recuperadas:", uatStats);
    } catch (error) {
      console.error("Hubo un problema al recuperar las UATs:", error);
    }
  };

  console.log("Valor de uats: " + JSON.stringify(uats));
  console.log("Valor de uatStats: " + JSON.stringify(uatStats));

  // Actiualiza los datos del Contexto DataContext
  useEffect(() => {
    handleGetAllUATs(); // Actualiza las UATs disponibles,
    handleGetStadisticsUATs(); // Actualiza las estadisticas de las UATs disponibles,
  }, []);

  return (
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

            {/* UATs */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/uats"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Package className="h-5 w-5" />
                  <span className="sr-only">UATs</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">UATs</TooltipContent>
            </Tooltip>

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
                  to="/settings"
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

                  {/* Orders Aside Link */}
                  {/* <Link to="#" className="flex items-center gap-4 px-2.5 text-foreground">
                    <ShoppingCart className="h-5 w-5" />
                    Orders
                  </Link> */}

                  {/* UATs Aside Link */}
                  <Link
                    to="/uats"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <Package className="h-5 w-5" />
                    UATs
                  </Link>

                  {/* Profile Aside Link */}
                  <Link
                    to="/profile"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <Users2 className="h-5 w-5" />
                    Profile
                  </Link>

                  {/* Settings Aside Link */}
                  <Link
                    to="/settings"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  >
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
                    <Link to="/dashboard">Dashboard</Link>
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

          {/* MAIN */}
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-4 xl:grid-cols-4">
            {/* LEFT CENTRAL BODY */}
            <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
              {/* TARJETAS SUPERIORES */}
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {/* TARJETA 1 */}
                <Card className="sm:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle>Permisos de usuarios</CardTitle>
                    <CardDescription className="max-w-lg text-balance leading-relaxed">
                      Modifica aqui los permisos de los usuarios registrados y las UATs a las que tienen acceso.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button>Modificar Permisos</Button>
                  </CardFooter>
                </Card>

                {/* ESTADISTICAS EN PRODUCCION */}
                {uatStats
                  .filter((stat) => stat.status === "En producción")
                  .map((stat) => (
                    <Card key={stat.status}>
                      <CardHeader className="pb-2">
                        <CardDescription>UATs {stat.status}</CardDescription>
                        <CardTitle className="text-4xl">{stat.count}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs text-muted-foreground">
                          {stat.percentage}% {stat.status}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Progress value={stat.percentage} aria-label={`${stat.percentage}% increase`} />
                      </CardFooter>
                    </Card>
                  ))}

                {/* ESTADISTICAS EN REVISION */}
                {uatStats
                  .filter((stat) => stat.status === "En revisión")
                  .map((stat) => (
                    <Card key={stat.status}>
                      <CardHeader className="pb-2">
                        <CardDescription>UATs {stat.status}</CardDescription>
                        <CardTitle className="text-4xl">{stat.count}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs text-muted-foreground">
                          {stat.percentage}% {stat.status}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Progress value={stat.percentage} aria-label={`${stat.percentage}% increase`} />
                      </CardFooter>
                    </Card>
                  ))}
              </div>

              {/* TABLAS */}
              <Tabs defaultValue="Todas">
                <div className="flex items-center">
                  {/* LISTADO DE TABLAS */}
                  <TabsList>
                    <TabsTrigger value="Todas">Todas</TabsTrigger>
                    <TabsTrigger value="En producción">En producción</TabsTrigger>
                    <TabsTrigger value="En revisión">En revisión</TabsTrigger>
                    <TabsTrigger value="En desarrollo">En desarrollo</TabsTrigger>
                  </TabsList>
                  {/* <div className="ml-auto flex items-center gap-2"> */}
                  {/* FILTRAR */}
                  {/* <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 gap-1 text-sm">
                          <ListFilter className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only">Filtrar</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filtrado por</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked>En producción</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>En revisión</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>En desarrollo</DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu> */}
                  {/* Export Button */}
                  {/* <Button size="sm" variant="outline" className="h-7 gap-1 text-sm">
                      <File className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only">Export</span>
                    </Button> */}
                  {/* </div> */}
                </div>

                {/* TABLA Todas */}
                <TabsContent value="Todas">
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
                            <TableHead className="hidden md:table-cell">OSA</TableHead>
                            <TableHead>
                              <span className="sr-only">Actions</span>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        {/* CUERPO DE LA TABLA */}
                        <TableBody>
                          {/* Fila 1 */}
                          {/* <TableRow className="bg-accent"></TableCell>*/}
                          {uats.map(
                            (uat) => (
                              console.log("UAT Impresa: ", uat),
                              (
                                <TableRow key={uat.id}>
                                  {/* Columna de scripting */}
                                  <TableCell>
                                    <div className="font-medium">{uat.script}</div>
                                    <div className="hidden text-sm text-muted-foreground md:inline">
                                      <Link to={uat.link}>Click aquí para acceder</Link>
                                    </div>
                                  </TableCell>

                                  {/* Columna de estados */}
                                  <TableCell className="hidden sm:table-cell">
                                    <Badge
                                      className="text-xs"
                                      variant={
                                        uat.status == "En revisión"
                                          ? "outline"
                                          : uat.status == "En producción"
                                          ? "secondary"
                                          : "destructive"
                                      }
                                    >
                                      {uat.status}
                                    </Badge>
                                  </TableCell>

                                  {/* Columna de Fecha */}
                                  <TableCell className="hidden md:table-cell">2023-06-23</TableCell>

                                  {/* Columna de OSA */}
                                  <TableCell className="text-right">{uat.osa}</TableCell>

                                  {/* Columna de acciones */}
                                  <TableCell>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                          <MoreHorizontal className="h-4 w-4" />
                                          <span className="sr-only">Toggle menu</span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleDeleteUAT(uat.script, uat.link, uat.osa)}
                                        >
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              )
                            )
                          )}
                        </TableBody>
                        {/* PIE DE LA TABLA */}
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                {/* TABLA En producción */}
                <TabsContent value="En producción">
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
                            <TableHead className="hidden md:table-cell">OSA</TableHead>
                            <TableHead>
                              <span className="sr-only">Actions</span>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        {/* CUERPO DE LA TABLA */}
                        <TableBody>
                          {/* Fila 1 */}
                          {/* <TableRow className="bg-accent"></TableCell>*/}
                          {uats
                            .filter((uat) => uat.status === "En producción")
                            .map(
                              (uat) => (
                                console.log("UAT Impresa: ", uat),
                                (
                                  <TableRow key={uat.id}>
                                    {/* Columna de Scripting */}
                                    <TableCell>
                                      <div className="font-medium">{uat.script}</div>
                                      <div className="hidden text-sm text-muted-foreground md:inline">
                                        <Link to={uat.link}>Click aquí para acceder</Link>
                                      </div>
                                    </TableCell>

                                    {/* Columna de Estados */}
                                    <TableCell className="hidden sm:table-cell">
                                      <Badge
                                        className="text-xs"
                                        variant={
                                          uat.status == "En revisión"
                                            ? "outline"
                                            : uat.status == "En producción"
                                            ? "secondary"
                                            : "destructive"
                                        }
                                      >
                                        {uat.status}
                                      </Badge>
                                    </TableCell>

                                    {/* Columna de Fecha */}
                                    <TableCell className="hidden md:table-cell">2023-06-23</TableCell>

                                    {/* Columna de OSA */}
                                    <TableCell className="text-right">{uat.osa}</TableCell>

                                    {/* Columna de acciones */}
                                    <TableCell>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                          <DropdownMenuItem>Edit</DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => handleDeleteUAT(uat.script, uat.link, uat.osa)}
                                          >
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                )
                              )
                            )}
                        </TableBody>
                        {/* PIE DE LA TABLA */}
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                {/* TABLA En revisión */}
                <TabsContent value="En revisión">
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
                            <TableHead className="hidden md:table-cell">OSA</TableHead>
                            <TableHead>
                              <span className="sr-only">Actions</span>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        {/* CUERPO DE LA TABLA */}
                        <TableBody>
                          {/* Fila 1 */}
                          {/* <TableRow className="bg-accent"></TableCell>*/}
                          {uats
                            .filter((uat) => uat.status === "En revisión")
                            .map(
                              (uat) => (
                                console.log("UAT Impresa: ", uat),
                                (
                                  <TableRow key={uat.id}>
                                    {/* Columna de Scripting */}
                                    <TableCell>
                                      <div className="font-medium">{uat.script}</div>
                                      <div className="hidden text-sm text-muted-foreground md:inline">
                                        <Link to={uat.link}>Click aquí para acceder</Link>
                                      </div>
                                    </TableCell>

                                    {/* Columna de Estados */}
                                    <TableCell className="hidden sm:table-cell">
                                      <Badge
                                        className="text-xs"
                                        variant={
                                          uat.status == "En revisión"
                                            ? "outline"
                                            : uat.status == "En producción"
                                            ? "secondary"
                                            : "destructive"
                                        }
                                      >
                                        {uat.status}
                                      </Badge>
                                    </TableCell>

                                    {/* Columna de Fecha */}
                                    <TableCell className="hidden md:table-cell">2023-06-23</TableCell>

                                    {/* Columna de OSA */}
                                    <TableCell className="text-right">{uat.osa}</TableCell>

                                    {/* Columna de acciones */}
                                    <TableCell>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                          <DropdownMenuItem>Edit</DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => handleDeleteUAT(uat.script, uat.link, uat.osa)}
                                          >
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                )
                              )
                            )}
                        </TableBody>
                        {/* PIE DE LA TABLA */}
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                {/* TABLA En desarrollo */}
                <TabsContent value="En desarrollo">
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
                            <TableHead className="hidden md:table-cell">OSA</TableHead>
                            <TableHead>
                              <span className="sr-only">Actions</span>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        {/* CUERPO DE LA TABLA */}
                        <TableBody>
                          {/* Fila 1 */}
                          {/* <TableRow className="bg-accent"></TableCell>*/}
                          {uats
                            .filter((uat) => uat.status === "En desarrollo")
                            .map(
                              (uat) => (
                                console.log("UAT Impresa: ", uat),
                                (
                                  <TableRow key={uat.id}>
                                    {/* Columna de Scripting */}
                                    <TableCell>
                                      <div className="font-medium">{uat.script}</div>
                                      <div className="hidden text-sm text-muted-foreground md:inline">
                                        <Link to={uat.link}>Click aquí para acceder</Link>
                                      </div>
                                    </TableCell>

                                    {/* Columna de Estados */}
                                    <TableCell className="hidden sm:table-cell">
                                      <Badge
                                        className="text-xs"
                                        variant={
                                          uat.status == "En revisión"
                                            ? "outline"
                                            : uat.status == "En producción"
                                            ? "secondary"
                                            : "destructive"
                                        }
                                      >
                                        {uat.status}
                                      </Badge>
                                    </TableCell>

                                    {/* Columna de Fecha */}
                                    <TableCell className="hidden md:table-cell">2023-06-23</TableCell>

                                    {/* Columna de OSA */}
                                    <TableCell className="text-right">{uat.osa}</TableCell>

                                    {/* Columna de acciones */}
                                    <TableCell>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                          <DropdownMenuItem>Edit</DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => handleDeleteUAT(uat.script, uat.link, uat.osa)}
                                          >
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                )
                              )
                            )}
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
                    {/* <Button size="sm" variant="outline" className="h-8 gap-1">
                      <Truck className="h-3.5 w-3.5" />
                      <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">Track Order</span>
                    </Button> */}
                    {/* <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="outline" className="h-8 w-8">
                          <MoreVertical className="h-3.5 w-3.5" />
                          <span className="sr-only">More</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Export</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Trash</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu> */}
                  </div>
                </CardHeader>

                <CardContent className="p-6 text-sm">
                  <div className="grid gap-3">
                    {/* Formulario para subida de UAT */}
                    <form onSubmit={handleSaveUat} className="grid gap-3">
                      {/* URL UAT */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          URL UAT
                        </Label>
                        <p className="text-[0.8rem] text-muted-foreground">
                          Introduce el enlace para pruebas de la UAT
                        </p>
                        <Input
                          id="link"
                          name="uat_link"
                          value={uatData.uat_link}
                          onChange={handleChange}
                          placeholder="Introduce Enlace UAT"
                          type="text"
                          autoCapitalize="none"
                          autoCorrect="off"
                          // disabled={isLoading}
                        />
                      </div>

                      {/* Estado */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Estado
                        </Label>
                        <p className="text-[0.8rem] text-muted-foreground">Selecciona el estado de la OSA</p>
                        <Select
                          name="uat_status"
                          onValueChange={(value) => handleChange({ target: { name: "uat_status", value } })}
                        >
                          <SelectTrigger id="status" aria-label="Select status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="En desarrollo">En desarrollo</SelectItem>
                            <SelectItem value="En revisión">En revisión</SelectItem>
                            <SelectItem value="En producción">En producción</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Scripting */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Scripting
                        </Label>
                        <p className="text-[0.8rem] text-muted-foreground">Introduce scripting al que pertenece</p>
                        <Select
                          name="uat_script"
                          onValueChange={(value) => handleChange({ target: { name: "uat_script", value } })}
                        >
                          <SelectTrigger id="status" aria-label="Select status">
                            <SelectValue placeholder="Selecciona el Scripting al que pertenece" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PC Customer Care Completo">PC Customer Care Completo</SelectItem>
                            <SelectItem value="Customer Averías">Customer Averías</SelectItem>
                            <SelectItem value="Fallo de supervisión">Fallo de supervisión</SelectItem>
                            <SelectItem value="Humanización de Robos">Humanización de Robos</SelectItem>
                            <SelectItem value="MANTENIMIENTO PILOTO Saltos de alarma">
                              MANTENIMIENTO PILOTO Saltos de alarma
                            </SelectItem>
                            <SelectItem value="No Capta No Salta">No Capta No Salta</SelectItem>
                            <SelectItem value="Nuevo Proceso Tamper">Nuevo Proceso Tamper</SelectItem>
                            <SelectItem value="Nuevo Proceso de FFAA">Nuevo Proceso de FFAA</SelectItem>
                            <SelectItem value="PCC - ODC">PCC - ODC</SelectItem>
                            <SelectItem value="Proceso Antiguo Tamper">Proceso Antiguo Tamper</SelectItem>
                            <SelectItem value="Proceso cc Ruidos Extraños">Proceso cc Ruidos Extraños</SelectItem>
                            <SelectItem value="Reclamación Facturacion">Reclamación Facturacion</SelectItem>
                            <SelectItem value="Reclamación de Bajas">Reclamación de Bajas</SelectItem>
                            <SelectItem value="Saltos de Alarma">Saltos de Alarma</SelectItem>
                            <SelectItem value="Gestion Chat Customer Service">Gestion Chat Customer Service</SelectItem>
                            <SelectItem value="Gestión Mails Customer Service">
                              Gestión Mails Customer Service
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* OSA */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          OSA
                        </Label>
                        <p className="text-[0.8rem] text-muted-foreground">Introduce la OSA a la que pertenece</p>
                        <Input
                          id="osa"
                          name="uat_osa"
                          value={uatData.uat_osa}
                          onChange={handleChange}
                          placeholder="Introduce Script al que pertenece la UAT"
                          type="text"
                          autoCapitalize="none"
                          autoCorrect="off"
                          // disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Button type="submit" disabled={isLoading}>
                          Guardar
                        </Button>
                      </div>
                    </form>
                    {/* <div className="font-semibold">Order Details</div>
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
                    </ul> */}
                  </div>
                  {/* <Separator className="my-4" />
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
                  </div> */}
                </CardContent>
                <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
                  {/* <div className="text-xs text-muted-foreground">
                    Updated <time dateTime="2023-11-23">November 23, 2023</time>
                  </div> */}
                  {/* <Pagination className="ml-auto mr-0 w-auto">
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
                  </Pagination> */}
                </CardFooter>
              </Card>
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default Dashboard;
