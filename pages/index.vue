<template>
  <div class="home-page">
    <header class="home-nav">
      <NuxtLink to="/" class="brand-link" aria-label="Ir al inicio de ADUS">
        <img src="/favicon.jpeg" alt="Logo ADUS" class="brand-logo">
        <span>ADUS Hospitality OS</span>
      </NuxtLink>

      <nav class="nav-actions" aria-label="Accesos principales">
        <a href="#funciones" class="nav-link">Funciones</a>
        <a href="#operacion" class="nav-link">Operación</a>
        <v-btn
          :to="sessionRoute"
          color="primary"
          variant="flat"
          rounded="lg"
          prepend-icon="mdi-login"
        >
          {{ sessionLabel }}
        </v-btn>
      </nav>
    </header>

    <main>
      <section class="hero-section">
        <div class="hero-copy">
          <div class="eyebrow">
            <Sparkles :size="16" />
            Gestión hotelera conectada
          </div>

          <h1>El inicio operativo para dirigir cada área del hotel</h1>

          <p class="hero-text">
            ADUS reúne reservas, recepción, habitaciones, servicios, caja,
            pagos, facturación y reportes en una sola experiencia clara para
            equipos de hotelería.
          </p>

          <div class="hero-actions">
            <v-btn
              :to="sessionRoute"
              color="primary"
              size="large"
              rounded="lg"
              prepend-icon="mdi-view-dashboard"
            >
              {{ sessionLabel }}
            </v-btn>
            <v-btn
              to="/register"
              color="secondary"
              size="large"
              rounded="lg"
              variant="tonal"
              prepend-icon="mdi-account-plus"
            >
              Crear cuenta
            </v-btn>
          </div>
        </div>

        <div class="hero-panel" aria-label="Resumen visual del sistema">
          <div class="panel-top">
            <div class="panel-brand">
              <img src="/favicon.jpeg" alt="" class="panel-logo">
              <div>
                <strong>Operación de hoy</strong>
                <span>Vista general del hotel</span>
              </div>
            </div>
            <span class="status-pill">En linea</span>
          </div>

          <div class="metric-grid">
            <article v-for="metric in metrics" :key="metric.label" class="metric-tile">
              <component :is="metric.icon" :size="22" />
              <strong>{{ metric.value }}</strong>
              <span>{{ metric.label }}</span>
            </article>
          </div>

          <div class="timeline">
            <div v-for="item in timeline" :key="item.title" class="timeline-item">
              <span class="timeline-dot" />
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="funciones" class="section-band">
        <div class="section-heading">
          <span>Funciones principales</span>
          <h2>Todo el recorrido del huésped, desde la reserva hasta el cierre de caja</h2>
        </div>

        <div class="feature-grid">
          <article v-for="feature in features" :key="feature.title" class="feature-card">
            <div class="feature-icon">
              <component :is="feature.icon" :size="24" />
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.text }}</p>
          </article>
        </div>
      </section>

      <section id="operacion" class="workflow-section">
        <div class="workflow-copy">
          <span>Operación por roles</span>
          <h2>Cada equipo ve lo que necesita para trabajar mejor</h2>
          <p>
            La plataforma organiza pantallas para administración, recepción,
            clientes, áreas operativas y superadministración. Así cada persona
            entra directo a sus tareas, sin perder tiempo buscando información.
          </p>
        </div>

        <div class="role-list">
          <article v-for="role in roles" :key="role.title" class="role-row">
            <component :is="role.icon" :size="22" />
            <div>
              <strong>{{ role.title }}</strong>
              <p>{{ role.text }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="closing-section">
        <div>
          <span>Lista para crecer</span>
          <h2>Una base pública clara y un sistema protegido por autenticación</h2>
          <p>
            Este inicio presenta el valor del sistema sin pedir acceso. Las
            operaciones internas siguen protegidas para usuarios autorizados y
            cada rol conserva su propio panel de trabajo.
          </p>
        </div>

        <v-btn
          :to="sessionRoute"
          color="primary"
          size="large"
          rounded="lg"
          prepend-icon="mdi-arrow-right"
        >
          {{ sessionLabel }}
        </v-btn>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  BadgeDollarSign,
  BedDouble,
  BellRing,
  Building2,
  CalendarCheck,
  ChartNoAxesColumnIncreasing,
  ClipboardCheck,
  CreditCard,
  FileText,
  Headphones,
  KeyRound,
  Landmark,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UsersRound,
  UtensilsCrossed,
} from '@lucide/vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'auth',
})

const authStore = useAuthStore()

const sessionRoute = computed(() => (
  authStore.isAuthenticated ? authStore.defaultRoute : '/login'
))

const sessionLabel = computed(() => (
  authStore.isAuthenticated ? 'Ir a mi panel' : 'Iniciar sesión'
))

