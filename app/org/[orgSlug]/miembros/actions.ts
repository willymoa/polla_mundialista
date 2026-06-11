"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireOrgRole } from "@/lib/permissions";
import { generarCodigo } from "@/lib/codigos";
import {
  crearInvitacionSchema,
  actualizarMembresiaSchema,
  actualizarUsuarioOrgSchema,
  resetPasswordAdminSchema,
  crearUsuarioOrgSchema,
  type CrearInvitacionInput,
  type ActualizarMembresiaInput,
  type ActualizarUsuarioOrgInput,
  type ResetPasswordAdminInput,
  type CrearUsuarioOrgInput,
} from "@/lib/validations";

const SALT_ROUNDS = 10;

export async function crearInvitacionAction(
  orgSlug: string,
  values: CrearInvitacionInput
): Promise<{ error?: string; codigo?: string }> {
  const { organizacion } = await requireOrgRole(orgSlug, ["OWNER", "ADMIN"]);

  const parsed = crearInvitacionSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const fechaExpiracion = new Date();
  fechaExpiracion.setDate(fechaExpiracion.getDate() + parsed.data.diasExpiracion);

  const invitacion = await prisma.invitacion.create({
    data: {
      organizacionId: organizacion.id,
      codigo: generarCodigo(),
      emailInvitado: parsed.data.emailInvitado || null,
      roleAsignado: parsed.data.roleAsignado,
      fechaExpiracion,
    },
  });

  revalidatePath(`/org/${orgSlug}/miembros`);
  return { codigo: invitacion.codigo };
}

export async function revocarInvitacionAction(
  orgSlug: string,
  invitacionId: string
): Promise<{ error?: string }> {
  const { organizacion } = await requireOrgRole(orgSlug, ["OWNER", "ADMIN"]);

  await prisma.invitacion.updateMany({
    where: { id: invitacionId, organizacionId: organizacion.id },
    data: { estado: "REVOCADA" },
  });

  revalidatePath(`/org/${orgSlug}/miembros`);
  return {};
}

export async function actualizarMembresiaAction(
  orgSlug: string,
  values: ActualizarMembresiaInput
): Promise<{ error?: string }> {
  const { organizacion } = await requireOrgRole(orgSlug, ["OWNER"]);

  const parsed = actualizarMembresiaSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const membresia = await prisma.membresia.findUnique({
    where: { id: parsed.data.membresiaId },
  });

  if (!membresia || membresia.organizacionId !== organizacion.id) {
    return { error: "Membresía no encontrada" };
  }

  if (membresia.role === "OWNER") {
    return { error: "No se puede modificar al propietario" };
  }

  await prisma.membresia.update({
    where: { id: membresia.id },
    data: { role: parsed.data.role, estado: parsed.data.estado },
  });

  revalidatePath(`/org/${orgSlug}/miembros`);
  return {};
}

export async function crearUsuarioOrgAction(
  orgSlug: string,
  values: CrearUsuarioOrgInput
): Promise<{ error?: string; success?: boolean }> {
  const { organizacion, membresia: actorMembresia } = await requireOrgRole(
    orgSlug,
    ["OWNER", "ADMIN"]
  );

  const parsed = crearUsuarioOrgSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { nombre, email, password, role } = parsed.data;

  if (role === "ADMIN" && actorMembresia.role !== "OWNER") {
    return { error: "Solo el propietario puede crear administradores" };
  }

  const existente = await prisma.user.findUnique({ where: { email } });

  if (existente) {
    const membresiaExistente = await verificarUsuarioEnOrg(organizacion.id, existente.id);
    if (membresiaExistente) {
      return { error: "Ese correo ya pertenece a esta organización" };
    }

    await prisma.membresia.create({
      data: {
        userId: existente.id,
        organizacionId: organizacion.id,
        role,
      },
    });
  } else {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await prisma.user.create({
      data: {
        nombre,
        email,
        passwordHash,
        membresias: {
          create: {
            organizacionId: organizacion.id,
            role,
          },
        },
      },
    });
  }

  revalidatePath(`/org/${orgSlug}/miembros`);
  return { success: true };
}

async function verificarUsuarioEnOrg(organizacionId: string, userId: string) {
  return prisma.membresia.findUnique({
    where: { userId_organizacionId: { userId, organizacionId } },
  });
}

export async function actualizarUsuarioOrgAction(
  orgSlug: string,
  values: ActualizarUsuarioOrgInput
): Promise<{ error?: string }> {
  const { user: actor, organizacion } = await requireOrgRole(orgSlug, ["OWNER", "ADMIN"]);

  const parsed = actualizarUsuarioOrgSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const { userId, nombre, email } = parsed.data;

  if (userId === actor.id) {
    return { error: "Edita tu propio perfil desde Mi cuenta" };
  }

  const membresia = await verificarUsuarioEnOrg(organizacion.id, userId);
  if (!membresia) {
    return { error: "El usuario no pertenece a esta organización" };
  }

  if (membresia.role === "OWNER") {
    return { error: "No se puede modificar al propietario" };
  }

  const existente = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
  });
  if (existente) {
    return { error: "Ese correo ya está registrado" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { nombre, email },
  });

  revalidatePath(`/org/${orgSlug}/miembros`);
  return {};
}

export async function resetPasswordAdminAction(
  orgSlug: string,
  values: ResetPasswordAdminInput
): Promise<{ error?: string }> {
  const { user: actor, organizacion } = await requireOrgRole(orgSlug, ["OWNER", "ADMIN"]);

  const parsed = resetPasswordAdminSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { userId, passwordNueva } = parsed.data;

  if (userId === actor.id) {
    return { error: "Cambia tu propia contraseña desde Mi cuenta" };
  }

  const membresia = await verificarUsuarioEnOrg(organizacion.id, userId);
  if (!membresia) {
    return { error: "El usuario no pertenece a esta organización" };
  }

  if (membresia.role === "OWNER") {
    return { error: "No se puede modificar la contraseña del propietario" };
  }

  const passwordHash = await bcrypt.hash(passwordNueva, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return {};
}
