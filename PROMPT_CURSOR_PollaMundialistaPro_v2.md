# PROMPT MAESTRO — Polla Mundialista Pro (SaaS Multitenant · Deploy en Render)

> Pega este archivo como contexto raíz en Cursor (o como primer mensaje del Agente/Composer). Está diseñado para que Cursor construya el proyecto completo y ejecutable, trabajando por fases y dejando el código compilando entre cada una.

---

## 0. ROL E INSTRUCCIONES DE EJECUCIÓN PARA CURSOR

Actúa como desarrollador senior full-stack experto en SaaS multitenant con **Next.js 15 (App Router), TypeScript, Prisma, PostgreSQL, Tailwind CSS, Auth.js/NextAuth** y despliegue en **Render**.

Vas a construir **Polla Mundialista Pro**: una plataforma SaaS recreativa (NO de apuestas con dinero) donde distintas organizaciones —empresas, universidades, familias, grupos— crean y administran sus propias pollas de pronósticos deportivos.

Reglas de trabajo (obligatorias):
1. Genera el proyecto **completo y ejecutable**, no fragmentos sueltos.
2. Trabaja **por fases** (sección 13). Al terminar cada fase, deja el proyecto **compilando sin errores de TypeScript ni lint**, lista los archivos creados con su ruta y continúa.
3. **TypeScript estricto** en todo. Prohibido `any` salvo justificación escrita.
4. Prioriza una **primera versión funcional en local** antes de mejoras visuales avanzadas.
5. El aislamiento multitenant se valida **siempre en el servidor**, nunca solo en el frontend.
6. Entrega `README.md` completo + `render.yaml` al final.

Versiones fijas (no improvisar):
- Node.js 20 LTS · Next.js 15 · React 19 · Prisma 5+ · TypeScript 5+ · pnpm.

---

## 1. CONCEPTO Y OBJETIVO

Plataforma SaaS donde:
- Un usuario crea una **organización** (o se une con código de invitación).
- Una organización tiene **una o varias pollas**.
- Cada polla tiene sus propios **equipos, partidos, reglas de puntuación, participantes y ranking**.
- Un usuario puede pertenecer a varias organizaciones y participar en varias pollas.
- Los administradores gestionan equipos, partidos, resultados, reglas y miembros.
- Los participantes registran pronósticos **antes del inicio de cada partido**.
- El sistema calcula puntos **automáticamente** al cargar resultados.
- Cada organización ve **únicamente** sus propios datos.

---

## 2. STACK TECNOLÓGICO (obligatorio)

- **Next.js 15** App Router (Server Components + Server Actions).
- **TypeScript** estricto.
- **Prisma ORM** + **PostgreSQL** (local primero; Render Postgres en producción).
- **Tailwind CSS** + componentes propios limpios (opcional shadcn/ui si agiliza).
- **Auth.js / NextAuth** con proveedor **Credentials** + **bcrypt** para contraseñas. Sesiones JWT seguras.
- **Zod** para validación en cliente y servidor.
- **React Hook Form** en formularios.
- **recharts** para gráficos del dashboard.
- **lucide-react** para iconos.
- Código modular, escalable y limpio.

Paleta de marca (configurar en `tailwind.config.ts` como `brand`):
- Azul primario `#1a3a5c` · Oro/acento `#e8a020` · Verde positivo `#4CAF82` · Gris fondo `#f1f3f6`.
Fuente: Inter (fallback system-ui). Diseño **mobile-first** (la mayoría de jugadores entra desde el celular).

---

## 3. ARQUITECTURA MULTITENANT

- **Una sola base de datos PostgreSQL** (no una BD por empresa en esta versión).
- Separación por **`organizacionId`** y **`pollaId`** + relaciones correctas.
- **No hay RLS de base de datos** (no usamos Supabase). El aislamiento se garantiza en la **capa de aplicación**: TODA consulta de negocio pasa por helpers que filtran por tenant y validan rol. Está PROHIBIDO consultar modelos de negocio sin pasar por `lib/tenant.ts` / `lib/permissions.ts`.

---

## 4. ROLES

