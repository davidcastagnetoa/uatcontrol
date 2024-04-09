import React, { useCallback, useContext, useEffect, useState } from "react";
import { DataContext } from "../context/DataContext.js";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import {
  DropdownMenu,
  // DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area.jsx";
import AsideBar from "./AsideBar.jsx";
import Header from "./Header.jsx";

const UserList = () => {
  const { getAllUsers } = useContext(DataContext);
  const [users, setUsers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Función para abrir el AlertDialog
  const openDialog = () => setIsDialogOpen(true);

  // Importa las UATs del servidor
  const handleGetAllUsers = useCallback(async () => {
    try {
      const user_list = await getAllUsers(); // getAllUATs() es la función que recuperará las UATs
      setUsers(user_list);
      console.log("Listado de usuarios:", user_list);
    } catch (error) {
      console.error("Hubo un problema al recuperar el Listado de usuarios:", error);
    }
  }, [getAllUsers]);

  // Actiualiza los datos del Contexto DataContext
  useEffect(() => {
    handleGetAllUsers(); // Actualiza los datos del usuario disponibles
  }, [handleGetAllUsers]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* LEFT SIDE */}
      <AsideBar />

      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 md:h-full lg:h-screen">
        {/* HEADER */}
        <Header page="Users" />
        {/* MAIN */}
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 ">
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
                                  <DropdownMenuItem onSelect={openDialog}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>

                              {isDialogOpen && (
                                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                                      <Button variant="destructive" onClick={() => console.log("delete user")}>
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

                                {isDialogOpen && (
                                  <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This preset will no longer be accessible by you
                                          or others you&apos;ve shared it with.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <Button variant="destructive" onClick={() => console.log("delete user")}>
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
                                    <DropdownMenuItem onSelect={openDialog}>Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>

                                {isDialogOpen && (
                                  <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This preset will no longer be accessible by you
                                          or others you&apos;ve shared it with.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <Button variant="destructive" onClick={() => console.log("delete user")}>
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
        </main>
      </div>
    </div>
  );
};

export default UserList;
