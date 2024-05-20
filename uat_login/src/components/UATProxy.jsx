import React, { useEffect, useContext, useState } from "react";
import { DataContext } from "../context/DataContext";
import { useNavigate, useLocation } from "react-router-dom";

const UATProxy = () => {
  const { fetchUATProxy } = useContext(DataContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { uatId } = location.state || {}; // Asegúrate de que location.state no sea undefined
  const [uatUrl, setUatUrl] = useState(null);

  console.warn("UAT URL:", uatUrl);

  useEffect(() => {
    if (!uatId) {
      console.error("No UAT ID provided");
      navigate("/error"); // Redirige si no se proporciona un ID
      return;
    }

    const proxyUAT = async () => {
      try {
        const uatLink = await fetchUATProxy(uatId);
        setUatUrl(uatLink);
      } catch (error) {
        console.error("Error accessing UAT:", error);
        navigate("/error"); //! Redirige a una ruta 404 si algo falla
      }
    };

    proxyUAT();
  }, [uatId, navigate, fetchUATProxy]);

  return (
    <>
      {uatUrl ? (
        <iframe src={uatUrl} style={{ width: "100%", height: "100vh", border: "none" }} title="UAT Frame"></iframe>
      ) : (
        <div>Renderizando UAT...</div>
      )}
    </>
  );
};

export default UATProxy;
