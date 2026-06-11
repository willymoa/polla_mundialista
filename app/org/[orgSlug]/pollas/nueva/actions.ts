"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgRole } from "@/lib/permissions";
import { generarSlugUnicoPolla } from "@/lib/slug";
import { crearPollaSchema, type CrearPollaInput } from "@/lib/validations";

export async function crearPollaAction(orgSlug: string, values: CrearPollaInput) {
  const { user, organizacion } = await requireOrgRole(orgSlug, ["OWNER", "ADMIN"]);

  const parsed = crearPollaSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const { nombre, descripcion, torneo, lockMode, esPublica } = parsed.data;
  const slug = await generarSlugUnicoPolla(organizacion.id, nombre);

  const polla = await prisma.polla.create({
    data: {
      organizacionId: organizacion.id,
      nombre,
      slug,
      descripcion: descripcion || null,
      torneo: torneo || null,
      lockMode,
      esPublica,
      reglaPuntuacion: { create: {} },
      participantes: {
        create: { userId: user.id, role: "ADMIN_POLLA", pago: true },
      },
    },
  });

  revalidatePath(`/org/${orgSlug}/pollas`);
  redirect(`/org/${orgSlug}/pollas/${polla.slug}`);
}
