"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePollaRole, errorSiPollaNoEscritura } from "@/lib/permissions";
import { partidoSchema, type PartidoInput } from "@/lib/validations";

async function validarEquipos(pollaId: string, equipoLocalId: string, equipoVisitanteId: string) {
  const equipos = await prisma.equipo.findMany({
    where: { id: { in: [equipoLocalId, equipoVisitanteId] }, pollaId },
  });
  return equipos.length === 2;
}

export async function crearPartidoAction(
  orgSlug: string,
  pollaSlug: string,
  values: PartidoInput
) {
  const { polla } = await requirePollaRole(orgSlug, pollaSlug, ["ADMIN_POLLA"]);

  const errorEscritura = errorSiPollaNoEscritura(polla);
  if (errorEscritura) return { error: errorEscritura };

  const parsed = partidoSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { equipoLocalId, equipoVisitanteId, fechaHora, fase, estado } = parsed.data;

  if (!(await validarEquipos(polla.id, equipoLocalId, equipoVisitanteId))) {
    return { error: "Los equipos seleccionados no pertenecen a esta polla" };
  }

  await prisma.partido.create({
    data: {
      pollaId: polla.id,
      equipoLocalId,
      equipoVisitanteId,
      fechaHora: new Date(fechaHora),
      fase: fase || null,
      estado,
    },
  });

  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}/partidos`);
  return { success: true };
}

export async function editarPartidoAction(
  orgSlug: string,
  pollaSlug: string,
  partidoId: string,
  values: PartidoInput
) {
  const { polla } = await requirePollaRole(orgSlug, pollaSlug, ["ADMIN_POLLA"]);

  const errorEscritura = errorSiPollaNoEscritura(polla);
  if (errorEscritura) return { error: errorEscritura };

  const parsed = partidoSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const partido = await prisma.partido.findUnique({ where: { id: partidoId } });
  if (!partido || partido.pollaId !== polla.id) {
    return { error: "Partido no encontrado" };
  }

  const { equipoLocalId, equipoVisitanteId, fechaHora, fase, estado } = parsed.data;

  if (!(await validarEquipos(polla.id, equipoLocalId, equipoVisitanteId))) {
    return { error: "Los equipos seleccionados no pertenecen a esta polla" };
  }

  await prisma.partido.update({
    where: { id: partidoId },
    data: {
      equipoLocalId,
      equipoVisitanteId,
      fechaHora: new Date(fechaHora),
      fase: fase || null,
      estado,
    },
  });

  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}/partidos`);
  return { success: true };
}

export async function eliminarPartidoAction(
  orgSlug: string,
  pollaSlug: string,
  partidoId: string
) {
  const { polla } = await requirePollaRole(orgSlug, pollaSlug, ["ADMIN_POLLA"]);

  const errorEscritura = errorSiPollaNoEscritura(polla);
  if (errorEscritura) return { error: errorEscritura };

  const partido = await prisma.partido.findUnique({ where: { id: partidoId } });
  if (!partido || partido.pollaId !== polla.id) {
    return { error: "Partido no encontrado" };
  }

  await prisma.partido.delete({ where: { id: partidoId } });

  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}/partidos`);
  return { success: true };
}
