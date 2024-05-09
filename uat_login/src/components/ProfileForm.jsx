import React, { useCallback, useContext, useEffect, useState } from "react";
import { DataContext } from "../context/DataContext.js";
import { useToast } from "./ui/use-toast.js";
import { Input } from "./ui/input.jsx";
import { Label } from "./ui/label.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.jsx";
import { Button } from "./ui/button.jsx";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form.jsx";

const ProfileForm = () => {
  const [openToaster, setOpenToaster] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const { upgradeUserData, getUserData } = useContext(DataContext);
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    matricula: "",
    privilegio: "",
  });

  const [userStatus, setUserStatus] = useState(userData.privilegio === "administrador" ? "Administrador" : "Usuario");

  // * Importa los datos del usuario desde el servidor
  const handleGetUserData = useCallback(async () => {
    try {
      const user_data = await getUserData(); // getAllUATs() es la función que recuperará las UATs¨
      console.warn("Datos de usuario recuperados:", user_data);
      setUserData(user_data);
      console.log("Datos de usuario en userData:", userData);
    } catch (error) {
      console.error("Hubo un problema al recuperar los datos del usuario:", error);
    }
  }, [getUserData]);

  // * Actualiza los datos del Contexto DataContext
  useEffect(() => {
    handleGetUserData(); // Actualiza los datos del usuario disponibles
  }, [handleGetUserData]);

  // * useEffect se ejecutará después de cada renderizado cuando userData cambie. Se usa para los form
  useEffect(() => {
    console.warn("userData: " + JSON.stringify(userData));
    setUserStatus(userData.privilegio === "administrador" ? "Administrador" : "Usuario");
  }, [userData]); // Dependencias: Este efecto depende de uatData.

  // * Actualiza los datos del usuario en la DB
  const handleUpgradeUser = async (e) => {
    e.preventDefault();
    console.log("Upgrade user");
    setIsLoading(true);

    try {
      if (!userData.username || !userData.matricula || !userData.privilegio) {
        console.warn("Rellene todos los campos. Username: ", userData.uat_link);
        console.warn("Rellene todos los campos. Matricula: ", userData.uat_osa);
        console.warn("Rellene todos los campos. Privilegio: ", userData.uat_status);
        setIsLoading(false);
        throw new Error("Rellene todos los campos.");
      }
      const upgradeUser = await upgradeUserData(userData.username, userData.matricula, userData.privilegio);

      if (upgradeUser) {
        console.log("Usuario actualizado correctamente: ", upgradeUser);
        toast({
          variant: "default", //outline
          title: "Usuario actualizado correctamente",
          // description: "",
          open: { openToaster },
        });
        setUserData({ username: "", email: "", matricula: "" });
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
        title: "Error al actualizar perfil de usuario",
        description: errorMessage,
        open: { openToaster },
      });
      console.warn("Toaster mostrado");
      console.error(error);
      setOpenToaster(true);
    } finally {
      handleGetUserData();
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((preUserData) => ({
      ...preUserData,
      [name]: value,
    }));
  };

  return (
    <div className="flex-1 lg:max-w-2xl">
      <div className="space-y-6">
        {userData.picture && <img src={userData.picture} alt="avatar" className="rounded-full" />}
        <form onSubmit={handleUpgradeUser} className="space-y-8">
          <div className="space-y-2">
            <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Nombre de usuario
            </Label>
            <Input
              id="username"
              name="username"
              value={userData.username}
              onChange={handleChange}
              placeholder="Username"
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              // disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email
            </Label>
            <Input
              disabled
              id="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              placeholder="Email"
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              // disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Matrícula
            </Label>
            <Input
              id="matricula"
              name="matricula"
              value={userData.matricula}
              onChange={handleChange}
              placeholder="Matricula"
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              // disabled={isLoading}
            />
          </div>
          {userStatus === "Administrador" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Selecciona el nivel del usuario
              </Label>
              <Select
                name="uat_script"
                onValueChange={(value) => handleChange({ target: { name: "uat_script", value } })}
              >
                <SelectTrigger id="status" aria-label="Select status">
                  <SelectValue placeholder={`Nivel actual : ${userData.privilegio}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="usuario">Usuario</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Button type="submit">Actualizar Perfil</Button>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
