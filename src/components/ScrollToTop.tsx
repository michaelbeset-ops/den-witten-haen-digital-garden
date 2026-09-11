import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Scrollt naar boven bij paginawissel, of naar het element uit de hash
// (bv. /#over-ons of /#contact) zodra de nieuwe pagina is gerenderd.
const ScrollToTop = () => {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      const t = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
      return () => clearTimeout(t)
    }
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname, hash])
  return null
}

export default ScrollToTop