**Global (`GlobalRole`):** `USER`, `SUPER_ADMIN` (administra toda la plataforma: organizaciones, usuarios, planes, métricas).

**En la organización (`OrgRole`):**
- `OWNER`: dueño; administra miembros, crea/administra pollas, configura la organización.
- `ADMIN`: crea/administra pollas, equipos, partidos, resultados, reglas.
- `MIEMBRO`: participa en pollas donde esté inscrito; ve rankings y pronostica.

**En la polla (`PollaRole`):**
- `ADMIN_POLLA`: administra esa polla específica.
- `PARTICIPANTE`: pronostica y ve ranking.
- `ESPECTADOR`: solo lectura.

Un usuario puede tener distinto rol en cada organización y en cada polla.

---

## 5. MODELO DE DATOS (Prisma)

Genera `prisma/schema.prisma` con estos modelos. Incluye índices por `organizacionId`/`pollaId`, `@@unique` donde se indica y `onDelete: Cascade` donde aplique.

- **User** — `id`, `email` (único), `passwordHash`, `nombre`, `globalRole` (GlobalRole, default USER), `createdAt`, `updatedAt`.
- **Organizacion** — `id`, `nombre`, `slug` (único), `logoUrl?`, `plan` (PlanTipo, default GRATIS), `planId?`, `estado`, `brandColor?`, `createdAt`, `updatedAt`.
- **Membresia** — `id`, `userId`, `organizacionId`, `role` (OrgRole), `estado` (EstadoMembresia), timestamps. `@@unique([userId, organizacionId])`.
- **Invitacion** — `id`, `organizacionId`, `codigo` (único), `emailInvitado?`, `roleAsignado` (OrgRole), `estado`, `fechaExpiracion`, `createdAt`.
- **Polla** — `id`, `organizacionId`, `nombre`, `slug`, `descripcion?`, `torneo?`, `estado` (EstadoPolla, default BORRADOR), `fechaInicio?`, `fechaFin?`, `codigoInvitacion?`, `esPublica` (default false), `lockMode` (LockMode, default PER_MATCH), `deadlineGlobal?`, timestamps. `@@unique([organizacionId, slug])`.
- **ParticipantePolla** — `id`, `userId`, `pollaId`, `role` (PollaRole), `estado` (EstadoMembresia), `pago` (boolean, default false), `puntosTotales` (int, default 0), `marcadoresExactos` (int, default 0), `aciertosResultado` (int, default 0), timestamps. `@@unique([userId, pollaId])`.
- **Equipo** — `id`, `pollaId`, `nombre`, `grupo?`, `banderaUrl?`, timestamps.
- **Partido** — `id`, `pollaId`, `equipoLocalId`, `equipoVisitanteId`, `fechaHora`, `fase?`, `estado` (EstadoPartido, default PENDIENTE), `golesLocalReal?`, `golesVisitanteReal?`, timestamps.
- **Pronostico** — `id`, `userId`, `pollaId`, `partidoId`, `golesLocal`, `golesVisitante`, `puntos` (int, default 0), `tipoAcierto` (TipoAcierto, default NINGUNO), timestamps. `@@unique([userId, partidoId])`.
- **ReglaPuntuacion** — `id`, `pollaId` (1:1), `puntosMarcadorExacto` (default 5), `puntosResultado` (default 3), `puntosBonusDiferencia` (default 1), `puntosCampeon?` (default 20), `puntosFinalista?` (default 10), `puntosGoleador?`, `permiteEditarHastaInicio` (default true), timestamps.
- **Plan** — `id`, `nombre`, `maxPollas`, `maxParticipantesPorPolla`, `permiteLogo`, `permiteExportarExcel`, `permiteMultiplesAdmins`, timestamps.

