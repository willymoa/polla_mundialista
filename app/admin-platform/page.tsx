import { prisma } from "@/lib/prisma";

export default async function AdminPlatformPage() {
  const [totalOrganizaciones, totalUsuarios, totalPollas, planes] = await Promise.all([
    prisma.organizacion.count(),
    prisma.user.count(),
    prisma.polla.count(),
    prisma.plan.findMany({
      include: { _count: { select: { organizaciones: true } } },
      orderBy: { maxPollas: "asc" },
    }),
  ]);

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-primary">Resumen de la plataforma</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-brand-primary/70">Organizaciones</p>
          <p className="text-2xl font-bold text-brand-primary">{totalOrganizaciones}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-brand-primary/70">Usuarios</p>
          <p className="text-2xl font-bold text-brand-primary">{totalUsuarios}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-brand-primary/70">Pollas</p>
          <p className="text-2xl font-bold text-brand-primary">{totalPollas}</p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-brand-primary">Organizaciones por plan</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-brand-primary/70">
              <th className="py-2">Plan</th>
              <th className="py-2">Máx. pollas</th>
              <th className="py-2">Máx. participantes</th>
              <th className="py-2">Organizaciones</th>
            </tr>
          </thead>
          <tbody>
            {planes.map((plan) => (
              <tr key={plan.id} className="border-b border-gray-100">
                <td className="py-2 font-semibold text-brand-primary">{plan.nombre}</td>
                <td className="py-2">{plan.maxPollas}</td>
                <td className="py-2">{plan.maxParticipantesPorPolla}</td>
                <td className="py-2">{plan._count.organizaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
