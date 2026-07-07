// Zoals in het echt: op een telefoon krijg je automatisch de mobiele site.
// Desktoproutes worden op mobiel omgeleid naar /m/...; de mobiele site
// blijft (net als een echte m-dot site) ook op desktop gewoon bereikbaar.
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  const isMobile = /iPhone|iPod|Windows Phone|Android.*Mobile/i.test(navigator.userAgent)
  if (!isMobile) return

  // De dealpagina is responsive (eigen mobiele weergave) en blijft de start
  // van de journey; alleen de vervolgstappen hebben een aparte mobiele site.
  const match = to.path.match(/^\/journey\/([^/]+)\/(date|checkout)$/)
  if (!match) return
  return navigateTo(`/m/journey/${match[1]}/${match[2]}`, { replace: true })
})
