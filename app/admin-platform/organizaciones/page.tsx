import { prisma } from "@/lib/prisma";
import { PlanSelect } from "@/components/PlanSelect";

export default async function AdminOrganizacionesPage() {
  const [organizaciones, planes] = await Promise.all([
    prisma.organizacion.findMany({
      include: {
        planRef: { select: { id: true, nombre: true } },
        _count: { select: { membresias: true, pollas: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.plan.findMany({ select: { id: true, nombre: true }, orderBy: { maxPollas: "asc" } }),
  ]);

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-primary">Organizaciones</h1>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-brand-primary/70">
              <th className="py-2">Nombre</th>
              <th className="py-2">Slug</th>
              <th className="py-2">Miembros</th>
              <th className="py-2">Pollas</th>
              <th className="py-2">Plan</th>
            </tr>
          </thead>
          <tbody>
            {organizaciones.map((org) => (
              <tr key={org.id} className="border-b border-gray-100">
                <td className="py-2 font-semibold text-brand-primary">{org.nombre}</td>
                <td className="py-2 font-mono">{org.slug}</td>
                <td className="py-2">{org._count.membresias}</td>
                <td className="py-2">{org._count.pollas}</td>
                <td className="py-2">
                  <PlanSelect
                    organizacionId={org.id}
                    planActualId={org.planRef?.id ?? null}
                    planes={planes}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
