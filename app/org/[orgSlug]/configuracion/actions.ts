"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgRole } from "@/lib/permissions";
import {
  editarOrganizacionSchema,
  type EditarOrganizacionInput,
} from "@/lib/validations";

export async function actualizarOrganizacionAction(
  orgSlug: string,
  values: EditarOrganizacionInput
): Promise<{ error?: string }> {
  const { organizacion } = await requireOrgRole(orgSlug, ["OWNER"]);

  const parsed = editarOrganizacionSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  await prisma.organizacion.update({
    where: { id: organizacion.id },
    data: {
      nombre: parsed.data.nombre,
      logoUrl: parsed.data.logoUrl || null,
      brandColor: parsed.data.brandColor || null,
    },
  });

  revalidatePath(`/org/${orgSlug}/configuracion`);
  revalidatePath(`/org/${orgSlug}`);
  return {};
}
