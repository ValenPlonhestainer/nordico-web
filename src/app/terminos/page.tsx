import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso del sitio web de Nordico. Protección de datos personales conforme a la Ley 25.326 Argentina.',
  alternates: { canonical: 'https://www.nordico.net.ar/terminos' },
}

export default function Terminos() {
  return (
    <div id="terminos">

      {/* Hero */}
      <div className="terminos-hero">
        <div className="section-eyebrow">// Legal</div>
        <h1 className="terminos-title">Términos y<br /><span>Condiciones</span></h1>
        <p className="terminos-subtitle">Última actualización: junio de 2026</p>
      </div>

      {/* Contenido */}
      <div className="terminos-body">

        <div className="terminos-intro">
          <p>Bienvenido/a al sitio web de Nórdico. Al acceder y utilizar este sitio, usted acepta los presentes Términos y Condiciones de Uso. Le solicitamos que los lea detenidamente antes de continuar navegando.</p>
        </div>

        <div className="terminos-section">
          <div className="terminos-section-title">1. Información General</div>
          <p>Nórdico es una empresa argentina dedicada a la fabricación y comercialización de losetas atérmicas y antideslizantes para pileta, baldosas para exterior y revestimientos. El presente sitio web tiene carácter informativo y permite a los usuarios conocer nuestros productos y solicitar presupuestos.</p>
        </div>

        <div className="terminos-section">
          <div className="terminos-section-title">2. Uso del Sitio Web</div>
          <p>Al utilizar este sitio, usted se compromete a:</p>
          <ul>
            <li>Hacer un uso lícito, responsable y conforme a la legislación argentina vigente.</li>
            <li>No reproducir, distribuir ni modificar el contenido sin autorización expresa de Nórdico.</li>
            <li>No utilizar el sitio para fines fraudulentos, ilegales o que puedan causar daños a terceros.</li>
            <li>Proporcionar información veraz y actualizada al completar el formulario de presupuesto.</li>
          </ul>
          <p>Nórdico se reserva el derecho de modificar, suspender o interrumpir el acceso al sitio en cualquier momento y sin previo aviso.</p>
        </div>

        <div className="terminos-section">
          <div className="terminos-section-title">3. Catálogo de Productos</div>
          <p>La información sobre productos, imágenes, especificaciones técnicas y precios publicados en este sitio tiene carácter meramente orientativo y puede estar sujeta a cambios sin previo aviso.</p>
          <p>La exhibición de productos en el catálogo no implica oferta de venta ni disponibilidad garantizada. Para confirmar disponibilidad, precios vigentes y condiciones comerciales, deberá contactarse directamente con Nórdico a través de los canales habilitados.</p>
        </div>

        <div className="terminos-section">
          <div className="terminos-section-title">4. Formulario de Presupuesto</div>
          <p>El formulario de presupuesto disponible en este sitio permite a los usuarios seleccionar productos y solicitar una cotización personalizada. Al completar el formulario, usted:</p>
          <ul>
            <li>Garantiza que la información provista es verdadera y actualizada.</li>
            <li>Autoriza a Nórdico a contactarse con usted por WhatsApp u otros medios a través de los datos suministrados.</li>
            <li>Comprende que el envío del formulario no genera ningún contrato ni compromiso comercial entre las partes.</li>
          </ul>
          <p>Una vez enviado el formulario, Nórdico iniciará el contacto a través de WhatsApp para continuar con la atención de su solicitud.</p>
        </div>

        <div className="terminos-section">
          <div className="terminos-section-title">5. Privacidad y Protección de Datos Personales</div>
          <p>Nórdico se compromete a proteger la privacidad de los usuarios conforme a lo establecido por la Ley N° 25.326 de Protección de los Datos Personales de la República Argentina y sus normas complementarias.</p>
          <p>El detalle completo sobre qué datos recopilamos, cómo los usamos, las cookies que utilizamos y los derechos del titular se encuentra en nuestra <Link href="/privacidad" style={{ color: 'var(--orange)' }}>Política de Privacidad</Link>.</p>
        </div>

        <div className="terminos-section">
          <div className="terminos-section-title">6. Propiedad Intelectual</div>
          <p>Todos los contenidos publicados en este sitio web, incluyendo pero no limitándose a textos, imágenes, fotografías, logotipos, diseños, gráficos y material audiovisual, son propiedad exclusiva de Nórdico o de sus respectivos titulares, y se encuentran protegidos por las leyes de propiedad intelectual de la República Argentina (Ley N° 11.723 y concordantes).</p>
          <p>Queda expresamente prohibida la reproducción, distribución, modificación, comunicación pública o cualquier otro uso de dichos contenidos sin la autorización previa y por escrito de Nórdico, salvo que se indique lo contrario o que dicho uso esté permitido por la legislación vigente.</p>
          <p>El uso no autorizado del contenido podrá dar lugar a las acciones legales correspondientes.</p>
        </div>

        <div className="terminos-section">
          <div className="terminos-section-title">7. Limitación de Responsabilidad</div>
          <p>Nórdico no garantiza la exactitud, completitud ni actualización permanente de la información publicada en este sitio. En la medida permitida por la legislación vigente, Nórdico no será responsable por:</p>
          <ul>
            <li>Errores u omisiones en los contenidos del sitio.</li>
            <li>La disponibilidad, continuidad o seguridad del sitio web.</li>
            <li>Daños o perjuicios derivados del uso o la imposibilidad de uso del sitio.</li>
            <li>Decisiones tomadas por el usuario basándose en la información publicada.</li>
            <li>Interrupciones del servicio por causas técnicas, de fuerza mayor o ajenas a su control.</li>
          </ul>
          <p>El usuario utiliza el sitio bajo su propia responsabilidad y riesgo.</p>
        </div>

        <div className="terminos-section">
          <div className="terminos-section-title">8. Jurisdicción y Ley Aplicable</div>
          <p>Los presentes Términos y Condiciones se rigen por las leyes de la República Argentina. Para cualquier controversia, disputa o reclamación derivada del uso de este sitio o de su contenido, las partes se someten expresamente a la jurisdicción de los Tribunales Ordinarios de la República Argentina, renunciando a cualquier otro fuero o jurisdicción que pudiera corresponder.</p>
        </div>

        <div className="terminos-section">
          <div className="terminos-section-title">9. Modificaciones a los Términos y Condiciones</div>
          <p>Nórdico se reserva el derecho de modificar los presentes Términos y Condiciones en cualquier momento, publicando la versión actualizada en este sitio web con indicación de la fecha de última actualización. El uso continuado del sitio con posterioridad a dichas modificaciones implica la aceptación de los nuevos términos.</p>
        </div>

        <div className="terminos-section">
          <div className="terminos-section-title">10. Contacto</div>
          <p>Para consultas relacionadas con los presentes Términos y Condiciones, o para ejercer los derechos sobre sus datos personales, puede contactarse con Nórdico a través del formulario de presupuesto disponible en el sitio web.</p>
        </div>

      </div>

      <Footer />
    </div>
  )
}
