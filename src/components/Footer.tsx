import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <div className="footer-main">
        <div className="logo">NORDICO</div>
        <div className="copy">© 2026 Nordico S.A. Todos los derechos reservados.</div>
        <div className="links">
          <Link href="/privacidad">Política de privacidad</Link>
          <Link href="/terminos">Términos</Link>
          <Link href="/presupuesto">Contacto</Link>
        </div>
      </div>
      <div className="footer-credit">
        Design &amp; Development: <span>Valentín Plonhestainer</span>
      </div>
    </footer>
  )
}
