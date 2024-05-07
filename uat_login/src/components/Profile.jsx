import React from "react";
import { Separator } from "./ui/separator";
import ProfileForm from "./ProfileForm.jsx";

const Profile = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Datos de Usuario</h3>
        <p className="text-sm text-muted-foreground">
          Aquí puedes modificar tus datos de perfil, algunos datos solo pueden ser modificados por administradores.
        </p>
      </div>
      <Separator />
      <ProfileForm />
    </div>
  );
};

export default Profile;
