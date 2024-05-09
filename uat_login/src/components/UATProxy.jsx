import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UATProxy = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const fetchProxy = async () => {
      try {
        // Suponiendo que necesitas pasar algún identificador de UAT, aquí se podría agregar
        const response = await fetch("/api/proxy?uatId=123", {
          method: "GET",
          headers: {
            // Tus headers necesarios, como tokens de autenticación si es necesario
          },
        });

        // Si el servidor responde redireccionando, puedes manejarlo aquí, pero generalmente
        // el servidor se encargará de la redirección directamente si es configurado para hacerlo.
        if (!response.ok) {
          throw new Error("Failed to fetch UAT");
        }
      } catch (error) {
        console.error("Error accessing UAT:", error);
        navigate("/error"); // Redirige a una ruta de error si algo falla
      }
    };

    fetchProxy();
  }, [navigate]);

  return <div>Loading UAT...</div>;
};

export default UATProxy;
