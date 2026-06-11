"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/permissions";
import { generarSlugUnicoOrganizacion } from "@/lib/slug";
import {
  crearOrganizacionSchema,
  unirseCodigoSchema,
  type CrearOrganizacionInput,
  type UnirseCodigoInput,
} from "@/lib/validations";

export async function crearOrganizacionAction(
  values: CrearOrganizacionInput
): Promise<{ error?: string }> {
  const user = await requireAuth();
  const parsed = crearOrganizacionSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const slug = await generarSlugUnicoOrganizacion(parsed.data.nombre);

  const organizacion = await prisma.organizacion.create({
    data: {
      nombre: parsed.data.nombre,
      slug,
    },
  });

  await prisma.membresia.create({
    data: {
      userId: user.id,
      organizacionId: organizacion.id,
      role: "OWNER",
    },
  });

  redirect(`/org/${organizacion.slug}`);
}

export async function unirseConCodigoAction(
  values: UnirseCodigoInput
): Promise<{ error?: string }> {
  const user = await requireAuth();
  const parsed = unirseCodigoSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const invitacion = await prisma.invitacion.findUnique({
    where: { codigo: parsed.data.codigo },
    include: { organizacion: true },
  });

  if (!invitacion || invitacion.estado !== "PENDIENTE") {
    return { error: "Código de invitación inválido" };
  }

  if (invitacion.fechaExpiracion < new Date()) {
    return { error: "El código de invitación ha expirado" };
  }

  const membresiaExistente = await prisma.membresia.findUnique({
    where: {
      userId_organizacionId: {
        userId: user.id,
        organizacionId: invitacion.organizacionId,
      },
    },
  });

  if (!membresiaExistente) {
    await prisma.membresia.create({
      data: {
        userId: user.id,
        organizacionId: invitacion.organizacionId,
        role: invitacion.roleAsignado,
      },
    });
  }

  redirect(`/org/${invitacion.organizacion.slug}`);
}
