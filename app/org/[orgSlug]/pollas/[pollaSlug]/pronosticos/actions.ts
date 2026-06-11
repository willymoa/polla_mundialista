"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePollaAccess, errorSiPollaNoEscritura } from "@/lib/permissions";
import { partidoBloqueado } from "@/lib/locks";
import { pronosticoSchema, type PronosticoInput } from "@/lib/validations";

export async function guardarPronosticoAction(
  orgSlug: string,
  pollaSlug: string,
  partidoId: string,
  values: PronosticoInput
) {
  const { user, polla, participante } = await requirePollaAccess(orgSlug, pollaSlug);

  const errorEscritura = errorSiPollaNoEscritura(polla);
  if (errorEscritura) return { error: errorEscritura };

  if (!participante || participante.role === "ESPECTADOR") {
    return { error: "No tienes permiso para registrar pronósticos en esta polla" };
  }

  if (participante.estado !== "ACTIVO") {
    return { error: "Tu participación está suspendida" };
  }

  const parsed = pronosticoSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const partido = await prisma.partido.findUnique({ where: { id: partidoId } });
  if (!partido || partido.pollaId !== polla.id) {
    return { error: "Partido no encontrado" };
  }

  if (partidoBloqueado(polla, partido)) {
    return { error: "Los pronósticos para este partido están bloqueados" };
  }

  const { golesLocal, golesVisitante } = parsed.data;

  await prisma.pronostico.upsert({
    where: { userId_partidoId: { userId: user.id, partidoId: partido.id } },
    create: {
      userId: user.id,
      pollaId: polla.id,
      partidoId: partido.id,
      golesLocal,
      golesVisitante,
    },
    update: { golesLocal, golesVisitante },
  });

  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}/pronosticos`);
  return { success: true };
}
