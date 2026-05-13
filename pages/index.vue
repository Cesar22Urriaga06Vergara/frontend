<template>
  <div class="home-page">
    <header class="home-nav">
      <NuxtLink to="/" class="brand-link" aria-label="Ir al inicio de ADUS">
        <img src="/favicon.jpeg" alt="Logo ADUS" class="brand-logo">
        <span>ADUS Hospitality OS</span>
      </NuxtLink>

      <nav class="nav-actions" aria-label="Accesos principales">
        <button
          v-for="item in navItems"
          :key="item.id"
          type="button"
          class="nav-link"
          @click="scrollToSection(item.id)"
        >
          {{ item.shortLabel }}
        </button>

        <div class="auth-actions">
          <v-btn
            to="/register"
            color="secondary"
            variant="tonal"
            rounded="lg"
            prepend-icon="mdi-account-plus-outline"
          >
            Crear cuenta
          </v-btn>
          <v-btn
            :to="sessionRoute"
            color="primary"
            variant="flat"
            rounded="lg"
            prepend-icon="mdi-login"
          >
            {{ sessionLabel }}
          </v-btn>
        </div>
      </nav>
    </header>

    <main>
      <section class="hero-section">
        <img src="/favicon.jpeg" alt="" class="hero-watermark">

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
              type="button"
              color="accent"
              size="large"
              rounded="lg"
              variant="tonal"
              prepend-icon="mdi-compass-outline"
              @click="scrollToSection('panorama')"
            >
              Ver recorrido
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
            <span class="status-pill">En línea</span>
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

      <section class="content-shell">
        <aside class="navigation-panel" aria-label="Panel de navegación del inicio">
          <span>Explora ADUS</span>
          <button
            v-for="item in navItems"
            :key="`panel-${item.id}`"
            type="button"
            class="panel-nav-item"
            @click="scrollToSection(item.id)"
          >
            <component :is="item.icon" :size="18" />
            <span>{{ item.label }}</span>
          </button>
        </aside>

        <div class="content-stack">
          <section
            v-for="section in detailSections"
            :id="section.id"
            :key="section.id"
            class="detail-section scroll-target"
            :class="`detail-section--${section.tone}`"
          >
            <div class="detail-copy">
              <span>{{ section.eyebrow }}</span>
              <h2>{{ section.title }}</h2>
              <p>{{ section.text }}</p>
            </div>

            <div class="detail-card-grid">
              <article v-for="point in section.points" :key="point.title" class="detail-card">
                <div class="detail-icon">
                  <component :is="point.icon" :size="22" />
                </div>
                <h3>{{ point.title }}</h3>
                <p>{{ point.text }}</p>
              </article>
            </div>
          </section>
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

        <div class="closing-actions">
          <v-btn
            to="/register"
            color="secondary"
            size="large"
            rounded="lg"
            variant="tonal"
            prepend-icon="mdi-account-plus-outline"
          >
            Crear cuenta
          </v-btn>
          <v-btn
            :to="sessionRoute"
            color="primary"
            size="large"
            rounded="lg"
            prepend-icon="mdi-arrow-right"
          >
            {{ sessionLabel }}
          </v-btn>
        </div>
      </section>
    </main>

    <footer class="home-footer">
      <div class="footer-grid">
        <div class="footer-brand">
          <NuxtLink to="/" class="footer-logo-link" aria-label="Ir al inicio de ADUS">
            <img src="/favicon.jpeg" alt="Logo ADUS" class="footer-logo">
            <span>ADUS Hospitality OS</span>
          </NuxtLink>
          <p>
            Sistema de gestión hotelera para reservas, recepción, caja,
            facturación, servicios, reportes y administración por roles.
          </p>
          <div class="footer-social" aria-label="Canales de soporte">
            <v-btn
              v-for="channel in supportChannels"
              :key="channel.label"
              :aria-label="channel.label"
              :icon="channel.icon"
              size="small"
              variant="tonal"
              color="primary"
            />
          </div>
        </div>

        <div v-for="column in footerColumns" :key="column.title" class="footer-column">
          <h3>{{ column.title }}</h3>
          <button
            v-for="item in column.items"
            :key="item.label"
            type="button"
            class="footer-link"
            @click="handleFooterAction(item)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>

      <div class="footer-bottom">
        <span>© 2026 ADUS Hospitality OS. Todos los derechos reservados.</span>
        <strong>Gestión hotelera inteligente</strong>
      </div>
    </footer>
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

