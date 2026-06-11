-- CreateEnum
CREATE TYPE "GlobalRole" AS ENUM ('USER', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('OWNER', 'ADMIN', 'MIEMBRO');

-- CreateEnum
CREATE TYPE "PollaRole" AS ENUM ('ADMIN_POLLA', 'PARTICIPANTE', 'ESPECTADOR');

-- CreateEnum
CREATE TYPE "EstadoMembresia" AS ENUM ('ACTIVO', 'INVITADO', 'SUSPENDIDO');

-- CreateEnum
CREATE TYPE "EstadoPolla" AS ENUM ('BORRADOR', 'ACTIVA', 'FINALIZADA', 'ARCHIVADA');

-- CreateEnum
CREATE TYPE "EstadoPartido" AS ENUM ('PENDIENTE', 'CERRADO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "TipoAcierto" AS ENUM ('EXACTO', 'DIFERENCIA', 'RESULTADO', 'NINGUNO');

-- CreateEnum
CREATE TYPE "LockMode" AS ENUM ('PER_MATCH', 'GLOBAL_DEADLINE');

-- CreateEnum
CREATE TYPE "PlanTipo" AS ENUM ('GRATIS', 'BASICO', 'PRO', 'EMPRESA');

-- CreateEnum
CREATE TYPE "EstadoInvitacion" AS ENUM ('PENDIENTE', 'ACEPTADA', 'EXPIRADA', 'REVOCADA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "globalRole" "GlobalRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizaciones" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "plan" "PlanTipo" NOT NULL DEFAULT 'GRATIS',
    "planId" TEXT,
    "estado" "EstadoMembresia" NOT NULL DEFAULT 'ACTIVO',
    "brandColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membresias" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizacionId" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL,
    "estado" "EstadoMembresia" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membresias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitaciones" (
    "id" TEXT NOT NULL,
    "organizacionId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "emailInvitado" TEXT,
    "roleAsignado" "OrgRole" NOT NULL,
    "estado" "EstadoInvitacion" NOT NULL DEFAULT 'PENDIENTE',
    "fechaExpiracion" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pollas" (
    "id" TEXT NOT NULL,
    "organizacionId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "torneo" TEXT,
    "estado" "EstadoPolla" NOT NULL DEFAULT 'BORRADOR',
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "codigoInvitacion" TEXT,
    "esPublica" BOOLEAN NOT NULL DEFAULT false,
    "lockMode" "LockMode" NOT NULL DEFAULT 'PER_MATCH',
    "deadlineGlobal" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pollas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participantes_polla" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pollaId" TEXT NOT NULL,
    "role" "PollaRole" NOT NULL DEFAULT 'PARTICIPANTE',
    "estado" "EstadoMembresia" NOT NULL DEFAULT 'ACTIVO',
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "puntosTotales" INTEGER NOT NULL DEFAULT 0,
    "marcadoresExactos" INTEGER NOT NULL DEFAULT 0,
    "aciertosResultado" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participantes_polla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipos" (
    "id" TEXT NOT NULL,
    "pollaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "grupo" TEXT,
    "banderaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partidos" (
    "id" TEXT NOT NULL,
    "pollaId" TEXT NOT NULL,
    "equipoLocalId" TEXT NOT NULL,
    "equipoVisitanteId" TEXT NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL,
    "fase" TEXT,
    "estado" "EstadoPartido" NOT NULL DEFAULT 'PENDIENTE',
    "golesLocalReal" INTEGER,
    "golesVisitanteReal" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pronosticos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pollaId" TEXT NOT NULL,
    "partidoId" TEXT NOT NULL,
    "golesLocal" INTEGER NOT NULL,
    "golesVisitante" INTEGER NOT NULL,
    "puntos" INTEGER NOT NULL DEFAULT 0,
    "tipoAcierto" "TipoAcierto" NOT NULL DEFAULT 'NINGUNO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pronosticos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reglas_puntuacion" (
    "id" TEXT NOT NULL,
    "pollaId" TEXT NOT NULL,
    "puntosMarcadorExacto" INTEGER NOT NULL DEFAULT 5,
    "puntosResultado" INTEGER NOT NULL DEFAULT 3,
    "puntosBonusDiferencia" INTEGER NOT NULL DEFAULT 1,
    "puntosCampeon" INTEGER DEFAULT 20,
    "puntosFinalista" INTEGER DEFAULT 10,
    "puntosGoleador" INTEGER,
    "permiteEditarHastaInicio" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reglas_puntuacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "maxPollas" INTEGER NOT NULL,
    "maxParticipantesPorPolla" INTEGER NOT NULL,
    "permiteLogo" BOOLEAN NOT NULL DEFAULT false,
    "permiteExportarExcel" BOOLEAN NOT NULL DEFAULT false,
    "permiteMultiplesAdmins" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organizaciones_slug_key" ON "organizaciones"("slug");

-- CreateIndex
CREATE INDEX "membresias_organizacionId_idx" ON "membresias"("organizacionId");

-- CreateIndex
CREATE INDEX "membresias_userId_idx" ON "membresias"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "membresias_userId_organizacionId_key" ON "membresias"("userId", "organizacionId");

-- CreateIndex
CREATE UNIQUE INDEX "invitaciones_codigo_key" ON "invitaciones"("codigo");

-- CreateIndex
CREATE INDEX "invitaciones_organizacionId_idx" ON "invitaciones"("organizacionId");

-- CreateIndex
CREATE INDEX "pollas_organizacionId_idx" ON "pollas"("organizacionId");

-- CreateIndex
CREATE UNIQUE INDEX "pollas_organizacionId_slug_key" ON "pollas"("organizacionId", "slug");

-- CreateIndex
CREATE INDEX "participantes_polla_pollaId_idx" ON "participantes_polla"("pollaId");

-- CreateIndex
CREATE INDEX "participantes_polla_userId_idx" ON "participantes_polla"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "participantes_polla_userId_pollaId_key" ON "participantes_polla"("userId", "pollaId");

-- CreateIndex
CREATE INDEX "equipos_pollaId_idx" ON "equipos"("pollaId");

-- CreateIndex
CREATE INDEX "partidos_pollaId_idx" ON "partidos"("pollaId");

-- CreateIndex
CREATE INDEX "pronosticos_pollaId_idx" ON "pronosticos"("pollaId");

-- CreateIndex
CREATE INDEX "pronosticos_partidoId_idx" ON "pronosticos"("partidoId");

-- CreateIndex
CREATE INDEX "pronosticos_userId_idx" ON "pronosticos"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "pronosticos_userId_partidoId_key" ON "pronosticos"("userId", "partidoId");

-- CreateIndex
CREATE UNIQUE INDEX "reglas_puntuacion_pollaId_key" ON "reglas_puntuacion"("pollaId");

-- AddForeignKey
ALTER TABLE "organizaciones" ADD CONSTRAINT "organizaciones_planId_fkey" FOREIGN KEY ("planId") REFERENCES "planes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitaciones" ADD CONSTRAINT "invitaciones_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pollas" ADD CONSTRAINT "pollas_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participantes_polla" ADD CONSTRAINT "participantes_polla_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participantes_polla" ADD CONSTRAINT "participantes_polla_pollaId_fkey" FOREIGN KEY ("pollaId") REFERENCES "pollas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_pollaId_fkey" FOREIGN KEY ("pollaId") REFERENCES "pollas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_pollaId_fkey" FOREIGN KEY ("pollaId") REFERENCES "pollas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_equipoLocalId_fkey" FOREIGN KEY ("equipoLocalId") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_equipoVisitanteId_fkey" FOREIGN KEY ("equipoVisitanteId") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pronosticos" ADD CONSTRAINT "pronosticos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pronosticos" ADD CONSTRAINT "pronosticos_pollaId_fkey" FOREIGN KEY ("pollaId") REFERENCES "pollas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pronosticos" ADD CONSTRAINT "pronosticos_partidoId_fkey" FOREIGN KEY ("partidoId") REFERENCES "partidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reglas_puntuacion" ADD CONSTRAINT "reglas_puntuacion_pollaId_fkey" FOREIGN KEY ("pollaId") REFERENCES "pollas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