**Enums:**
- `GlobalRole`: USER, SUPER_ADMIN
- `OrgRole`: OWNER, ADMIN, MIEMBRO
- `PollaRole`: ADMIN_POLLA, PARTICIPANTE, ESPECTADOR
- `EstadoMembresia`: ACTIVO, INVITADO, SUSPENDIDO
- `EstadoPolla`: BORRADOR, ACTIVA, FINALIZADA, ARCHIVADA
- `EstadoPartido`: PENDIENTE, CERRADO, FINALIZADO
- `TipoAcierto`: EXACTO, DIFERENCIA, RESULTADO, NINGUNO
- `LockMode`: PER_MATCH, GLOBAL_DEADLINE
- `PlanTipo`: GRATIS, BASICO, PRO, EMPRESA

---

## 6. LÓGICA DE PUNTUACIÓN (núcleo — `lib/scoring.ts`)

Función pura `calcularPuntos(pronostico, partido, regla)` que devuelve `{ puntos, tipoAcierto }`:

```
si partido no FINALIZADO o faltan goles reales -> { puntos: 0, tipoAcierto: NINGUNO }
si golesLocal === golesLocalReal && golesVisitante === golesVisitanteReal
    -> { regla.puntosMarcadorExacto, EXACTO }
sea signoP = sign(golesLocal - golesVisitante), signoR = sign(golesLocalReal - golesVisitanteReal)
si signoP === signoR:
    si (golesLocal - golesVisitante) === (golesLocalReal - golesVisitanteReal)
        -> { regla.puntosResultado + regla.puntosBonusDiferencia, DIFERENCIA }
    si no
        -> { regla.puntosResultado, RESULTADO }
si no -> { 0, NINGUNO }
```

Funciones adicionales:
- `recalcularPuntosPartido(partidoId)`: al registrar/editar el resultado, recalcula en **una transacción** los puntos de TODAS las predicciones de ese partido.
- `recalcularRankingPolla(pollaId)`: recomputa `puntosTotales`, `marcadoresExactos` y `aciertosResultado` de cada `ParticipantePolla`.

**Tests unitarios** (Vitest) de `calcularPuntos` cubriendo: exacto, diferencia acertada, resultado sin diferencia, empate acertado, fallo, y partido pendiente.

---

## 7. BLOQUEO DE PRONÓSTICOS (anti-trampa — criterio duro)

- `lockMode = PER_MATCH`: cada partido se cierra en su `fechaHora`. Pasado ese instante, **no** se acepta crear/editar el pronóstico de ese partido.
- `lockMode = GLOBAL_DEADLINE`: todo se cierra en `deadlineGlobal`.
- Mostrar estado "Abierto / Cerrado" y deshabilitar inputs en la UI.
- **Validar el bloqueo SIEMPRE en la Server Action**, además del cliente. Un request directo a la acción con un partido ya iniciado debe ser rechazado.

---

## 8. RANKING (con desempates)

- Ranking **por polla** (y separado por organización). Solo participantes de esa polla.
- Orden: 1) `puntosTotales` desc, 2) `marcadoresExactos` desc, 3) `aciertosResultado` desc, 4) nombre asc.
- Mostrar: posición (podio 1/2/3 resaltado), nombre, puntos totales, nº de pronósticos, marcadores exactos, aciertos por resultado.

---

## 9. MÓDULOS Y FUNCIONALIDAD

1. **Auth:** registro, login, logout, sesiones seguras, protección de rutas privadas y por rol, redirección al dashboard.
2. **Onboarding:** tras registrarse, crear organización (queda como OWNER) o unirse con código de invitación.
3. **Organizaciones:** crear, editar, dashboard.
4. **Membresías:** relación usuario↔organización con rol y estado.
5. **Invitaciones:** generar código con expiración; unirse con el código.
6. **Pollas:** crear, listar por organización, editar, archivar.
7. **Participantes de polla:** inscripción, rol, estado, control de `pago`.
8. **Equipos:** CRUD por polla.
9. **Partidos:** CRUD por polla con fase, fecha/hora y estado.
10. **Pronósticos:** uno por (usuario, partido); solo editable por su dueño y antes del bloqueo.
11. **Resultados:** el admin registra el marcador real → partido pasa a FINALIZADO → recálculo automático de puntos y ranking.
12. **Reglas de puntuación:** propias por polla, editables.
13. **Ranking:** según sección 8.
14. **Dashboards:** global del usuario (sus organizaciones y pollas), de organización (totales, pollas activas, próximos partidos), de polla (próximos partidos, mis puntos, mi posición, ranking parcial, partidos sin pronosticar).
15. **Pozo (opcional, recreativo):** sobre participantes con `pago = true`, total = nº pagados × valor inscripción de la polla, reparto sugerido 60/30/10. (No maneja dinero real; es informativo.)
16. **Planes SaaS:** estructura inicial con límites; gestionables manualmente o desde panel SUPER_ADMIN. La organización tiene `plan` (PlanTipo) o `planId`.

