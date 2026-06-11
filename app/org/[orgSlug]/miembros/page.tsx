import { prisma } from "@/lib/prisma";
import { requireOrgRole } from "@/lib/permissions";
import { InviteMemberForm } from "@/components/InviteMemberForm";
import { CrearMiembroForm } from "@/components/CrearMiembroForm";
import { MembresiasTable } from "@/components/MembresiasTable";
import { InvitacionesTable } from "@/components/InvitacionesTable";

export default async function MiembrosPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const { user, organizacion, membresia } = await requireOrgRole(orgSlug, [
    "OWNER",
    "ADMIN",
  ]);

  const [membresias, invitaciones] = await Promise.all([
    prisma.membresia.findMany({
      where: { organizacionId: organizacion.id },
      include: { user: { select: { id: true, nombre: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.invitacion.findMany({
      where: { organizacionId: organizacion.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const esOwner = membresia.role === "OWNER";
  const esAdmin = membresia.role === "OWNER" || membresia.role === "ADMIN";

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-primary">
        Miembros de {organizacion.nombre}
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-brand-primary">
              Miembros actuales
            </h2>
            <MembresiasTable
              orgSlug={orgSlug}
              membresias={membresias}
              esOwner={esOwner}
              esAdmin={esAdmin}
              currentUserId={user.id}
            />
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-brand-primary">
              Invitaciones
            </h2>
            <InvitacionesTable orgSlug={orgSlug} invitaciones={invitaciones} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-brand-primary">
              Crear usuario
            </h2>
            <p className="mb-4 text-sm text-brand-primary/70">
              Crea una cuenta directamente e inscríbela en esta organización.
            </p>
            <CrearMiembroForm orgSlug={orgSlug} esOwner={esOwner} />
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-brand-primary">
              Invitar con código
            </h2>
            <InviteMemberForm orgSlug={orgSlug} />
          </div>
        </div>
      </div>
    </main>
  );
}
