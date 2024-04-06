import { useNavigate } from "react-router-dom";
import { useContext } from "react";
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

export function UserNav() {
  const navigate = useNavigate();
  const { authState, logout } = useContext(AuthContext);

  console.log("Valor de authState: " + JSON.stringify(authState));
  console.log("authState.user: ", authState.user);
  const username = authState.user ? authState.user.username : "Invitado";
  const email = authState.user ? authState.user.email : "Invitado@invitado.com";
  const picture = authState.user ? authState.user.picture : "./ruta_invitado_avatar";
  console.log("Valor de username: " + username);
  console.log("Valor de email: " + email);
  console.log("Ruta de picture: " + picture);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-11 w-11">
            {authState.user ? <AvatarImage src={picture} alt="@shadcn" /> : <AvatarImage src={picture} alt="@shadcn" />}
            {/* <AvatarImage src={picture} alt="@shadcn" /> */}
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
