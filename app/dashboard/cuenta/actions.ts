"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/permissions";
import {
  actualizarPerfilSchema,
  cambiarPasswordSchema,
  type ActualizarPerfilInput,
  type CambiarPasswordInput,
} from "@/lib/validations";

const SALT_ROUNDS = 10;

export async function actualizarPerfilAction(values: ActualizarPerfilInput) {
  const user = await requireAuth();

  const parsed = actualizarPerfilSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { nombre, email } = parsed.data;

  if (email !== user.email) {
    const existente = await prisma.user.findUnique({ where: { email } });
    if (existente) {
      return { error: "Ese correo ya está registrado" };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { nombre, email },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cuenta");
  return { success: true };
}

export async function cambiarPasswordAction(values: CambiarPasswordInput) {
  const sessionUser = await requireAuth();

  const parsed = cambiarPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const dbUser = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!dbUser) {
    return { error: "Usuario no encontrado" };
  }

  const { passwordActual, passwordNueva } = parsed.data;

  const passwordOk = await bcrypt.compare(passwordActual, dbUser.passwordHash);
  if (!passwordOk) {
    return { error: "La contraseña actual no es correcta" };
  }

  const passwordHash = await bcrypt.hash(passwordNueva, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { passwordHash },
  });

  return { success: true };
}
