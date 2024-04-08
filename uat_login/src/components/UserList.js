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
import {
  // ChevronLeft,
  // ChevronRight,
  Copy,
  // CreditCard,
  // File,
  Home,
  LineChart,
  MoreHorizontal,
  // ListFilter,
  // MoreVertical,
  Package,
  Package2,
  PanelLeft,
  Search,
  Settings,
  // ShoppingCart,
  // Truck,
  Users2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Badge } from "./ui/badge";
import { type } from "@testing-library/user-event/dist/type/index.js";

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
    <TableBody>
      EN DESARROLLO
      {users.map((user) => (
        <TableRow key={user.id}>
          <TableCell>
            <div className="font-medium">{user.username}</div>
          </TableCell>

          <TableCell className="hidden sm:table-cell">
            <Badge
              className="text-xs"
              variant={
                user.usergroup === "En revisión"
                  ? "outline"
                  : user.usergroup === "En producción"
                  ? "secondary"
                  : "destructive"
              }
            >
              {user.usergroup}
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
                      This action cannot be undone. This preset will no longer be accessible by you or others
                      you&apos;ve shared it with.
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
  );
};

export default UserList;