type FooterAction = {
  label: string
  section?: string
  route?: string
}

type NavItem = {
  id: string
  label: string
  shortLabel: string
  icon: any
}

const navItems: NavItem[] = [
  { id: 'panorama', label: 'Panorama general', shortLabel: 'Panorama', icon: Building2 },
  { id: 'reservas', label: 'Reservas y habitaciones', shortLabel: 'Reservas', icon: CalendarCheck },
  { id: 'recepcion', label: 'Recepción y operación', shortLabel: 'Recepción', icon: ClipboardCheck },
  { id: 'caja', label: 'Caja y facturación', shortLabel: 'Caja', icon: BadgeDollarSign },
  { id: 'servicios', label: 'Servicios al huésped', shortLabel: 'Servicios', icon: UtensilsCrossed },
  { id: 'seguridad', label: 'Roles, reportes y control', shortLabel: 'Control', icon: ShieldCheck },
]

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

const detailSections = [
  {
    id: 'panorama',
    tone: 'sage',
    eyebrow: 'Panorama operativo',
    title: 'Un tablero de inicio para entender el hotel en minutos',
    text: 'La portada resume la idea central del software: conectar las áreas que normalmente trabajan separadas. Administración, recepción, servicios, clientes y superadministración comparten una base de datos organizada por roles.',
    points: [
      {
        icon: Building2,
        title: 'Operación centralizada',
        text: 'Hoteles, habitaciones, tipos, amenidades, usuarios y servicios viven en una estructura común para evitar duplicidad.',
      },
      {
        icon: ChartNoAxesColumnIncreasing,
        title: 'Lectura rápida del día',
        text: 'El equipo puede revisar disponibilidad, actividad de reservas, pagos y reportes sin saltar entre herramientas.',
      },
      {
        icon: UsersRound,
        title: 'Trabajo por perfiles',
        text: 'Cada rol entra a su propio panel y ve tareas acordes a su responsabilidad dentro del hotel.',
      },
    ],
  },
  {
    id: 'reservas',
    tone: 'terracotta',
    eyebrow: 'Reservas y habitaciones',
    title: 'Desde la disponibilidad hasta la confirmación del huésped',
    text: 'ADUS acompaña la creación, consulta y gestión de reservas. El objetivo es que recepción y administración tengan claridad sobre fechas, estados, habitaciones asignadas y datos del cliente.',
    points: [
      {
        icon: CalendarCheck,
        title: 'Reservas visibles',
        text: 'Permite revisar reservas activas, pendientes, confirmadas o canceladas con contexto útil para el equipo.',
      },
      {
        icon: BedDouble,
        title: 'Habitaciones ordenadas',
        text: 'Relaciona reservas con tipos de habitación, amenidades y disponibilidad para reducir cruces operativos.',
      },
      {
        icon: KeyRound,
        title: 'Datos listos para recepción',
        text: 'El proceso deja preparada la información que se necesita para check-in y seguimiento de estadía.',
      },
    ],
  },
  {
    id: 'recepcion',
    tone: 'teal',
    eyebrow: 'Recepción y operación',
    title: 'Entradas, salidas e incidencias con trazabilidad',
    text: 'La recepción trabaja con check-in, check-out, caja, folios e incidencias. Esto permite atender al huésped con una vista clara de pendientes, consumos y estado de la reserva.',
    points: [
      {
        icon: ClipboardCheck,
        title: 'Check-in y check-out',
        text: 'Organiza entradas y salidas para que el equipo pueda confirmar procesos sin perder información clave.',
      },
      {
        icon: BellRing,
        title: 'Incidencias operativas',
        text: 'Registra novedades de mantenimiento, atención o servicio para responder a tiempo y dar seguimiento.',
      },
      {
        icon: Headphones,
        title: 'Áreas coordinadas',
        text: 'Las áreas operativas reciben pedidos y tareas relacionadas con servicios como room service, spa o lavandería.',
      },
    ],
  },
  {
    id: 'caja',
    tone: 'gold',
    eyebrow: 'Caja, folios y facturación',
    title: 'Cada cargo y cada pago quedan conectados al huésped',
    text: 'El sistema contempla folios, pagos, medios de pago, caja y facturación. Así el cierre de una estadía puede revisarse con mayor claridad y menos reprocesos.',
    points: [
      {
        icon: ReceiptText,
        title: 'Folios del huésped',
        text: 'Agrupa cargos de alojamiento y servicios para que el estado de cuenta esté siempre consultable.',
      },
      {
        icon: CreditCard,
        title: 'Pagos flexibles',
        text: 'Soporta gestión de pagos y medios de pago, incluyendo escenarios de cobro mixto en recepción.',
      },
      {
        icon: FileText,
        title: 'Facturas e historial',
        text: 'Organiza facturas, estados e historial de cambios para clientes y administración.',
      },
    ],
  },
  {
    id: 'servicios',
    tone: 'rose',
    eyebrow: 'Servicios del hotel',
    title: 'Los consumos del huésped se integran a la operación',
    text: 'ADUS contempla áreas como room service, minibar, spa, tours, lavandería, transporte, eventos y cafetería. La intención es que los consumos no queden aislados de la cuenta ni de la operación diaria.',
    points: [
      {
        icon: UtensilsCrossed,
        title: 'Pedidos y consumos',
        text: 'Los servicios pueden gestionarse como pedidos, cargos o tareas para mejorar la coordinación interna.',
      },
      {
        icon: Headphones,
        title: 'Paneles por área',
        text: 'Cada área operativa puede concentrarse en lo que debe atender sin acceder a información innecesaria.',
      },
      {
        icon: UsersRound,
        title: 'Experiencia del cliente',
        text: 'El huésped puede consultar reservas, servicios, pedidos, cuenta y facturas desde su espacio.',
      },
    ],
  },
  {
    id: 'seguridad',
    tone: 'navy',
    eyebrow: 'Roles, reportes y control',
    title: 'Administración segura para crecer sin perder orden',
    text: 'La plataforma separa permisos por rol y ofrece paneles para administración, recepción, clientes, áreas operativas y superadministración. También incluye reportes y métricas para revisar desempeño.',
    points: [
      {
        icon: ShieldCheck,
        title: 'Acceso protegido',
        text: 'Las pantallas internas requieren autenticación y los usuarios se organizan según el rol que cumplen.',
      },
      {
        icon: Landmark,
        title: 'Superadministración',
        text: 'Permite controlar hoteles, planes, categorías, soporte, configuración y métricas globales.',
      },
      {
        icon: ChartNoAxesColumnIncreasing,
        title: 'Reportes de gestión',
        text: 'Aporta indicadores sobre operación, áreas, ventas y actividad para tomar decisiones con datos.',
      },
    ],
  },
]