---

## 10. RUTAS (App Router)

```
app/
├── page.tsx                         (landing pública)
├── login/  · registro/  · onboarding/
├── dashboard/                       (dashboard global del usuario)
├── org/[orgSlug]/
│   ├── page.tsx
│   ├── miembros/  · configuracion/
│   └── pollas/
│       ├── page.tsx  · nueva/
│       └── [pollaSlug]/
│           ├── page.tsx
│           ├── partidos/  · equipos/  · pronosticos/
│           ├── ranking/   · resultados/ · configuracion/
└── admin-platform/
    ├── page.tsx · organizaciones/ · usuarios/ · planes/
```

---

## 11. COMPONENTES Y LIBRERÍAS INTERNAS

```
components/  Navbar, Sidebar, OrgSwitcher, PollaCard, PartidoCard,
             PronosticoForm, RankingTable, EstadoBadge, StatsCard,
             InviteMemberForm, EmptyState, LockBadge
lib/         prisma.ts, auth.ts, permissions.ts, scoring.ts,
             validations.ts (Zod), slug.ts, tenant.ts
```

Helpers obligatorios (todos usados en el servidor):
`getCurrentUser()`, `getUserOrganizations()`, `requireAuth()`, `requireOrgRole(orgSlug, roles[])`, `requirePollaRole(pollaId, roles[])`, `getTenantBySlug(slug)`, `calcularPuntos()`, `recalcularPuntosPartido()`, `recalcularRankingPolla()`.

---

## 12. SEGURIDAD MULTITENANT (criterio duro)

- Ningún usuario ve datos de una organización a la que no pertenece.
- TODA consulta filtra por `organizacionId` o `pollaId` y pasa por los helpers de `permissions.ts`.
- Validar membresía antes de renderizar dashboards; validar rol antes de crear/editar/eliminar.
- Un participante solo edita sus propios pronósticos.
- `SUPER_ADMIN` puede ver toda la plataforma.
- Nunca confiar solo en controles visuales; validar permisos en servidor (Server Actions).
- Contraseñas siempre con **bcrypt** (incluido el seed).

---

## 13. FASES DE CONSTRUCCIÓN (orden)

1. Base del proyecto (Next 15 + TS) y Tailwind con paleta de marca.
2. Prisma + conexión Postgres local + `schema.prisma` multitenant + enums.
3. Migraciones iniciales.
4. `prisma/seed.ts` (sección 14).
5. Auth.js/NextAuth (Credentials + bcrypt) + protección de rutas y por rol.
6. Onboarding (crear org / unirse por código).
7. Organizaciones + membresías + invitaciones.
8. Pollas + participantes.
9. Equipos.
10. Partidos.
11. Pronósticos (con bloqueo en servidor).
12. Resultados + recálculo automático.
13. Ranking (con desempates) + reglas de puntuación.
14. Dashboards (global / org / polla) + gráficos.
15. Panel SUPER_ADMIN + planes.
16. `README.md` + `render.yaml` + preparación de deploy.

**Deja el código compilando al cerrar cada fase.**

---

## 14. SEED (`prisma/seed.ts`)