const metrics = [
  { icon: CalendarCheck, value: 'Reservas', label: 'controladas en tiempo real' },
  { icon: BedDouble, value: 'Habitaciones', label: 'listas para asignar' },
  { icon: BadgeDollarSign, value: 'Caja', label: 'con pagos y folios claros' },
  { icon: ChartNoAxesColumnIncreasing, value: 'Reportes', label: 'para decidir con datos' },
]

const timeline = [
  {
    title: 'Recepción sin fricción',
    text: 'Check-in, check-out y seguimiento de reservas desde una misma vista.',
  },
  {
    title: 'Consumos conectados',
    text: 'Servicios, cargos y pedidos llegan al folio del huésped sin reprocesos.',
  },
  {
    title: 'Cierre ordenado',
    text: 'Pagos, caja y facturación quedan listos para consultar y auditar.',
  },
]

const features = [
  {
    icon: CalendarCheck,
    title: 'Reservas y disponibilidad',
    text: 'Consulta ocupación, crea reservas, confirma estados y evita cruces entre habitaciones.',
  },
  {
    icon: KeyRound,
    title: 'Check-in y check-out',
    text: 'Acompaña a recepción con entradas, salidas, pendientes y datos clave del huésped.',
  },
  {
    icon: ReceiptText,
    title: 'Folios, pagos y caja',
    text: 'Centraliza cargos, medios de pago, cobros mixtos y cierres diarios con trazabilidad.',
  },
  {
    icon: FileText,
    title: 'Facturación',
    text: 'Organiza facturas, estados, historial de cambios y documentos para clientes.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Servicios del hotel',
    text: 'Integra room service, minibar, spa, tours, lavandería, transporte, eventos y más.',
  },
  {
    icon: BellRing,
    title: 'Incidencias y soporte',
    text: 'Registra novedades operativas para que el equipo pueda responder a tiempo.',
  },
  {
    icon: UsersRound,
    title: 'Usuarios y permisos',
    text: 'Administra equipos, roles y accesos para mantener cada área enfocada en su trabajo.',
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    title: 'Reportes y métricas',
    text: 'Visualiza indicadores de operación, áreas, ventas y actividad para tomar decisiones.',
  },
]

const roles = [
  {
    icon: Building2,
    title: 'Administración',
    text: 'Gestiona habitaciones, servicios, usuarios, amenidades, reservas y reportes.',
  },
  {
    icon: ClipboardCheck,
    title: 'Recepción',
    text: 'Atiende reservas, check-in, check-out, caja, folios e incidencias.',
  },
  {
    icon: Headphones,
    title: 'Áreas operativas',
    text: 'Reciben pedidos y tareas por servicio para coordinar entregas y novedades.',
  },
  {
    icon: CreditCard,
    title: 'Clientes',
    text: 'Consultan reservas, servicios, pedidos, cuenta y facturas desde su espacio.',
  },
  {
    icon: Landmark,
    title: 'Superadministracion',
    text: 'Controla hoteles, planes, categorías, soporte, configuración y métricas globales.',
  },
  {
    icon: ShieldCheck,
    title: 'Acceso seguro',
    text: 'Las áreas internas permanecen protegidas con autenticación y roles definidos.',
  },
]
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  color: #33251f;
  background:
    linear-gradient(135deg, rgba(255, 247, 231, 0.95), rgba(248, 225, 204, 0.84) 44%, rgba(230, 241, 230, 0.9)),
    #fff8ed;
}

.home-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 18px clamp(20px, 5vw, 72px);
  border-bottom: 1px solid rgba(99, 66, 42, 0.12);
  background: rgba(255, 249, 238, 0.9);
  backdrop-filter: blur(18px);
}

.brand-link,
.nav-actions,
.hero-actions,
.eyebrow,
.panel-brand,
.section-heading,
.closing-section {
  display: flex;
  align-items: center;
}

.brand-link {
  gap: 12px;
  color: #33251f;
  font-weight: 800;
  text-decoration: none;
}

.brand-logo,
.panel-logo {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(92, 62, 34, 0.16);
}

.nav-actions {
  gap: 18px;
}

.nav-link {
  color: #654832;
  font-weight: 700;
  text-decoration: none;
}

.hero-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 520px);
  gap: clamp(28px, 5vw, 72px);
  align-items: center;
  padding: clamp(56px, 9vw, 104px) clamp(20px, 5vw, 72px) clamp(48px, 8vw, 80px);
}

.hero-copy {
  max-width: 780px;
}

.eyebrow {
  width: fit-content;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid rgba(133, 85, 45, 0.18);
  border-radius: 8px;
  color: #80522f;
  background: rgba(255, 255, 255, 0.62);
  font-size: 0.9rem;
  font-weight: 800;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  max-width: 760px;
  margin-top: 22px;
  color: #2f211c;
  font-size: clamp(2.7rem, 6vw, 5.6rem);
  font-weight: 800;
  line-height: 0.98;
  letter-spacing: 0;
}

