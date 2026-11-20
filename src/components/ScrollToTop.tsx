import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Zorgt dat je bij een nieuwe pagina bovenaan begint, en bij een link met een
 * hash (bijvoorbeeld /#over-ons) naar dat onderdeel scrolt.
 *
 * De sprong naar boven moet direct gebeuren, niet vloeiend. Op <html> staat
 * `scroll-behavior: smooth`, waardoor een gewone scrollopdracht een animatie
 * start. Die animatie loopt door terwijl de nieuwe pagina al is opgebouwd, en
 * als die pagina korter is dan de vorige kom je onderaan uit in plaats van
 * bovenaan. Daarom zetten we het vloeiende scrollen even uit.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation()

  useLayoutEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      const t = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
      return () => clearTimeout(t)
    }

    const html = document.documentElement
    const vorige = html.style.scrollBehavior
    html.style.scrollBehavior = 'auto'
    window.scrollTo(0, 0)
    html.style.scrollBehavior = vorige
  }, [pathname, hash])

  return null
}

export default ScrollToTop
