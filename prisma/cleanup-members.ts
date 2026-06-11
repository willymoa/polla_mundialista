import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Usuarios que nunca se borran con este script */
const USUARIOS_PROTEGIDOS = ["superadmin@polla.com", "owner@empresa.com"];

async function main() {
  console.log("Buscando usuarios a eliminar (se conservan superadmin y owner)...");

  const protegidos = await prisma.user.findMany({
    where: { email: { in: USUARIOS_PROTEGIDOS } },
    select: { id: true, email: true, nombre: true, globalRole: true },
  });

  const idsProtegidos = new Set(protegidos.map((u) => u.id));

  console.log("\nUsuarios protegidos:");
  for (const u of protegidos) {
    console.log(`  ✓ ${u.nombre} (${u.email}) [${u.globalRole}]`);
  }

  const faltantes = USUARIOS_PROTEGIDOS.filter(
    (email) => !protegidos.some((u) => u.email === email)
  );
  if (faltantes.length > 0) {
    console.warn("\n⚠ No se encontraron en la BD:", faltantes.join(", "));
  }

  const aEliminar = await prisma.user.findMany({
    where: { id: { notIn: [...idsProtegidos] } },
    select: {
      id: true,
      email: true,
      nombre: true,
      globalRole: true,
      _count: {
        select: {
          membresias: true,
          participaciones: true,
          pronosticos: true,
        },
      },
    },
  });

  if (aEliminar.length === 0) {
    console.log("\nNo hay usuarios miembros para eliminar.");
    return;
  }

  console.log(`\nUsuarios a eliminar (${aEliminar.length}):`);
  for (const u of aEliminar) {
    console.log(
      `  ✗ ${u.nombre} (${u.email}) — membresías: ${u._count.membresias}, participaciones: ${u._count.participaciones}, pronósticos: ${u._count.pronosticos}`
    );
  }

  const invitaciones = await prisma.invitacion.deleteMany({
    where: { estado: "PENDIENTE" },
  });
  console.log(`\nInvitaciones pendientes eliminadas: ${invitaciones.count}`);

  const resultado = await prisma.user.deleteMany({
    where: { id: { notIn: [...idsProtegidos] } },
  });

  console.log(`\nUsuarios eliminados: ${resultado.count}`);
  console.log(
    "Se eliminaron en cascada sus membresías, participaciones en pollas y pronósticos."
  );
  console.log("\nListo. Puedes invitar nuevos miembros desde /org/.../miembros");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
