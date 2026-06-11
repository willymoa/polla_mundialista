import { PrismaClient, TipoAcierto } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main() {
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

  console.log("Creando usuarios...");
  const passwordSuperAdmin = await bcrypt.hash("SuperAdmin123456", SALT_ROUNDS);
  const passwordOwner = await bcrypt.hash("Owner123456", SALT_ROUNDS);
  const passwordParticipante = await bcrypt.hash("Participante123456", SALT_ROUNDS);

  await prisma.user.create({
    data: {
      email: "superadmin@polla.com",
      passwordHash: passwordSuperAdmin,
      nombre: "Super Admin",
      globalRole: "SUPER_ADMIN",
    },
  });

  const owner = await prisma.user.create({
    data: {
      email: "owner@empresa.com",
      passwordHash: passwordOwner,
      nombre: "Carlos Owner",
    },
  });

  const participantes = await Promise.all(
    [
      { email: "ana@polla.com", nombre: "Ana Gómez" },
      { email: "juan@polla.com", nombre: "Juan Pérez" },
      { email: "maria@polla.com", nombre: "María Rodríguez" },
      { email: "pedro@polla.com", nombre: "Pedro Sánchez" },
    ].map((u) =>
      prisma.user.create({
        data: {
          email: u.email,
          passwordHash: passwordParticipante,
          nombre: u.nombre,
        },
      })
    )
  );
  const [ana, juan, maria, pedro] = participantes;

  console.log("Creando organización...");
  const org = await prisma.organizacion.create({
    data: {
      nombre: "Universidad Icesi",
      slug: "universidad-icesi",
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

  await Promise.all(
    [ana, juan, maria, pedro].map((u) =>
      prisma.membresia.create({
        data: {
          userId: u.id,
          organizacionId: org.id,
          role: "MIEMBRO",
        },
      })
    )
  );

  console.log("Creando polla...");
  const polla = await prisma.polla.create({
    data: {
      organizacionId: org.id,
      nombre: "Mundial 2026 Demo",
      slug: "mundial-2026-demo",
      descripcion: "Polla de demostración para el Mundial 2026.",
      torneo: "Mundial 2026",
      estado: "ACTIVA",
      lockMode: "PER_MATCH",
      esPublica: false,
      codigoInvitacion: "MUNDIAL2026",
    },
  });

  const regla = await prisma.reglaPuntuacion.create({
    data: {
      pollaId: polla.id,
      puntosMarcadorExacto: 5,
      puntosResultado: 3,
      puntosBonusDiferencia: 1,
      puntosCampeon: 20,
      puntosFinalista: 10,
    },
  });

  console.log("Creando equipos...");
  const equiposData = [
    { nombre: "Colombia", grupo: "A" },
    { nombre: "Brasil", grupo: "A" },
    { nombre: "Argentina", grupo: "B" },
    { nombre: "Francia", grupo: "B" },
    { nombre: "Alemania", grupo: "C" },
    { nombre: "España", grupo: "C" },
  ];
  const equipos = await Promise.all(
    equiposData.map((e) =>
      prisma.equipo.create({
        data: { pollaId: polla.id, nombre: e.nombre, grupo: e.grupo },
      })
    )
  );
  const [colombia, brasil, argentina, francia, alemania, espana] = equipos;

  console.log("Creando participantes de la polla...");
  await prisma.participantePolla.create({
    data: {
      userId: owner.id,
      pollaId: polla.id,
      role: "ADMIN_POLLA",
      pago: true,
    },
  });

  await Promise.all(
    [ana, juan, maria, pedro].map((u, i) =>
      prisma.participantePolla.create({
        data: {
          userId: u.id,
          pollaId: polla.id,
          role: "PARTICIPANTE",
          pago: i % 2 === 0,
        },
      })
    )
  );

  console.log("Creando partidos...");
  const ahora = new Date();
  const enUnaSemana = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);
  const enDosSemanas = new Date(ahora.getTime() + 14 * 24 * 60 * 60 * 1000);
  const haceUnaSemana = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Partido finalizado, ya con resultado real, para validar el recálculo de puntos.
  const partidoFinalizado = await prisma.partido.create({
    data: {
      pollaId: polla.id,
      equipoLocalId: colombia.id,
      equipoVisitanteId: argentina.id,
      fechaHora: haceUnaSemana,
      fase: "Fase de grupos",
      estado: "FINALIZADO",
      golesLocalReal: 2,
      golesVisitanteReal: 1,
    },
  });

  // Partidos pendientes con fechas futuras, abiertos para pronosticar.
  const partidoFuturo1 = await prisma.partido.create({
    data: {
      pollaId: polla.id,
      equipoLocalId: brasil.id,
      equipoVisitanteId: francia.id,
      fechaHora: enUnaSemana,
      fase: "Fase de grupos",
      estado: "PENDIENTE",
    },
  });

  await prisma.partido.create({
    data: {
      pollaId: polla.id,
      equipoLocalId: alemania.id,
      equipoVisitanteId: espana.id,
      fechaHora: enUnaSemana,
      fase: "Fase de grupos",
      estado: "PENDIENTE",
    },
  });

  await prisma.partido.create({
    data: {
      pollaId: polla.id,
      equipoLocalId: colombia.id,
      equipoVisitanteId: brasil.id,
      fechaHora: enDosSemanas,
      fase: "Fase de grupos",
      estado: "PENDIENTE",
    },
  });

  console.log("Creando pronósticos...");
  // Pronósticos sobre el partido ya finalizado (2-1), con puntos calculados
  // según las reglas por defecto (exacto 5, resultado 3, bonus diferencia 1).
  const pronosticosFinalizado: {
    userId: string;
    golesLocal: number;
    golesVisitante: number;
    puntos: number;
    tipoAcierto: TipoAcierto;
  }[] = [
    // Owner acierta el marcador exacto (2-1).
    {
      userId: owner.id,
      golesLocal: 2,
      golesVisitante: 1,
      puntos: regla.puntosMarcadorExacto,
      tipoAcierto: "EXACTO",
    },
    // Ana acierta el resultado y la diferencia de gol (1-0 -> diferencia +1).
    {
      userId: ana.id,
      golesLocal: 1,
      golesVisitante: 0,
      puntos: regla.puntosResultado + regla.puntosBonusDiferencia,
      tipoAcierto: "DIFERENCIA",
    },
    // Juan acierta el resultado pero no la diferencia (3-0 vs real 2-1).
    {
      userId: juan.id,
      golesLocal: 3,
      golesVisitante: 0,
      puntos: regla.puntosResultado,
      tipoAcierto: "RESULTADO",
    },
    // María falla por completo (predice empate, el real fue victoria local).
    {
      userId: maria.id,
      golesLocal: 1,
      golesVisitante: 1,
      puntos: 0,
      tipoAcierto: "NINGUNO",
    },
    // Pedro falla por completo (predice victoria visitante).
    {
      userId: pedro.id,
      golesLocal: 0,
      golesVisitante: 2,
      puntos: 0,
      tipoAcierto: "NINGUNO",
    },
  ];

  for (const p of pronosticosFinalizado) {
    await prisma.pronostico.create({
      data: {
        userId: p.userId,
        pollaId: polla.id,
        partidoId: partidoFinalizado.id,
        golesLocal: p.golesLocal,
        golesVisitante: p.golesVisitante,
        puntos: p.puntos,
        tipoAcierto: p.tipoAcierto,
      },
    });
  }

  // Actualizar acumulados de los participantes según los pronósticos del partido finalizado.
  await prisma.participantePolla.update({
    where: { userId_pollaId: { userId: owner.id, pollaId: polla.id } },
    data: { puntosTotales: { increment: regla.puntosMarcadorExacto }, marcadoresExactos: { increment: 1 }, aciertosResultado: { increment: 1 } },
  });
  await prisma.participantePolla.update({
    where: { userId_pollaId: { userId: ana.id, pollaId: polla.id } },
    data: { puntosTotales: { increment: regla.puntosResultado + regla.puntosBonusDiferencia }, aciertosResultado: { increment: 1 } },
  });
  await prisma.participantePolla.update({
    where: { userId_pollaId: { userId: juan.id, pollaId: polla.id } },
    data: { puntosTotales: { increment: regla.puntosResultado }, aciertosResultado: { increment: 1 } },
  });

  // Pronósticos abiertos sobre un partido futuro (sin puntos aún).
  await prisma.pronostico.create({
    data: {
      userId: ana.id,
      pollaId: polla.id,
      partidoId: partidoFuturo1.id,
      golesLocal: 2,
      golesVisitante: 1,
    },
  });
  await prisma.pronostico.create({
    data: {
      userId: juan.id,
      pollaId: polla.id,
      partidoId: partidoFuturo1.id,
      golesLocal: 1,
      golesVisitante: 1,
    },
  });

  console.log("Creando pollas de ejemplo con estados especiales...");
  await prisma.polla.create({
    data: {
      organizacionId: org.id,
      nombre: "Polla Inactiva Demo",
      slug: "inactiva-demo",
      descripcion: "Polla de ejemplo en estado INACTIVA (solo lectura).",
      torneo: "Mundial 2026",
      estado: "INACTIVA",
      lockMode: "PER_MATCH",
      reglaPuntuacion: { create: {} },
    },
  });

  await prisma.polla.create({
    data: {
      organizacionId: org.id,
      nombre: "Polla Oculta Demo",
      slug: "oculta-demo",
      descripcion: "Polla de ejemplo en estado OCULTA (solo admins la ven).",
      torneo: "Mundial 2026",
      estado: "OCULTA",
      lockMode: "PER_MATCH",
      reglaPuntuacion: { create: {} },
    },
  });

  console.log("Seed completado.");
  console.log("---");
  console.log("Usuarios de prueba:");
  console.log("  SUPER_ADMIN: superadmin@polla.com / SuperAdmin123456");
  console.log("  OWNER:       owner@empresa.com / Owner123456");
  console.log("  MIEMBROS:    ana@polla.com, juan@polla.com, maria@polla.com, pedro@polla.com / Participante123456");
  console.log(`Organización: ${org.nombre} (${org.slug})`);
  console.log(`Polla: ${polla.nombre} (${polla.slug})`);
  console.log("Pollas extra: inactiva-demo (INACTIVA), oculta-demo (OCULTA)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
