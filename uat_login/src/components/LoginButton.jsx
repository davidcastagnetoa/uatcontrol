import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "./ui/button";
import { Icons } from "./icons";

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
    <Button variant="outline" type="button" onClick={() => login()} disabled={isLoading}>
      {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.google className="mr-2 h-4 w-4" />}{" "}
      Google
    </Button>
  );
}
