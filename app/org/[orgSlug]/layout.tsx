import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/permissions";
import { getTenantBySlug } from "@/lib/tenant";
import { AppNav } from "@/components/AppNav";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const user = await requireAuth();
  const organizacion = await getTenantBySlug(orgSlug);

  const membresia = await prisma.membresia.findUnique({
    where: { userId_organizacionId: { userId: user.id, organizacionId: organizacion.id } },
  });

  const esAdmin = membresia?.role === "OWNER" || membresia?.role === "ADMIN";
  const esOwner = membresia?.role === "OWNER";

  const links = [
    { href: `/org/${orgSlug}`, label: "Inicio" },
    { href: `/org/${orgSlug}/pollas`, label: "Pollas" },
    ...(esAdmin ? [{ href: `/org/${orgSlug}/miembros`, label: "Miembros" }] : []),
    ...(esOwner ? [{ href: `/org/${orgSlug}/configuracion`, label: "Configuración" }] : []),
  ];

  return (
    <div className="flex flex-1 flex-col">
      <AppNav
        title={organizacion.nombre}
        links={links}
        backLink={{ href: "/dashboard", label: "Mis organizaciones" }}
      />
      {children}
    </div>
  );
}
