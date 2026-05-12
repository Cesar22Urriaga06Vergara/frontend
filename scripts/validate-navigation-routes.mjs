import { existsSync, readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const root = process.cwd()
const pagesDir = join(root, 'pages')
const navigationFile = join(root, 'composables', 'useRoleNavigation.ts')

const toRoute = (filePath) => {
  const rel = relative(pagesDir, filePath).replaceAll(sep, '/')
  const withoutExt = rel.replace(/\.vue$/, '')
  const segments = withoutExt.split('/')
  const normalized = segments
    .map((segment) => {
      if (segment === 'index') return ''
      if (/^\[.+\]$/.test(segment)) return segment
      return segment
    })
    .filter((segment, index) => segment || index === 0)
    .join('/')

  const route = `/${normalized}`.replace(/\/+/g, '/')
  return route === '/index' ? '/' : route.replace(/\/$/, '') || '/'
}

const walkVueFiles = (dir) => {
  const entries = readdirSync(dir, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) return walkVueFiles(fullPath)
    return entry.isFile() && entry.name.endsWith('.vue') ? [fullPath] : []
  })
}

if (!existsSync(pagesDir)) {
  console.error('No se encontro la carpeta pages.')
  process.exit(1)
}

if (!existsSync(navigationFile)) {
  console.error('No se encontro composables/useRoleNavigation.ts.')
  process.exit(1)
}

const pageRoutes = new Set(walkVueFiles(pagesDir).map(toRoute))
const navigationSource = await import('node:fs').then((fs) =>
  fs.readFileSync(navigationFile, 'utf8'),
)

const navRoutes = [...navigationSource.matchAll(/to:\s*['"`]([^'"`]+)['"`]/g)]
  .map((match) => match[1])
  .filter((route) => route.startsWith('/'))

const missing = [...new Set(navRoutes)].filter((route) => !pageRoutes.has(route))

if (missing.length > 0) {
  console.error('Rutas de navegacion sin pagina asociada:')
  for (const route of missing) console.error(`- ${route}`)
  process.exit(1)
}

console.log(`Rutas de navegacion verificadas: ${navRoutes.length}`)
