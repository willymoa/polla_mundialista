"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePollaRole, esAdminPolla, requirePollaAccess, errorSiPollaNoEscritura } from "@/lib/permissions";
import { recalcularPuntosPartido } from "@/lib/scoring";
import {
  editarPollaSchema,
  actualizarParticipanteSchema,
  agregarParticipanteSchema,
  eliminarParticipanteSchema,
  reglaPuntuacionSchema,
  type EditarPollaInput,
  type ActualizarParticipanteInput,
  type AgregarParticipanteInput,
  type EliminarParticipanteInput,
  type ReglaPuntuacionFormInput,
} from "@/lib/validations";

export async function actualizarPollaAction(
  orgSlug: string,
  pollaSlug: string,
  values: EditarPollaInput
) {
  const { polla } = await requirePollaRole(orgSlug, pollaSlug, ["ADMIN_POLLA"]);

  const parsed = editarPollaSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const { nombre, descripcion, torneo, lockMode, esPublica, estado } = parsed.data;

  await prisma.polla.update({
    where: { id: polla.id },
    data: {
      nombre,
      descripcion: descripcion || null,
      torneo: torneo || null,
      lockMode,
      esPublica,
      estado,
    },
  });

  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}`);
  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}/configuracion`);
  revalidatePath(`/org/${orgSlug}/pollas`);
  return { success: true };
}

export async function eliminarPollaAction(orgSlug: string, pollaSlug: string) {
  const { membresiaOrg, polla } = await requirePollaAccess(orgSlug, pollaSlug);

  if (membresiaOrg.role !== "OWNER" && membresiaOrg.role !== "ADMIN") {
    return { error: "No tienes permisos para eliminar esta polla" };
  }

  await prisma.polla.delete({ where: { id: polla.id } });

  revalidatePath(`/org/${orgSlug}/pollas`);
  redirect(`/org/${orgSlug}/pollas`);
}

export async function agregarParticipanteAction(
  orgSlug: string,
  pollaSlug: string,
  values: AgregarParticipanteInput
) {
  const { membresiaOrg, participante: actor, polla, organizacion } = await requirePollaAccess(orgSlug, pollaSlug);

  if (!esAdminPolla(membresiaOrg, actor)) {
    return { error: "No tienes permisos para gestionar participantes" };
  }

  const errorEscritura = errorSiPollaNoEscritura(polla);
  if (errorEscritura) return { error: errorEscritura };

  const parsed = agregarParticipanteSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const { userId, role } = parsed.data;

  const miembro = await prisma.membresia.findUnique({
    where: { userId_organizacionId: { userId, organizacionId: organizacion.id } },
  });

  if (!miembro) {
    return { error: "El usuario no es miembro de la organización" };
  }

  const existente = await prisma.participantePolla.findUnique({
    where: { userId_pollaId: { userId, pollaId: polla.id } },
  });

  if (existente) {
    return { error: "Ese usuario ya es participante de la polla" };
  }

  await prisma.participantePolla.create({
    data: { userId, pollaId: polla.id, role, pago: false },
  });

  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}/configuracion`);
  return { success: true };
}

export async function eliminarParticipanteAction(
  orgSlug: string,
  pollaSlug: string,
  values: EliminarParticipanteInput
) {
  const { membresiaOrg, participante: actor, polla } = await requirePollaAccess(orgSlug, pollaSlug);

  if (!esAdminPolla(membresiaOrg, actor)) {
    return { error: "No tienes permisos para gestionar participantes" };
  }

  const errorEscritura = errorSiPollaNoEscritura(polla);
  if (errorEscritura) return { error: errorEscritura };

  const parsed = eliminarParticipanteSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const objetivo = await prisma.participantePolla.findUnique({
    where: { id: parsed.data.participanteId },
  });

  if (!objetivo || objetivo.pollaId !== polla.id) {
    return { error: "Participante no encontrado" };
  }

  await prisma.$transaction([
    prisma.pronostico.deleteMany({ where: { userId: objetivo.userId, pollaId: polla.id } }),
    prisma.participantePolla.delete({ where: { id: objetivo.id } }),
  ]);

  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}/configuracion`);
  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}/ranking`);
  return { success: true };
}

export async function actualizarParticipanteAction(
  orgSlug: string,
  pollaSlug: string,
  values: ActualizarParticipanteInput
) {
  const { membresiaOrg, participante: actor, polla } = await requirePollaAccess(orgSlug, pollaSlug);

  if (!esAdminPolla(membresiaOrg, actor)) {
    return { error: "No tienes permisos para gestionar participantes" };
  }

  const errorEscritura = errorSiPollaNoEscritura(polla);
  if (errorEscritura) return { error: errorEscritura };

  const parsed = actualizarParticipanteSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const { participanteId, role, estado, pago } = parsed.data;

  const objetivo = await prisma.participantePolla.findUnique({
    where: { id: participanteId },
  });

  if (!objetivo || objetivo.pollaId !== polla.id) {
    return { error: "Participante no encontrado" };
  }

  await prisma.participantePolla.update({
    where: { id: participanteId },
    data: { role, estado, pago },
  });

  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}/configuracion`);
  return { success: true };
}

export async function actualizarReglaPuntuacionAction(
  orgSlug: string,
  pollaSlug: string,
  values: ReglaPuntuacionFormInput
) {
  const { polla } = await requirePollaRole(orgSlug, pollaSlug, ["ADMIN_POLLA"]);

  const errorEscritura = errorSiPollaNoEscritura(polla);
  if (errorEscritura) return { error: errorEscritura };

  const parsed = reglaPuntuacionSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  await prisma.reglaPuntuacion.upsert({
    where: { pollaId: polla.id },
    create: { pollaId: polla.id, ...parsed.data },
    update: parsed.data,
  });

  const partidosFinalizados = await prisma.partido.findMany({
    where: { pollaId: polla.id, estado: "FINALIZADO" },
    select: { id: true },
  });

  for (const partido of partidosFinalizados) {
    await recalcularPuntosPartido(partido.id);
  }

  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}/configuracion`);
  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}/ranking`);
  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}/pronosticos`);
  return { success: true };
}
