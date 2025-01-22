import { useNavigate } from "react-router-dom";
import { useCallback, useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { DataContext } from "../context/DataContext";

export function UserNav() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { getUserData, userData } = useContext(DataContext);
  const [userAvatar, setUserAvatar] = useState(localStorage.getItem("userAvatar") || "");

  // * Importa los datos del usuario desde el servidor
  const handleGetUserData = useCallback(async () => {
    try {
      await getUserData();
      console.log("Datos de usuario actualizados en el contexto:", userData);
    } catch (error) {
      console.error("Hubo un problema al recuperar los datos del usuario:", error);
    }
  }, [getUserData, userData]);

  // * Actualiza los datos del Contexto DataContext
  useEffect(() => {
    handleGetUserData();
  }, [handleGetUserData]);

  // Función para obtener el avatar del usuario
  const fetchUserAvatar = async () => {
    try {
      const UserDataFromDB = await getUserData();
      const UserAvatar = UserDataFromDB.picture;
      console.log("UserAvatar :", UserAvatar);
      localStorage.setItem("userAvatar", UserAvatar); // Cachear la URL del avatar
      return UserAvatar;
    } catch (error) {
      console.error("UserAvatar: Error fetching user avatar:", error);
      return undefined;
    }
  };

  // Efecto para obtener el avatar del usuario
  useEffect(() => {
    const fetchAvatar = async () => {
      const avatar = await fetchUserAvatar();
      console.log("Avatar: ", avatar);
      setUserAvatar(avatar);
    };
    if (!userAvatar) {
      fetchAvatar();
    }
  }, [userAvatar]);

  const username = userData?.username ? userData.username : "Invitado";
  const email = userData?.email ? userData.email : "Invitado@invitado.com";
  // const picture = userData?.picture ? userData.picture : "./ruta_invitado_avatar";

  // console.log("Valor de username: " + username);
  // console.log("Valor de email: " + email);
  // console.log("Ruta de picture: " + picture);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-11 w-11">
            <AvatarImage src={userAvatar} alt="@shadcn" />
            <AvatarFallback>USER</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{username}</p>
            {email !== undefined && <p className="text-xs leading-none text-muted-foreground">{email}</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {/* Perfil */}
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            Perfil
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>

          {/* Configuración */}
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            Configuración
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Cerrar Sesion */}
        <DropdownMenuItem onClick={logout}>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
