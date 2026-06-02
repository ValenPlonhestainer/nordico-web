import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <div className="logo">NORDICO</div>
      <div className="copy">© 2026 Nordico S.A. Todos los derechos reservados.</div>
      <div className="links">
        <a href="#">Política de privacidad</a>
        <Link href="/terminos">Términos</Link>
        <Link href="/presupuesto">Contacto</Link>
      </div>
    </footer>
  )
}
