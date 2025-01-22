import React, { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DataContext } from "../context/DataContext.js";
import { useToast } from "./ui/use-toast.js";
import { Input } from "./ui/input.jsx";
import { Label } from "./ui/label.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.jsx";
import { Button } from "./ui/button.jsx";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form.jsx";

// Definición del esquema de validación con zod
const FormSchema = z.object({
  username: z.string().min(2, { message: "El nombre de usuario debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Debe ser un correo válido." }),
  matricula: z.string().min(1, { message: "La matrícula es requerida." }),
  privilegio: z.enum(["administrador", "usuario"], {
    invalid_type_error: "Debe seleccionar un privilegio.",
    required_error: "El privilegio es requerido.",
  }),
});

const ProfileForm = () => {
  const [openToaster, setOpenToaster] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { upgradeUserData, getUserData, userData } = useContext(DataContext);
  const [userAvatar, setUserAvatar] = useState(localStorage.getItem("userAvatar") || "");

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: userData?.username || "",
      email: userData?.email || "",
      matricula: userData?.matricula || "",
      privilegio: userData?.privilegio || "usuario",
    },
  });

  // Función para obtener datos del usuario
  const handleGetUserData = useCallback(async () => {
    try {
      await getUserData();
      console.log(getUserData());
      form.reset({
        username: userData?.username,
        email: userData?.email,
        matricula: userData?.matricula,
        privilegio: userData?.privilegio,
      });
    } catch (error) {
      console.error("Hubo un problema al recuperar los datos del usuario:", error);
    }
  }, [getUserData, form, userData]);

  useEffect(() => {
    handleGetUserData();
  }, [handleGetUserData]);

  // Función para actualizar el perfil del usuario
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const upgradeUser = await upgradeUserData(data?.username, data?.matricula, data?.privilegio);
      if (upgradeUser) {
        toast({
          variant: "default",
          title: "Usuario actualizado correctamente",
          open: { openToaster },
        });
        setOpenToaster(true);
      } else {
        throw new Error("No hay respuesta por parte del servidor. Intente más tarde.");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error al actualizar perfil de usuario",
        description: err.message,
        open: { openToaster },
      });
      setOpenToaster(true);
    } finally {
      handleGetUserData();
      setIsLoading(false);
    }
  };

  // Función para obtener el avatar del usuario
  const fetchUserAvatar = async () => {
    try {
      const UserDataFromDB = await getUserData();
      const UserAvatar = UserDataFromDB.picture;
      console.log("UserAvatar :", UserAvatar);
      localStorage.setItem("userAvatar", UserAvatar); // Cachear la URL del avatar
      return UserAvatar;
    } catch (error) {
      console.error("Error fetching user avatar:", error);
      return undefined;
    }
  };

  // Efecto para obtener el avatar del usuario
  useEffect(() => {
    const fetchAvatar = async () => {
      const avatar = await fetchUserAvatar();
      // console.log("Avatar: ", avatar);
      setUserAvatar(avatar);
    };
    if (!userAvatar) {
      fetchAvatar();
    }
  }, [userAvatar]);

  return (
    <div className="flex-1 lg:max-w-2xl">
      <div className="space-y-6">
        <img src={userAvatar} alt="avatar" className="rounded-full" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="Username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input disabled placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="matricula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matrícula</FormLabel>
                  <FormControl>
                    <Input placeholder="Matrícula" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {userData?.privilegio === "administrador" && (
              <FormField
                control={form.control}
                name="privilegio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selecciona el nivel del usuario</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value)} value={field.value}>
                      <SelectTrigger id="status" aria-label="Select status">
                        <SelectValue placeholder={`Nivel actual : ${field.value}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administrador">Administrador</SelectItem>
                        <SelectItem value="usuario">Usuario</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" disabled={isLoading}>
              Actualizar Perfil
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ProfileForm;