const footerColumns: Array<{ title: string, items: FooterAction[] }> = [
  {
    title: 'Módulos',
    items: [
      { label: 'Reservas y habitaciones', section: 'reservas' },
      { label: 'Recepción y check-in', section: 'recepcion' },
      { label: 'Pagos, caja y folios', section: 'caja' },
      { label: 'Reportes operativos', section: 'seguridad' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Panorama general', section: 'panorama' },
      { label: 'Operación por roles', section: 'recepcion' },
      { label: 'Servicios del huésped', section: 'servicios' },
      { label: 'Acceso seguro', section: 'seguridad' },
    ],
  },
  {
    title: 'Soporte',
    items: [
      { label: 'Iniciar sesión', route: '/login' },
      { label: 'Crear cuenta', route: '/register' },
      { label: 'Ver módulos', section: 'panorama' },
      { label: 'Volver arriba', section: 'inicio' },
    ],
  },
]

const supportChannels = [
  { label: 'Soporte operativo', icon: 'mdi-lifebuoy' },
  { label: 'Documentación del sistema', icon: 'mdi-file-document-outline' },
  { label: 'Contacto administrativo', icon: 'mdi-email-outline' },
]

const scrollToSection = (id: string) => {
  if (!import.meta.client) {
    return
  }

  if (id === 'inicio') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  const target = document.getElementById(id)
  if (!target) {
    return
  }

  const top = target.getBoundingClientRect().top + window.scrollY - 96
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
}

const handleFooterAction = async (item: FooterAction) => {
  if (item.route) {
    await navigateTo(item.route)
    return
  }

  if (item.section) {
    scrollToSection(item.section)
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  overflow-x: hidden;
  color: #30211e;
  background:
    linear-gradient(135deg, rgba(255, 247, 231, 0.96), rgba(250, 226, 202, 0.78) 42%, rgba(220, 239, 228, 0.86)),
    #fff8ed;
}

.home-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 40px;
  border-bottom: 1px solid rgba(99, 66, 42, 0.12);
  background: rgba(255, 248, 237, 0.88);
  backdrop-filter: blur(18px);
}

.brand-link,
.footer-logo-link,
.nav-actions,
.auth-actions,
.hero-actions,
.closing-actions,
.eyebrow,
.panel-brand,
.closing-section {
  display: flex;
  align-items: center;
}

.brand-link {
  gap: 12px;
  color: #30211e;
  font-weight: 900;
  text-decoration: none;
}

.brand-logo,
.panel-logo,
.footer-logo {
  width: 46px;
  height: 46px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 12px 30px rgba(31, 39, 58, 0.18);
}

.nav-actions {
  justify-content: flex-end;
  gap: 18px;
}

.auth-actions {
  gap: 10px;
  margin-left: 6px;
  padding: 6px;
  border: 1px solid rgba(116, 78, 47, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.55);
}

.nav-link {
  border: 0;
  padding: 8px 0;
  color: #664832;
  background: transparent;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
}

.nav-link:hover,
.footer-link:hover,
.panel-nav-item:hover {
  color: #c65b3a;
}

.scroll-target {
  scroll-margin-top: 110px;
}

.hero-section {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 520px);
  gap: 64px;
  align-items: center;
  min-height: 760px;
  padding: 88px 40px 76px;
}

