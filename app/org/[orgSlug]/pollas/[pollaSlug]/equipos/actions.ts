"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePollaRole, errorSiPollaNoEscritura } from "@/lib/permissions";
import { equipoSchema, type EquipoInput } from "@/lib/validations";

export async function crearEquipoAction(orgSlug: string, pollaSlug: string, values: EquipoInput) {
  const { polla } = await requirePollaRole(orgSlug, pollaSlug, ["ADMIN_POLLA"]);

  const errorEscritura = errorSiPollaNoEscritura(polla);
  if (errorEscritura) return { error: errorEscritura };

  const parsed = equipoSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const { nombre, grupo, banderaUrl } = parsed.data;

  await prisma.equipo.create({
    data: {
      pollaId: polla.id,
      nombre,
      grupo: grupo || null,
      banderaUrl: banderaUrl || null,
    },
  });

  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}/equipos`);
  return { success: true };
}

export async function editarEquipoAction(
  orgSlug: string,
  pollaSlug: string,
  equipoId: string,
  values: EquipoInput
) {
  const { polla } = await requirePollaRole(orgSlug, pollaSlug, ["ADMIN_POLLA"]);

  const errorEscritura = errorSiPollaNoEscritura(polla);
  if (errorEscritura) return { error: errorEscritura };

  const parsed = equipoSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const equipo = await prisma.equipo.findUnique({ where: { id: equipoId } });
  if (!equipo || equipo.pollaId !== polla.id) {
    return { error: "Equipo no encontrado" };
  }

  const { nombre, grupo, banderaUrl } = parsed.data;

  await prisma.equipo.update({
    where: { id: equipoId },
    data: {
      nombre,
      grupo: grupo || null,
      banderaUrl: banderaUrl || null,
    },
  });

  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}/equipos`);
  return { success: true };
}

export async function eliminarEquipoAction(orgSlug: string, pollaSlug: string, equipoId: string) {
  const { polla } = await requirePollaRole(orgSlug, pollaSlug, ["ADMIN_POLLA"]);

  const errorEscritura = errorSiPollaNoEscritura(polla);
  if (errorEscritura) return { error: errorEscritura };

  const equipo = await prisma.equipo.findUnique({ where: { id: equipoId } });
  if (!equipo || equipo.pollaId !== polla.id) {
    return { error: "Equipo no encontrado" };
  }

  const partidosAsociados = await prisma.partido.count({
    where: { OR: [{ equipoLocalId: equipoId }, { equipoVisitanteId: equipoId }] },
  });

  if (partidosAsociados > 0) {
    return { error: "No se puede eliminar un equipo con partidos asociados" };
  }

  await prisma.equipo.delete({ where: { id: equipoId } });

  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}/equipos`);
  return { success: true };
}
