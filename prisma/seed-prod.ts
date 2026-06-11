import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

const ORG_NOMBRE = process.env.SEED_ORG_NOMBRE ?? "Mundialistas";
const ORG_SLUG = process.env.SEED_ORG_SLUG ?? "mundialistas";
const OWNER_EMAIL = process.env.SEED_OWNER_EMAIL ?? "owner@empresa.com";
const OWNER_NOMBRE = process.env.SEED_OWNER_NOMBRE ?? "Administrador";
const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD ?? "Owner123456";
const SUPERADMIN_EMAIL = process.env.SEED_SUPERADMIN_EMAIL ?? "superadmin@polla.com";
const SUPERADMIN_PASSWORD = process.env.SEED_SUPERADMIN_PASSWORD ?? "SuperAdmin123456";

async function main() {
  console.log("Seed de producción: solo planes, super admin y owner.");

  console.log("Limpiando datos existentes...");
  await prisma.pronostico.deleteMany();
  await prisma.partido.deleteMany();
  await prisma.equipo.deleteMany();
  await prisma.reglaPuntuacion.deleteMany();
  await prisma.participantePolla.deleteMany();
  await prisma.polla.deleteMany();
  await prisma.invitacion.deleteMany();
  await prisma.membresia.deleteMany();
  await prisma.organizacion.deleteMany();
  await prisma.user.deleteMany();
  await prisma.plan.deleteMany();

  console.log("Creando planes...");
  const planGratis = await prisma.plan.create({
    data: {
      nombre: "GRATIS",
      maxPollas: 1,
      maxParticipantesPorPolla: 20,
      permiteLogo: false,
      permiteExportarExcel: false,
      permiteMultiplesAdmins: false,
    },
  });
  await prisma.plan.create({
    data: {
      nombre: "BASICO",
      maxPollas: 3,
      maxParticipantesPorPolla: 50,
      permiteLogo: true,
      permiteExportarExcel: false,
      permiteMultiplesAdmins: false,
    },
  });
  await prisma.plan.create({
    data: {
      nombre: "PRO",
      maxPollas: 10,
      maxParticipantesPorPolla: 200,
      permiteLogo: true,
      permiteExportarExcel: true,
      permiteMultiplesAdmins: true,
    },
  });
  await prisma.plan.create({
    data: {
      nombre: "EMPRESA",
      maxPollas: 100,
      maxParticipantesPorPolla: 5000,
      permiteLogo: true,
      permiteExportarExcel: true,
      permiteMultiplesAdmins: true,
    },
  });

  console.log("Creando usuarios (super admin y owner)...");
  const passwordSuperAdmin = await bcrypt.hash(SUPERADMIN_PASSWORD, SALT_ROUNDS);
  const passwordOwner = await bcrypt.hash(OWNER_PASSWORD, SALT_ROUNDS);

  await prisma.user.create({
    data: {
      email: SUPERADMIN_EMAIL,
      passwordHash: passwordSuperAdmin,
      nombre: "Super Admin",
      globalRole: "SUPER_ADMIN",
    },
  });

  const owner = await prisma.user.create({
    data: {
      email: OWNER_EMAIL,
      passwordHash: passwordOwner,
      nombre: OWNER_NOMBRE,
    },
  });

  console.log("Creando organización...");
  const org = await prisma.organizacion.create({
    data: {
      nombre: ORG_NOMBRE,
      slug: ORG_SLUG,
      plan: "GRATIS",
      planId: planGratis.id,
      brandColor: "#1a3a5c",
    },
  });

  await prisma.membresia.create({
    data: {
      userId: owner.id,
      organizacionId: org.id,
      role: "OWNER",
    },
  });

  console.log("Seed de producción completado.");
  console.log("---");
  console.log("Usuarios creados:");
  console.log(`  SUPER_ADMIN: ${SUPERADMIN_EMAIL}`);
  console.log(`  OWNER:       ${OWNER_EMAIL}`);
  console.log(`Organización: ${org.nombre} (${org.slug})`);
  console.log("Sin miembros demo ni pollas de ejemplo.");
  console.log("Cambia la contraseña del owner desde Mi cuenta tras el primer ingreso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
