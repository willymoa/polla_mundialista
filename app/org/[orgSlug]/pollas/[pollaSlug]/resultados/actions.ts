"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePollaRole, errorSiPollaNoEscritura } from "@/lib/permissions";
import { recalcularPuntosPartido } from "@/lib/scoring";
import { resultadoSchema, type ResultadoInput } from "@/lib/validations";

export async function actualizarResultadoAction(
  orgSlug: string,
  pollaSlug: string,
  partidoId: string,
  values: ResultadoInput
) {
  const { polla } = await requirePollaRole(orgSlug, pollaSlug, ["ADMIN_POLLA"]);

  const errorEscritura = errorSiPollaNoEscritura(polla);
  if (errorEscritura) return { error: errorEscritura };

  const parsed = resultadoSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const partido = await prisma.partido.findUnique({ where: { id: partidoId } });
  if (!partido || partido.pollaId !== polla.id) {
    return { error: "Partido no encontrado" };
  }

  const { golesLocalReal, golesVisitanteReal, estado } = parsed.data;

  await prisma.partido.update({
    where: { id: partidoId },
    data: { golesLocalReal, golesVisitanteReal, estado },
  });

  if (estado === "FINALIZADO") {
    await recalcularPuntosPartido(partidoId);
  }

  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}/resultados`);
  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}/pronosticos`);
  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}/ranking`);
  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}/partidos`);
  return { success: true };
}
