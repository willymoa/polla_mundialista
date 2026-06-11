"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { registroSchema, type RegistroInput } from "@/lib/validations";

const SALT_ROUNDS = 10;

export async function registroAction(
  values: RegistroInput
): Promise<{ error?: string }> {
  const parsed = registroSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const { nombre, email, password } = parsed.data;

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    return { error: "Ya existe una cuenta con este correo" };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await prisma.user.create({
    data: { nombre, email, passwordHash },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/onboarding",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "No se pudo iniciar sesión automáticamente" };
    }
    throw error;
  }
}
