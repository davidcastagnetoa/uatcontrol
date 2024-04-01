// Dashboard.js
import React, { useContext, useEffect } from "react";
import { DataContext } from "../context/DataContext.js";
import AuthContext from "../context/AuthContext";
import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { Toaster } from "./ui/toaster";
import { UserNav } from "./UserNav.jsx";

function Dashboard() {
  const { save } = useContext(DataContext);
  const { authState, logout } = useContext(AuthContext);
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
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back! {username}</h2>
          <p className="text-muted-foreground">Listado de UATs</p>
          <p className="text-muted-foreground">Email: {email} </p>
        </div>
        <div className="flex items-center space-x-2">
          <UserNav />
        </div>
      </div>

      <div>
        <form onSubmit={handleSaveUat} className="flex flex-col gap-1">
          <Label>Introduce enlace de UAT</Label>
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
          <Label>Introduce scripting al que pertenece</Label>
          <Input
            id="script"
            name="uat_script"
            value={uatData.uat_script}
            onChange={handleChange}
            placeholder="Introduce Script al que pertenece la UAT"
            type="text"
            autoCapitalize="none"
            autoCorrect="off"
            // disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            Guardar
          </button>
        </form>
      </div>
      {/* <DataTable data={tasks} columns={columns} /> */}
      <Toaster />
    </div>
  );
}

export default Dashboard;
