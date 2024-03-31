import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "./ui/button";
import { Icons } from "./icons";
import { FaGoogle } from "react-icons/fa";

export function LoginButton({ isLoading, onGoogleSuccess }) {
  const login = useGoogleLogin({
    onSuccess: ({ code }) => {
      console.log("The code is: ", code);
      onGoogleSuccess({ code }); // Llamar al callback con la respuesta de Google
    },
    onError: () => console.log("Login Failed"),
    scope: "email profile",
    flow: "auth-code",
  });

  return (
    // With useGoogleLogin
    <Button className="w-full" variant="outline" type="button" onClick={() => login()} disabled={isLoading}>
      {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <FaGoogle className="mr-2 h-4 w-4" />}{" "}
      Google
    </Button>
  );
}