.hero-watermark {
  position: absolute;
  top: 52%;
  right: 28%;
  z-index: 0;
  width: 380px;
  height: 380px;
  object-fit: contain;
  border-radius: 32px;
  opacity: 0.08;
  transform: translate(50%, -50%);
  pointer-events: none;
  filter: saturate(1.15);
}

.hero-copy,
.hero-panel {
  position: relative;
  z-index: 1;
}

.hero-copy {
  max-width: 780px;
}

.eyebrow {
  width: fit-content;
  gap: 8px;
  padding: 9px 13px;
  border: 1px solid rgba(133, 85, 45, 0.18);
  border-radius: 8px;
  color: #85452f;
  background: rgba(255, 255, 255, 0.64);
  font-size: 0.92rem;
  font-weight: 900;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  max-width: 760px;
  margin-top: 26px;
  color: #30212d;
  font-size: 5.1rem;
  font-weight: 900;
  line-height: 0.98;
  letter-spacing: 0;
}

.hero-text {
  max-width: 660px;
  margin-top: 26px;
  color: #694f43;
  font-size: 1.2rem;
  line-height: 1.78;
}

.hero-actions {
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 34px;
}

.hero-panel {
  border: 1px solid rgba(104, 76, 50, 0.15);
  border-radius: 8px;
  padding: 28px;
  background: rgba(255, 253, 247, 0.9);
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
.timeline-item strong,
.detail-card h3 {
  display: block;
  color: #2f211c;
}

.panel-brand span,
.metric-tile span,
.timeline-item p,
.detail-card p,
.detail-copy p,
.closing-section p {
  color: #765f50;
}

.status-pill {
  border-radius: 8px;
  padding: 8px 11px;
  color: #226347;
  background: #dff2dd;
  font-size: 0.78rem;
  font-weight: 900;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 24px;
}

.metric-tile,
.detail-card {
  border: 1px solid rgba(104, 76, 50, 0.13);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.76);
}

