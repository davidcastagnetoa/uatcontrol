// Login.js
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Icons } from "./icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "./ui/use-toast";
import { Toaster } from "./ui/toaster";
import { ModeToggle } from "./ToggleMode";
import { LoginButton } from "./LoginButton";

function Login() {
  const { login, verifyToken } = useContext(AuthContext);
  const [openToaster, setOpenToaster] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prevCredentials) => ({
      ...prevCredentials,
      [name]: value,
    }));
  };

  // Usando Custom GoogleLogin  Button component
  const handleGoogleSuccess = async (code) => {
    setIsLoading(true);

    const requestBody = JSON.stringify({ code });
    console.log("Body being sent to the server:", requestBody);
    try {
      const response = await fetch("http://localhost:8080/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Accept: "*/*",
        },
        body: requestBody,
      });
      console.log("Response from the server:", response);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Espera la respuesta de tu servidor (por ejemplo, un token JWT para manejar la sesión)
      const tokens = await response.json();
      console.log("Authenticated with the server successfully:", tokens);

      // Aquí puedes almacenar el token JWT en localStorage (o donde prefieras) para futuras autenticaciones
      let token = tokens.userToken;
      console.log("Token de la aplicacion: " + token);
      localStorage.setItem("token", token);

      // console.log("Redirigiendo a dashboard");
      // navigate("/dashboard", { replace: true });

      const success = await verifyToken();
      if (success) {
        // Y redirigir al usuario al Dashboard o actualizar el estado de la aplicación según corresponda
        console.log("Redirigiendo a dashboard");
        navigate("/dashboard", { replace: true });
      } else {
        throw new Error("No se ha verificado el token en la funcion verifyToken() del contexto AuthProvider .");
      }
    } catch (error) {
      console.error("Error during server authentication:", error);
      const errorMessage = "Error during server authentication. " + error.message;
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "¡Acceso Denegado!",
        description: errorMessage,
        open: { openToaster },
      });

      console.warn("Toaster mostrado");
      console.error(error);
      setOpenToaster(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    console.log(error);

    try {
      // login es una función asíncrona, en AuthProvider.js que devuelve un booleano, despues de comprobar en el servidor, una vez comprobado se trae un true o false
      const success = await login(credentials.username, credentials.password);
      if (success) {
        setIsLoading(false);
        navigate("/dashboard", { replace: true });
      } else {
        setIsLoading(false);
        throw new Error("Las credenciales son incorrectas.");
      }
    } catch (err) {
      // Aquí puedes manejar excepciones generales o errores de red
      setIsLoading(false);
      const errorMessage = "Ocurrió un error al intentar iniciar sesión. " + err.message;
      console.warn(err.message);
      setError(errorMessage);

      toast({
        variant: "destructive",
        title: "¡Acceso Denegado!",
        description: errorMessage,
        open: { openToaster },
      });

      console.warn("Toaster mostrado");
      console.error(error);
      setOpenToaster(true);
    }
  };

  return (
    <div className="lg:p-8 flex justify-center items-center h-screen">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card>
          <CardHeader className="flex flex-col space-y-1.5">
            <div className="w-full flex flex-row justify-between">
              <CardTitle className="font-semibold tracking-tight text-2xl ">Iniciar Sesion</CardTitle>
              <ModeToggle />
            </div>
            <CardDescription className="text-sm text-muted-foreground">
              Introduce tu matrícula y contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {/* Form to handle user submission */}
              <form onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    {/* Label and Input for username */}
                    <Label className="sr-only" htmlFor="username">
                      Username
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      value={credentials.username}
                      onChange={handleChange}
                      placeholder="Tu matricula"
                      type="text"
                      autoCapitalize="none"
                      autoComplete="text"
                      autoCorrect="off"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-1">
                    {/* Label and Input for password */}
                    <Label className="sr-only" htmlFor="password">
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      placeholder="Tu contraseña"
                      type="password"
                      autoCapitalize="none"
                      autoComplete="password"
                      autoCorrect="off"
                      disabled={isLoading}
                    />
                  </div>
                  {/* Button to submit the form */}
                  <Button disabled={isLoading} type="submit">
                    {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </div>
              </form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Button to sign in with Google */}
              {/* Usando Button component */}
              {/* <LoginButton isLoading={isLoading} /> */}

              {/* Usando GoogleLogin component */}
              <LoginButton isLoading={isLoading} onGoogleSuccess={handleGoogleSuccess} />
            </div>
            <p className="px-8 py-4 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <Link to="/terms" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>

      <Toaster />
    </div>
  );
}

export default Login;