.hero-text {
  max-width: 660px;
  margin-top: 24px;
  color: #6b5547;
  font-size: 1.2rem;
  line-height: 1.75;
}

.hero-actions {
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 34px;
}

.hero-panel {
  border: 1px solid rgba(104, 76, 50, 0.15);
  border-radius: 8px;
  padding: clamp(18px, 4vw, 28px);
  background: rgba(255, 253, 247, 0.86);
  box-shadow: 0 30px 80px rgba(102, 64, 33, 0.16);
}

.panel-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.panel-brand {
  gap: 12px;
}

.panel-brand strong,
.role-row strong,
.timeline-item strong {
  display: block;
  color: #33251f;
}

.panel-brand span,
.metric-tile span,
.timeline-item p,
.feature-card p,
.role-row p,
.workflow-copy p,
.closing-section p {
  color: #765f50;
}

.status-pill {
  border-radius: 8px;
  padding: 7px 10px;
  color: #235a45;
  background: #dff2dd;
  font-size: 0.78rem;
  font-weight: 800;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 24px;
}

.metric-tile,
.feature-card,
.role-row {
  border: 1px solid rgba(104, 76, 50, 0.13);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
}

.metric-tile {
  min-height: 140px;
  padding: 18px;
  color: #9a512e;
}

.metric-tile strong {
  display: block;
  margin: 14px 0 4px;
  color: #33251f;
  font-size: 1.08rem;
}

.timeline {
  display: grid;
  gap: 16px;
  margin-top: 24px;
  padding: 20px;
  border-radius: 8px;
  background: #f4eadc;
}

.timeline-item {
  display: grid;
  grid-template-columns: 14px 1fr;
  gap: 12px;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  margin-top: 7px;
  border-radius: 50%;
  background: #c75f3f;
  box-shadow: 0 0 0 5px rgba(199, 95, 63, 0.12);
}

.section-band {
  padding: clamp(44px, 7vw, 80px) clamp(20px, 5vw, 72px);
  background: rgba(255, 252, 244, 0.72);
}

.section-heading {
  align-items: flex-start;
  justify-content: space-between;
  gap: 28px;
  margin-bottom: 28px;
}

.section-heading span,
.workflow-copy span,
.closing-section span {
  color: #b55a36;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-heading h2,
.workflow-copy h2,
.closing-section h2 {
  max-width: 780px;
  color: #2f211c;
  font-size: clamp(2rem, 4vw, 3.4rem);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.feature-card {
  min-height: 238px;
  padding: 22px;
}

.feature-icon {
  display: grid;
  width: 48px;
  height: 48px;
  margin-bottom: 18px;
  place-items: center;
  border-radius: 8px;
  color: #7d472e;
  background: #f7dcc9;
}

.feature-card h3 {
  color: #33251f;
  font-size: 1.08rem;
  font-weight: 800;
  line-height: 1.25;
}

.feature-card p,
.role-row p,
.workflow-copy p,
.closing-section p,
.timeline-item p {
  margin-top: 8px;
  line-height: 1.65;
}

.workflow-section {
  display: grid;
  grid-template-columns: minmax(0, 0.84fr) minmax(320px, 1fr);
  gap: clamp(28px, 5vw, 64px);
  padding: clamp(44px, 7vw, 86px) clamp(20px, 5vw, 72px);
}

.workflow-copy {
  align-self: start;
  position: sticky;
  top: 104px;
}

.workflow-copy h2,
.closing-section h2 {
  margin-top: 10px;
}

.workflow-copy p,
.closing-section p {
  max-width: 620px;
  margin-top: 18px;
  font-size: 1.04rem;
}

.role-list {
  display: grid;
  gap: 14px;
}

.role-row {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 16px;
  align-items: flex-start;
  padding: 20px;
  color: #1f6a60;
  background: rgba(255, 255, 255, 0.64);
}

.closing-section {
  justify-content: space-between;
  gap: 28px;
  margin: 0 clamp(20px, 5vw, 72px) clamp(32px, 6vw, 64px);
  padding: clamp(28px, 5vw, 44px);
  border: 1px solid rgba(104, 76, 50, 0.14);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(67, 103, 89, 0.12), rgba(255, 255, 255, 0.72));
}

@media (max-width: 1180px) {
  .feature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .home-nav {
    position: static;
    align-items: flex-start;
    flex-direction: column;
  }

  .hero-section,
  .workflow-section {
    grid-template-columns: 1fr;
  }

  .workflow-copy {
    position: static;
  }

  .section-heading,
  .closing-section {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .nav-actions {
    width: 100%;
    justify-content: space-between;
    gap: 10px;
  }

  .nav-link {
    display: none;
  }

  .metric-grid,
  .feature-grid {
    grid-template-columns: 1fr;
  }

  .hero-section {
    padding-top: 40px;
  }

  h1 {
    font-size: 2.55rem;
  }
}
</style>