.metric-tile {
  min-height: 140px;
  padding: 18px;
  color: #ad5b35;
}

.metric-tile strong {
  display: block;
  margin: 14px 0 4px;
  color: #241a19;
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
  background: #d46d47;
  box-shadow: 0 0 0 5px rgba(212, 109, 71, 0.14);
}

.content-shell {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 28px;
  padding: 0 40px 68px;
}

.navigation-panel {
  position: sticky;
  top: 104px;
  align-self: start;
  display: grid;
  gap: 10px;
  padding: 18px;
  border: 1px solid rgba(104, 76, 50, 0.14);
  border-radius: 8px;
  background: rgba(255, 252, 244, 0.82);
  box-shadow: 0 22px 60px rgba(102, 64, 33, 0.1);
  backdrop-filter: blur(16px);
}

.navigation-panel > span {
  margin-bottom: 4px;
  color: #ad5b35;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.panel-nav-item {
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 10px;
  align-items: center;
  border: 0;
  padding: 12px;
  border-radius: 8px;
  color: #5e4638;
  background: rgba(255, 255, 255, 0.58);
  cursor: pointer;
  font: inherit;
  font-weight: 800;
  text-align: left;
}

.content-stack {
  display: grid;
  gap: 18px;
}

.detail-section {
  display: grid;
  grid-template-columns: minmax(260px, 0.82fr) minmax(0, 1.2fr);
  gap: 26px;
  padding: 32px;
  border: 1px solid rgba(104, 76, 50, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.62);
}

.detail-section--sage {
  background: linear-gradient(135deg, rgba(239, 247, 229, 0.82), rgba(255, 255, 255, 0.7));
}

.detail-section--terracotta {
  background: linear-gradient(135deg, rgba(252, 229, 211, 0.84), rgba(255, 255, 255, 0.7));
}

.detail-section--teal {
  background: linear-gradient(135deg, rgba(218, 244, 237, 0.82), rgba(255, 255, 255, 0.7));
}

.detail-section--gold {
  background: linear-gradient(135deg, rgba(255, 239, 192, 0.78), rgba(255, 255, 255, 0.7));
}

.detail-section--rose {
  background: linear-gradient(135deg, rgba(255, 225, 224, 0.78), rgba(255, 255, 255, 0.7));
}

.detail-section--navy {
  background: linear-gradient(135deg, rgba(226, 236, 255, 0.82), rgba(255, 255, 255, 0.7));
}

.detail-copy span,
.closing-section span {
  color: #b55a36;
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.detail-copy h2,
.closing-section h2 {
  max-width: 760px;
  margin-top: 12px;
  color: #2d211f;
  font-size: 2.3rem;
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: 0;
}

.detail-copy p,
.closing-section p {
  max-width: 650px;
  margin-top: 16px;
  font-size: 1rem;
  line-height: 1.72;
}

.detail-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.detail-card {
  min-height: 230px;
  padding: 20px;
}

.detail-icon {
  display: grid;
  width: 46px;
  height: 46px;
  margin-bottom: 16px;
  place-items: center;
  border-radius: 8px;
  color: #9a512e;
  background: rgba(247, 220, 201, 0.82);
}

.detail-card h3 {
  font-size: 1rem;
  font-weight: 900;
  line-height: 1.28;
}

.detail-card p {
  margin-top: 9px;
  line-height: 1.64;
}

.closing-section {
  justify-content: space-between;
  gap: 28px;
  margin: 0 40px 64px;
  padding: 36px;
  border: 1px solid rgba(104, 76, 50, 0.14);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(67, 103, 89, 0.12), rgba(255, 255, 255, 0.76));
}

