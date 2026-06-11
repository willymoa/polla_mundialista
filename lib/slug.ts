import { prisma } from "@/lib/prisma";

const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function generarSlugUnicoOrganizacion(nombre: string) {
  const base = slugify(nombre) || "organizacion";
  let slug = base;
  let contador = 1;

  while (await prisma.organizacion.findUnique({ where: { slug } })) {
    slug = `${base}-${++contador}`;
  }

  return slug;
}

export async function generarSlugUnicoPolla(
  organizacionId: string,
  nombre: string
) {
  const base = slugify(nombre) || "polla";
  let slug = base;
  let contador = 1;

  while (
    await prisma.polla.findUnique({
      where: { organizacionId_slug: { organizacionId, slug } },
    })
  ) {
    slug = `${base}-${++contador}`;
  }

  return slug;
}
