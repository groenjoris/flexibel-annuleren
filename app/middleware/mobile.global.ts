// Zoals in het echt: op een telefoon krijg je automatisch de mobiele site.
// Desktoproutes worden op mobiel omgeleid naar /m/...; de mobiele site
// blijft (net als een echte m-dot site) ook op desktop gewoon bereikbaar.
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  const isMobile = /iPhone|iPod|Windows Phone|Android.*Mobile/i.test(navigator.userAgent)
  if (!isMobile) return

  const match = to.path.match(/^\/journey\/([^/]+)\/(deal|date|checkout)$/)
  if (!match) return
  // Er is geen mobiele dealpagina: de mobiele journey start bij de kalender.
  const step = match[2] === 'deal' ? 'date' : match[2]
  return navigateTo(`/m/journey/${match[1]}/${step}`, { replace: true })
})