.closing-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
}

.home-footer {
  padding: 0 40px;
  color: #d5dde8;
  background: #071426;
}

.footer-grid {
  display: grid;
  grid-template-columns: minmax(260px, 1.3fr) repeat(3, minmax(150px, 1fr));
  gap: 72px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 46px 0 42px;
}

.footer-logo-link {
  gap: 12px;
  width: fit-content;
  color: #ffffff;
  font-size: 1.08rem;
  font-weight: 900;
  text-decoration: none;
}

.footer-brand p {
  max-width: 360px;
  margin-top: 18px;
  color: #93a0b2;
  font-size: 0.94rem;
  line-height: 1.75;
}

.footer-social {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.footer-column h3 {
  margin: 0 0 18px;
  color: #ffffff;
  font-size: 0.86rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.footer-link {
  display: block;
  border: 0;
  padding: 0;
  color: #93a0b2;
  background: transparent;
  cursor: pointer;
  font: inherit;
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.3;
  text-align: left;
}

.footer-link + .footer-link {
  margin-top: 15px;
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px 0;
  border-top: 1px solid rgba(213, 221, 232, 0.12);
  color: #697589;
  font-size: 0.84rem;
}

.footer-bottom strong {
  color: #f28b4b;
  font-weight: 900;
}

@media (max-width: 1240px) {
  .home-nav,
  .hero-section,
  .content-shell,
  .home-footer {
    padding-left: 24px;
    padding-right: 24px;
  }

  .hero-section,
  .detail-section {
    grid-template-columns: 1fr;
  }

  .hero-watermark {
    right: 12%;
  }

  .detail-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .home-nav {
    align-items: flex-start;
    flex-direction: column;
  }

  .nav-actions {
    width: 100%;
    justify-content: space-between;
  }

  .content-shell {
    grid-template-columns: 1fr;
  }

  .navigation-panel {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .navigation-panel > span {
    grid-column: 1 / -1;
  }

  .footer-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 34px;
  }

  h1 {
    font-size: 3.55rem;
  }
}

@media (max-width: 680px) {
  .home-nav {
    padding: 14px 16px;
  }

  .brand-link span {
    font-size: 0.95rem;
  }

  .nav-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .nav-link {
    display: none;
  }

  .auth-actions {
    width: 100%;
    margin-left: 0;
  }

  .auth-actions .v-btn {
    flex: 1 1 0;
  }

  .hero-section {
    min-height: auto;
    padding: 42px 16px 44px;
  }

  .hero-watermark {
    top: 28%;
    right: -36px;
    width: 230px;
    height: 230px;
    opacity: 0.07;
  }

  h1 {
    font-size: 2.7rem;
  }

  .hero-text {
    font-size: 1rem;
  }

  .hero-panel,
  .detail-section,
  .closing-section {
    padding: 20px;
  }

  .content-shell,
  .home-footer {
    padding-left: 16px;
    padding-right: 16px;
  }

  .navigation-panel,
  .metric-grid,
  .detail-card-grid,
  .footer-grid {
    grid-template-columns: 1fr;
  }

  .detail-copy h2,
  .closing-section h2 {
    font-size: 1.85rem;
  }

  .closing-section,
  .footer-bottom {
    align-items: flex-start;
    flex-direction: column;
    margin-left: 16px;
    margin-right: 16px;
  }

  .closing-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .closing-actions .v-btn {
    flex: 1 1 100%;
  }
}
</style>