Contraseñas hasheadas con bcrypt (nunca en texto plano en la BD):
- SUPER_ADMIN: `superadmin@polla.com` / `SuperAdmin123456`
- OWNER: `owner@empresa.com` / `Owner123456`
- Organización: "Universidad Icesi", slug `universidad-icesi`, plan GRATIS.
- Polla: "Mundial 2026 Demo", slug `mundial-2026-demo`, lockMode PER_MATCH.
- Equipos: Colombia, Brasil, Argentina, Francia, Alemania, España.
- Partidos de prueba con **fechas futuras** (para poder pronosticar) y al menos uno FINALIZADO con resultado (para validar el recálculo).
- Reglas por defecto (exacto 5, resultado 3, bonus diferencia 1, campeón 20, finalista 10).
- 4–5 participantes de prueba con algunos pronósticos.
- Planes: GRATIS, BASICO, PRO, EMPRESA con límites distintos.

---

## 15. EJECUCIÓN LOCAL

```bash
pnpm install
# crear BD local: polla_mundialista_saas
# configurar .env (ver .env.example)
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev   # http://localhost:3000
```

`.env.example`:
```
DATABASE_URL="postgresql://usuario:password@localhost:5432/polla_mundialista_saas"
NEXTAUTH_SECRET="cambiar_por_un_secret_seguro"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## 16. DESPLIEGUE EN RENDER

Generar **`render.yaml`** (Blueprint) + sección en el README.

`render.yaml` con:
- Un **PostgreSQL** gestionado de Render.
- Un **Web Service** (Node) conectado al repo de GitHub, con `DATABASE_URL` enlazado a la BD, y `NEXTAUTH_SECRET` como variable generada/secreta.

Configuración del Web Service:
- **Build command:** `pnpm install && pnpm prisma generate && pnpm prisma migrate deploy && pnpm build`
- **Start command:** `pnpm start`
- Variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (= URL pública de Render), `NODE_ENV=production`.
- `package.json` con `"build": "next build"` y `"start": "next start -p $PORT"` (Render inyecta `$PORT`).

Notas a incluir en el README:
- `migrate deploy` (no `migrate dev`) en producción.
- Ejecutar el seed solo una vez de forma manual tras el primer deploy (o un script `seed:prod` opcional).
- El plan free de Render duerme el servicio tras inactividad: el primer request tras dormir tarda unos segundos (aclararlo).
- Configurar `output: 'standalone'` en `next.config.js` para imagen más liviana.

---

## 17. LANDING PAGE

- Nombre: **Polla Mundialista Pro**.
- Mensaje: "Crea pollas deportivas para tu empresa, familia o grupo."
- Botones: Crear cuenta · Iniciar sesión.
- Características: Multiempresa · Rankings automáticos · Reglas personalizables · Pronósticos por partido · Ideal para empresas, universidades, familias y amigos.

---

## 18. README (entregable final)

Descripción, arquitectura SaaS multitenant, tecnologías, requisitos, instalación local, Postgres local, Prisma, seed, usuarios de prueba, estructura del proyecto, seguridad multitenant, despliegue en Render (con `render.yaml`), y próximas mejoras (pagos por plan, API de resultados en vivo, exportación a Excel, notificaciones por email).

---

## 19. CRITERIOS DE ACEPTACIÓN (la app está lista cuando…)

1. Dos organizaciones distintas NO ven datos la una de la otra (verificable con dos usuarios).
2. Un participante no puede registrar/editar un pronóstico de un partido ya iniciado (bloqueado también si se llama la acción directamente).
3. Al registrar el marcador real, los puntos y el ranking se actualizan correctamente según las reglas de esa polla.
4. Las reglas de puntaje son editables por el admin y afectan el cálculo.
5. El ranking respeta los desempates definidos.
6. La app es usable desde un celular.
7. `pnpm install && pnpm dev` levanta el proyecto en local; `pnpm test` pasa los tests de scoring.
8. El proyecto despliega en Render siguiendo el `render.yaml` y el README.
9. Cero errores de TypeScript y de lint.

---

### PRIMER PASO — EJECÚTALO YA
Comienza por la **Fase 1**: inicializa Next.js 15 con TypeScript, configura Tailwind con la paleta de marca en `tailwind.config.ts`, crea la estructura de carpetas (`app/`, `components/`, `lib/`, `prisma/`) y genera `.env.example`. Lista cada archivo creado con su ruta exacta. Deja el proyecto compilando y continúa con la Fase 2 (Prisma + schema multitenant).
