import React, { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";

// UI
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area.jsx";
import { useToast } from "./ui/use-toast";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

// Context
import { DataContext } from "../context/DataContext.js";

const UatsList = () => {
  const { getAllUATs, removeUAT } = useContext(DataContext);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openToaster, setOpenToaster] = useState(false);
  const [uats, setUats] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [openDialogId, setOpenDialogId] = useState(null); // Abre cuado de dialogo al borrar UAT
  const [openDialogToEditId, setOpenDialogToEditId] = useState(null);
  const [userStatus, setUserStatus] = useState(userData.privilegio === "administrador" ? "Administrador" : "Usuario");

  // * Función para abrir el AlertDialog
  const openDialog = () => setIsDialogOpen(true);

  // * Tostada de dialogo
  const { toast } = useToast();

  // * Importa las UATs del servidor
  const handleGetAllUATs = useCallback(async () => {
    try {
      const uatData = await getAllUATs(); // getAllUATs() es la función que recuperará las UATs
      setUats(uatData);
      console.log("UATs recuperadas correctamente:", uatData);
    } catch (error) {
      console.error("Hubo un problema al recuperar las UATs:", error);
    }
  }, [getAllUATs]);

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
      handleGetAllUATs(); // Actualiza el listado de UATs en Dashboard
      setIsLoading(false); // Termina el indicador de carga
      setOpenDialogId(null); //Cierra el AlertDialog
    }
  };

  // * Editar una UAT en el servidor
  // ! EN DESARROLLO
  const handleEditUAT = (id) => {
    console.warn("El id de la UAT seleccionada es :", id);
  };

  // * Actiualiza los datos del Contexto DataContext
  useEffect(() => {
    handleGetAllUATs(); // Actualiza las UATs disponibles,
  }, [handleGetAllUATs]);

  // * Actualiza el estado de usuario
  useEffect(() => {
    setUserStatus(userData.privilegio === "administrador" ? "Administrador" : "Usuario");
  }, [userData]);

  return (
    <>
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
      </Tabs>
    </>
  );
};

export default UatsList;
