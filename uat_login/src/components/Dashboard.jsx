// Dashboard.js
import React, { useContext, useEffect, useState, useCallback } from "react";
import { DataContext } from "../context/DataContext.js";
import AuthContext from "../context/AuthContext.js";
import { Label } from "./ui/label.jsx";
import { useToast } from "./ui/use-toast.js";
import { Link } from "react-router-dom";
import { Toaster } from "./ui/toaster.jsx";
import { Copy, MoreHorizontal } from "lucide-react";
import { Badge } from "./ui/badge.jsx";
import { Button } from "./ui/button.jsx";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card.jsx";
import {
  DropdownMenu,
  // DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu.jsx";
import { Input } from "./ui/input.jsx";
// import { Pagination, PaginationContent, PaginationItem } from "./ui/pagination";
import { Progress } from "./ui/progress.jsx";
// import { Separator } from "./ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.jsx";
import { ScrollArea } from "./ui/scroll-area.jsx";
import { useNavigate } from "react-router-dom";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog.jsx";

import moment from "moment";
import "moment/locale/es";

function Dashboard() {
  const navigate = useNavigate();
  const { saveUAT, getAllUATs, getUATstadistics, getUserData, removeUAT } = useContext(DataContext);
  const { authState } = useContext(AuthContext);
  const [uatData, setUatData] = useState({
    uat_id: "",
    uat_link: "",
    uat_script: "",
    uat_osa: "",
    uat_status: "",
  });
  const [uats, setUats] = useState([]);
  const [uatStats, setUatStats] = useState([]);
  const [error, setError] = useState("");
  const [openToaster, setOpenToaster] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({});

  const [openDialogId, setOpenDialogId] = useState(null);
  const [openDialogToEditId, setOpenDialogToEditId] = useState(null);

  const [userStatus, setUserStatus] = useState(userData?.privilegio === "administrador" ? "Administrador" : "Usuario");

  const { toast } = useToast();
  moment.locale("es");
  const today = moment().format("D [de] MMMM [de] YYYY");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUatData((preUatData) => ({
      ...preUatData,
      [name]: value,
    }));
  };

  // useEffect se ejecutará después de cada renderizado cuando uatData cambie. Se usa en los Select
  useEffect(() => {
    console.warn("uatData: " + JSON.stringify(uatData));
  }, [uatData]); // Dependencias: Este efecto depende de uatData.

  // * Guarda una UAT en el servidor
  const handleSaveUat = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (!uatData.uat_link || !uatData.uat_script || !uatData.uat_osa || !uatData.uat_status) {
        console.warn("Rellene todos los campos. LINK: ", uatData.uat_link);
        console.warn("Rellene todos los campos. SCRIPT: ", uatData.uat_script);
        console.warn("Rellene todos los campos. OSA: ", uatData.uat_osa);
        console.warn("Rellene todos los campos. STATUS: ", uatData.uat_status);
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

        setUatData({ uat_link: "", uat_osa: "" });

        setOpenToaster(true);
      } else {
        throw new Error("No hay respuesta por parte del servidor. Intente más tarde.");
      }
    } catch (err) {
      const errorMessage = err.message;
      console.log(err.message);
      setError(errorMessage);

      toast({
        variant: "destructive",
        title: "Error al Guardar UAT",
        description: errorMessage,
        open: { openToaster },
      });

      console.log("Toaster mostrado");
      console.error(error);
      setOpenToaster(true);
    } finally {
      handleGetAllUATs();
      handleGetStadisticsUATs();
      setIsLoading(false);
    }
  };

  //* Elimina una UAT en el servidor
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
      console.log(err.message);
      setError(errorMessage);

      toast({
        variant: "destructive",
        title: "Error al Eliminar UAT",
        description: errorMessage,
        open: { openToaster },
      });

      console.log("Toaster mostrado");
      console.error(error);
      setOpenToaster(true);
    } finally {
      handleGetAllUATs(); // Actualiza el listado de UATs en Dashboard
      handleGetStadisticsUATs(); // Actualiza el listado de Estadisticas en Dashboard
      setIsLoading(false); // Termina el indicador de carga
      setOpenDialogId(null); //Cierra el AlertDialog
    }
  };

  // * Editar una UAT en el servidor
  // ! EN DESARROLLO
  const handleEditUAT = (id) => {
    console.warn("El id de la UAT seleccionada es :", id);
  };

  // * Importa todas las UATs del servidor
  const handleGetAllUATs = useCallback(async () => {
    try {
      const uatData = await getAllUATs(); // getAllUATs() es la función que recuperará las UATs, debes incluir la ID, para el proxy
      setUats(uatData);
      console.log("UATs recuperadas correctamente:", uatData);
    } catch (error) {
      console.error("Hubo un problema al recuperar las UATs:", error);
    }
  }, [getAllUATs]);

  // * Importa las estadisticas de las UATs del servidor
  const handleGetStadisticsUATs = useCallback(async () => {
    console.log("Importando estadisticas");
    try {
      const uatStats = await getUATstadistics(); // getUATstadistics() es la función que recuperará las estadiscticas de las UATs
      setUatStats(uatStats);
      console.log("Estadisticas de las UATs recuperadas:", uatStats);
    } catch (error) {
      console.error("Hubo un problema al recuperar las estadísticas de las UATs:", error);
      toast({
        variant: "destructive",
        title: "Error al cargar estadísticas",
        description: error.message,
      });
    }
  }, [getUATstadistics, toast]);

  // * Importa los datos de usuario del servidor
  const handleGetUserData = useCallback(async () => {
    try {
      const user_data = await getUserData(); // getAllUATs() es la función que recuperará las UATs¨
      // console.debug("Datos de usuario recuperados:", user_data);
      setUserData(user_data);
    } catch (error) {
      console.error("Hubo un problema al recuperar los datos del usuario:", error);
    }
  }, [getUserData]);

  // // * Importa los datos del usuario desde el servidor
  // const handleGetUserData = useCallback(async () => {
  //   try {
  //     await getUserData();
  //     console.log("Datos de usuario actualizados en el contexto:", userData);
  //   } catch (error) {
  //     console.error("Hubo un problema al recuperar los datos del usuario:", error);
  //   }
  // }, [getUserData, userData]);

  console.debug("Datos de usuario en userData:", userData);

  // * Actiualiza los datos del Contexto DataContext
  useEffect(() => {
    handleGetAllUATs(); // Actualiza las UATs disponibles,
    handleGetStadisticsUATs(); // Actualiza las estadisticas de las UATs disponibles,
    handleGetUserData(); // Actualiza los datos del usuario disponibles
  }, [handleGetAllUATs, handleGetStadisticsUATs, handleGetUserData]);

  //! Actualiza los datos de privilegios del usuario
  useEffect(() => {
    setUserStatus(userData?.privilegio === "administrador" ? "Administrador" : "Usuario");
  }, [userData]);

  //DEBUGGING
  console.log("Valor de authState: " + JSON.stringify(authState));
  console.log("authState.user: ", authState.user);
  // console.warn("Valor de uats: " + JSON.stringify(uats));
  console.log("Valor de uatStats: " + JSON.stringify(uatStats));
  console.log("Privilegios de usuario: " + userStatus);

  return (
    <>
      {/* LEFT CENTRAL BODY */}
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        {/* TARJETAS SUPERIORES */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {/* TARJETA 1 */}
          {userStatus === "Administrador" && (
            <Card className="sm:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle>Permisos de los técnicos</CardTitle>
                <CardDescription className="max-w-lg text-balance leading-relaxed">
                  Modifica aquí los permisos de los técnicos de procesos registrados y las UATs a las que tienen acceso.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => navigate("/users")}>Modificar Permisos</Button>
              </CardFooter>
            </Card>
          )}

          {/* ESTADISTICAS EN PRODUCCION */}

          {uatStats && uatStats.length > 0 ? (
            uatStats
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
              ))
          ) : (
            <div></div> // Fallback content if uatStats is empty
          )}

          {/* ESTADISTICAS EN REVISION */}
          {uatStats && uatStats.length > 0 ? (
            uatStats
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
              ))
          ) : (
            <div></div> // Fallback content if uatStats is empty
          )}
        </div>

        {/* TABLAS DE UATS*/}
        <Tabs defaultValue="Todas">
          <div className="flex items-center">
            {/* LISTADO DE TABLAS */}
            <TabsList>
              <TabsTrigger value="Todas">Todas</TabsTrigger>
              <TabsTrigger value="En producción">En producción</TabsTrigger>
              <TabsTrigger value="En revisión">En revisión</TabsTrigger>
              <TabsTrigger value="En desarrollo">En desarrollo</TabsTrigger>
            </TabsList>
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
                  <ScrollArea id="ScrollArea">
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
                      {uats.map((uat) => (
                        // console.debug("UAT TODAS Impresa: ", uat),
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
                                uat.status === "En revisión"
                                  ? "outline"
                                  : uat.status === "En producción"
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
                          <TableCell className="hidden md:table-cell">{uat.osa}</TableCell>

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
                                <DropdownMenuItem onSelect={() => setOpenDialogToEditId(uat.id)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setOpenDialogId(uat.id)}>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            {/* AlertDialog que se controla con el estado `isDialogOpen` */}
                            {openDialogId === uat.id && (
                              <AlertDialog open={openDialogId === uat.id} onOpenChange={() => setOpenDialogId(null)}>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This preset will no longer be accessible by you or
                                      others you&apos;ve shared it with.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleDeleteUAT(uat.script, uat.link, uat.osa)}
                                    >
                                      Delete
                                    </Button>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            {/* AlertDialog que se controla con el estado `isDialogOpen`  PARA EDITAR*/}
                            {openDialogToEditId === uat.id && (
                              <AlertDialog
                                open={openDialogToEditId === uat.id}
                                onOpenChange={() => setOpenDialogToEditId(null)}
                              >
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro de esta acción?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This preset will no longer be accessible by you or
                                      others you&apos;ve shared it with.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <Button variant="destructive" onClick={() => handleEditUAT(uat.id)}>
                                      Edit
                                    </Button>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </ScrollArea>
                  {/* PIE DE LA TABLA */}
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TABLA  En producción  */}
          <TabsContent value="En producción">
            <Card>
              <CardHeader className="px-7">
                <CardTitle>UATs</CardTitle>
                <CardDescription>Enlaces de pruebas de scriptings.</CardDescription>
              </CardHeader>

              <CardContent>
                <Table>
                  <ScrollArea id="ScrollArea">
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
                      {uats
                        .filter((uat) => uat.status === "En producción")
                        .map((uat) => (
                          // console.debug("UAT En producción Impresa: ", uat),
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
                                  uat.status === "En revisión"
                                    ? "outline"
                                    : uat.status === "En producción"
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
                            <TableCell className="hidden md:table-cell">{uat.osa}</TableCell>

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
                                  <DropdownMenuItem onSelect={() => setOpenDialogToEditId(uat.id)}>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => setOpenDialogId(uat.id)}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>

                              {/* AlertDialog que se controla con el estado `isDialogOpen` */}
                              {openDialogId === uat.id && (
                                <AlertDialog open={openDialogId === uat.id} onOpenChange={() => setOpenDialogId(null)}>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This preset will no longer be accessible by you or
                                        others you&apos;ve shared it with.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <Button
                                        variant="destructive"
                                        onClick={() => handleDeleteUAT(uat.script, uat.link, uat.osa)}
                                      >
                                        Delete
                                      </Button>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                              {/* AlertDialog que se controla con el estado `isDialogOpen`  PARA EDITAR*/}
                              {openDialogToEditId === uat.id && (
                                <AlertDialog
                                  open={openDialogToEditId === uat.id}
                                  onOpenChange={() => setOpenDialogToEditId(null)}
                                >
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Estás seguro de esta acción?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This preset will no longer be accessible by you or
                                        others you&apos;ve shared it with.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <Button variant="destructive" onClick={() => handleEditUAT(uat.id)}>
                                        Edit
                                      </Button>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </ScrollArea>
                  {/* PIE DE LA TABLA */}
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TABLA  En revisión  */}
          <TabsContent value="En revisión">
            <Card>
              <CardHeader className="px-7">
                <CardTitle>UATs</CardTitle>
                <CardDescription>Enlaces de pruebas de scriptings.</CardDescription>
              </CardHeader>

              <CardContent>
                <Table>
                  <ScrollArea id="ScrollArea">
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
                      {uats
                        .filter((uat) => uat.status === "En revisión")
                        .map((uat) => (
                          // console.debug("UAT En revisión Impresa: ", uat),
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
                                  uat.status === "En revisión"
                                    ? "outline"
                                    : uat.status === "En producción"
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
                            <TableCell className="hidden md:table-cell">{uat.osa}</TableCell>

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
                                  <DropdownMenuItem onSelect={() => setOpenDialogToEditId(uat.id)}>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => setOpenDialogId(uat.id)}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>

                              {/* AlertDialog que se controla con el estado `isDialogOpen` */}
                              {openDialogId === uat.id && (
                                <AlertDialog open={openDialogId === uat.id} onOpenChange={() => setOpenDialogId(null)}>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This preset will no longer be accessible by you or
                                        others you&apos;ve shared it with.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <Button
                                        variant="destructive"
                                        onClick={() => handleDeleteUAT(uat.script, uat.link, uat.osa)}
                                      >
                                        Delete
                                      </Button>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                              {/* AlertDialog que se controla con el estado `isDialogOpen`  PARA EDITAR*/}
                              {openDialogToEditId === uat.id && (
                                <AlertDialog
                                  open={openDialogToEditId === uat.id}
                                  onOpenChange={() => setOpenDialogToEditId(null)}
                                >
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Estás seguro de esta acción?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This preset will no longer be accessible by you or
                                        others you&apos;ve shared it with.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <Button variant="destructive" onClick={() => handleEditUAT(uat.id)}>
                                        Edit
                                      </Button>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </ScrollArea>
                  {/* PIE DE LA TABLA */}
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TABLA  En desarrollo  */}
          <TabsContent value="En desarrollo">
            <Card>
              <CardHeader className="px-7">
                <CardTitle>UATs</CardTitle>
                <CardDescription>Enlaces de pruebas de scriptings.</CardDescription>
              </CardHeader>

              <CardContent>
                <Table>
                  <ScrollArea id="ScrollArea">
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
                      {uats
                        .filter((uat) => uat.status === "En desarrollo")
                        .map((uat) => (
                          // console.debug("UAT En desarrollo Impresa: ", uat),
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
                                  uat.status === "En revisión"
                                    ? "outline"
                                    : uat.status === "En producción"
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
                            <TableCell className="hidden md:table-cell">{uat.osa}</TableCell>

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
                                  <DropdownMenuItem onSelect={() => setOpenDialogToEditId(uat.id)}>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => setOpenDialogId(uat.id)}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>

                              {/* AlertDialog que se controla con el estado `isDialogOpen` */}
                              {openDialogId === uat.id && (
                                <AlertDialog open={openDialogId === uat.id} onOpenChange={() => setOpenDialogId(null)}>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This preset will no longer be accessible by you or
                                        others you&apos;ve shared it with.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <Button
                                        variant="destructive"
                                        onClick={() => handleDeleteUAT(uat.script, uat.link, uat.osa)}
                                      >
                                        Delete
                                      </Button>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                              {/* AlertDialog que se controla con el estado `isDialogOpen`  PARA EDITAR*/}
                              {openDialogToEditId === uat.id && (
                                <AlertDialog
                                  open={openDialogToEditId === uat.id}
                                  onOpenChange={() => setOpenDialogToEditId(null)}
                                >
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Estás seguro de esta acción?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This preset will no longer be accessible by you or
                                        others you&apos;ve shared it with.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <Button variant="destructive" onClick={() => handleEditUAT(uat.id)}>
                                        Edit
                                      </Button>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </ScrollArea>
                  {/* PIE DE LA TABLA */}
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* RIGHT CENTRAL BODY */}
      <div className=" lg:col-span-2">
        {/* FORMULARIO FOR UAT */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-start bg-muted/50">
            <div className="grid gap-0.5">
              <CardTitle className="group flex items-center gap-2 text-lg">
                INTRODUCE LOS DATOS DE LA UAT
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Copy className="h-3 w-3" />
                  <span className="sr-only">Copy Order ID</span>
                </Button>
              </CardTitle>
              <CardDescription>Fecha: {today}</CardDescription>
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
                  <p className="text-[0.8rem] text-muted-foreground">Introduce el enlace para pruebas de la UAT</p>
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
                      <SelectValue placeholder="Selecciona estado" />
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
                      <SelectItem value="Reclamacion Facturacion Complaints">
                        Reclamacion Facturacion Complaints
                      </SelectItem>
                      <SelectItem value="Reclamación Facturacion NO Complaints">
                        Reclamación Facturacion NO Complaints
                      </SelectItem>
                      <SelectItem value="Reclamación de Bajas">Reclamación de Bajas</SelectItem>
                      <SelectItem value="Saltos de Alarma">Saltos de Alarma</SelectItem>
                      <SelectItem value="Gestion Chat Customer Service">Gestion Chat Customer Service</SelectItem>
                      <SelectItem value="Gestión Mails Customer Service">Gestión Mails Customer Service</SelectItem>
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
    </>
  );
}

export default Dashboard;
