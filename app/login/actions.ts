"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { loginSchema, type LoginInput } from "@/lib/validations";

export async function loginAction(
  values: LoginInput
): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Correo o contraseña incorrectos" };
    }
    throw error;
  }
}
