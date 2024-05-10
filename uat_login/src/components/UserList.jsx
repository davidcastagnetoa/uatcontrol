import React, { useCallback, useContext, useEffect, useState } from "react";
import { DataContext } from "../context/DataContext.js";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table.jsx";
import {
  DropdownMenu,
  // DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu.jsx";
import { Button } from "./ui/button.jsx";
import { MoreHorizontal } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.jsx";
import { Badge } from "./ui/badge.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.jsx";
import { ScrollArea } from "./ui/scroll-area.jsx";
import { useToast } from "./ui/use-toast";

const UserList = () => {
  const { getAllUsers, removeUser } = useContext(DataContext);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openToaster, setOpenToaster] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [openDialogId, setOpenDialogId] = useState(null); // Abre cuado de dialogo al borrar al Usuario

  // * Tostada de dialogo
  const { toast } = useToast();

  // * Función para abrir el AlertDialog
  const openDialog = () => setIsDialogOpen(true);

  // * Importa los usuarios del servidor
  const handleGetAllUsers = useCallback(async () => {
    try {
      const user_list = await getAllUsers(); // getAllUsers() es la función que recuperará los usuarios
      setUsers(user_list);
      console.log("Listado de usuarios:", user_list);
    } catch (error) {
      console.error("Hubo un problema al recuperar el Listado de usuarios:", error);
    }
  }, [getAllUsers]);

  //* Elimina un usuario en el servidor
  const handleDeleteUser = async (email) => {
    setIsLoading(true);

    try {
      if (!email) {
        setIsLoading(false);
        throw new Error("Faltan el email del usuario a eliminar");
      }

      // Aqui envias los datos del usuario a borrar de la base de datos del servidor
      const deleteUser = await removeUser(email);

      if (deleteUser) {
        console.log("Usuario eliminada correctamente: ", deleteUser);
        toast({
          variant: "default", //outline
          title: "Usuario Eliminado",
          description: `El usuario ${deleteUser.username} ha sido dado de baja correctamente`,
          open: { openToaster },
        });
        setOpenToaster(true);
      } else {
        throw new Error("No hay respuesta por parte del servidor. Intente más tarde.");
      }

      console.log("Usuario eliminado correctamente.");
    } catch (err) {
      const errorMessage = `Error al eliminar al usuario ${email}`;
      console.warn(err.message);
      setError(errorMessage);

      toast({
        variant: "destructive",
        title: errorMessage,
        description: err.message,
        open: { openToaster },
      });

      console.warn("Toaster mostrado");
      console.error(error);
      setOpenToaster(true);
    } finally {
      handleGetAllUsers(); // Actualiza el listado de Usuarios
      setIsLoading(false); // Termina el indicador de carga
      setIsDialogOpen(null); //Cierra el AlertDialog
    }
  };

  // * Actiualiza los datos del Contexto DataContext
  useEffect(() => {
    handleGetAllUsers(); // Actualiza los datos del usuario disponibles
  }, [handleGetAllUsers]);

  return (
    <>
      {/* LEFT CENTRAL BODY */}
      {/* TABLAS */}
      <Tabs defaultValue="Todos">
        {/* LISTADO DE TABLAS */}
        <TabsList>
          <TabsTrigger value="Todos">Todos</TabsTrigger>
          <TabsTrigger value="Administradores">Administradores</TabsTrigger>
          <TabsTrigger value="Usuarios">Usuarios</TabsTrigger>
        </TabsList>

        {/* TABLA Todos */}
        <TabsContent value="Todos">
          <Card>
            <CardHeader className="px-7">
              <CardTitle>USUARIOS</CardTitle>
              <CardDescription>Listado de usuarios.</CardDescription>
            </CardHeader>

            <CardContent>
              <Table>
                {/* CABECERA DE LA TABLA */}
                <ScrollArea id="ScrollArea">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead className="hidden sm:table-cell">Roles</TableHead>
                      <TableHead className="hidden md:table-cell">Matrícula</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  {/* CUERPO DE LA TABLA */}
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <span className="font-medium">{user.username}</span>
                        </TableCell>

                        <TableCell className="hidden sm:table-cell">
                          <Badge
                            className="text-xs"
                            variant={
                              user.usergroup === "usuario"
                                ? "secondary"
                                : user.usergroup === "administrador"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {user.usergroup.charAt(0).toUpperCase() + user.usergroup.slice(1).toLowerCase()}
                          </Badge>
                        </TableCell>

                        <TableCell className="hidden md:table-cell">{user.matricula}</TableCell>

                        <TableCell className="hidden md:table-cell">{user.email}</TableCell>

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
                              <DropdownMenuItem onSelect={() => setOpenDialogId(user.id)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* AlertDialog que se controla con el estado `isDialogOpen` */}
                          {openDialogId === user.id && (
                            <AlertDialog open={openDialogId === user.id} onOpenChange={() => setOpenDialogId(null)}>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estas seguro de realizar ésta acción?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta accion no puede deshacer. El usuario {user.username} ya no tendrá acceso a esta
                                    aplicacion y se eliminaran de la base de datos todos los recursos asociados a él
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <Button variant="destructive" onClick={() => handleDeleteUser(user.email)}>
                                    Delete
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

        {/* TABLA Administradores */}
        <TabsContent value="Administradores">
          <Card>
            <CardHeader className="px-7">
              <CardTitle>USUARIOS</CardTitle>
              <CardDescription>Listado de usuarios.</CardDescription>
            </CardHeader>

            <CardContent>
              <Table>
                {/* CABECERA DE LA TABLA */}
                <ScrollArea id="ScrollArea">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead className="hidden sm:table-cell">Roles</TableHead>
                      <TableHead className="hidden md:table-cell">Matrícula</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  {/* CUERPO DE LA TABLA */}
                  <TableBody>
                    {users
                      .filter((user) => user.usergroup === "administrador")
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <span className="font-medium">{user.username}</span>
                          </TableCell>

                          <TableCell className="hidden sm:table-cell">
                            <Badge
                              className="text-xs"
                              variant={
                                user.usergroup === "usuario"
                                  ? "secondary"
                                  : user.usergroup === "administrador"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {user.usergroup.charAt(0).toUpperCase() + user.usergroup.slice(1).toLowerCase()}
                            </Badge>
                          </TableCell>

                          <TableCell className="hidden md:table-cell">{user.matricula}</TableCell>

                          <TableCell className="hidden md:table-cell">{user.email}</TableCell>

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
                                <DropdownMenuItem onSelect={openDialog}>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            {isDialogOpen === user.id && (
                              <AlertDialog open={isDialogOpen === user.id} onOpenChange={setIsDialogOpen}>
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
                                      onClick={() => console.log("delete user, Endpoint aun en desarrollo")}
                                    >
                                      Delete
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

        {/* TABLA Usuarios */}
        <TabsContent value="Usuarios">
          <Card>
            <CardHeader className="px-7">
              <CardTitle>USUARIOS</CardTitle>
              <CardDescription>Listado de usuarios.</CardDescription>
            </CardHeader>

            <CardContent>
              <Table>
                {/* CABECERA DE LA TABLA */}
                <ScrollArea id="ScrollArea">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead className="hidden sm:table-cell">Roles</TableHead>
                      <TableHead className="hidden md:table-cell">Matrícula</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  {/* CUERPO DE LA TABLA */}
                  <TableBody>
                    {users
                      .filter((user) => user.usergroup === "usuario")
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <span className="font-medium">{user.username}</span>
                          </TableCell>

                          <TableCell className="hidden sm:table-cell">
                            <Badge
                              className="text-xs"
                              variant={
                                user.usergroup === "usuario"
                                  ? "secondary"
                                  : user.usergroup === "administrador"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {user.usergroup.charAt(0).toUpperCase() + user.usergroup.slice(1).toLowerCase()}
                            </Badge>
                          </TableCell>

                          <TableCell className="hidden md:table-cell">{user.matricula}</TableCell>

                          <TableCell className="hidden md:table-cell">{user.email}</TableCell>

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
                                <DropdownMenuItem onSelect={() => setOpenDialogId(user.id)}>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            {isDialogOpen === user.id && (
                              <AlertDialog open={isDialogOpen === user.id} onOpenChange={setIsDialogOpen}>
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
                                    <Button variant="destructive" onClick={() => handleDeleteUser(user.email)}>
                                      Delete
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

export default UserList;
