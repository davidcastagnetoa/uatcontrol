import React, { useCallback, useContext, useEffect, useState } from "react";
import { DataContext } from "../context/DataContext.js";

const Profile = () => {
  const { getUserData } = useContext(DataContext);
  const [userData, setUserData] = useState({});

  // Importa las UATs del servidor
  const handleGetUserData = useCallback(async () => {
    try {
      const user_data = await getUserData(); // getAllUATs() es la función que recuperará las UATs¨
      // console.debug("Datos de usuario recuperados:", user_data);
      setUserData(user_data);
      console.log("Datos de usuario en userData:", userData);
    } catch (error) {
      console.error("Hubo un problema al recuperar los datos del usuario:", error);
    }
  }, [getUserData]);

  // Actiualiza los datos del Contexto DataContext
  useEffect(() => {
    handleGetUserData(); // Actualiza los datos del usuario disponibles
  }, [handleGetUserData]);

  return (
    <div>
      EN DESARROLLO
      <p>Usuario: {userData.username}</p>
      <p>Email: {userData.email}</p>
      <p>Matricula: {userData.matricula}</p>
      <p>Ruta de imagen: {userData.picture}</p>
      <p>Nivel: {userData.privilegio}</p>
    </div>
  );
};

export default Profile;
