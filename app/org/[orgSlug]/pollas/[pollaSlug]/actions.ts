"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePollaAccess, errorSiPollaNoEscritura } from "@/lib/permissions";

export async function inscribirseAction(orgSlug: string, pollaSlug: string) {
  const { user, polla, participante } = await requirePollaAccess(orgSlug, pollaSlug);

  const errorEscritura = errorSiPollaNoEscritura(polla);
  if (errorEscritura) return { error: errorEscritura };

  if (participante) {
    return { error: "Ya estás inscrito en esta polla" };
  }

  await prisma.participantePolla.create({
    data: { userId: user.id, pollaId: polla.id, role: "PARTICIPANTE" },
  });

  revalidatePath(`/org/${orgSlug}/pollas/${pollaSlug}`);
  return { success: true };
}
