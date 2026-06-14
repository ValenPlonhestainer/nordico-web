import type { Metadata } from 'next'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad de Nordico. Información sobre recopilación de datos, cookies y derechos del usuario conforme a la Ley 25.326 de Argentina.',
  alternates: { canonical: 'https://www.nordico.net.ar/privacidad' },
}

export default function Privacidad() {
  return (
    <div id="terminos">

      {/* Hero */}
      <div className="terminos-hero">
        <div className="section-eyebrow">// Legal</div>
        <h1 className="terminos-title">Política de<br /><span>Privacidad</span></h1>
        <p className="terminos-subtitle">Última actualización: junio de 2026</p>
      </div>

      {/* Contenido */}
      <div className="terminos-body">

        <div className="terminos-intro">
          <p>En Nórdico nos comprometemos a proteger la privacidad de quienes visitan nuestro sitio web nordico.net.ar. Esta política explica qué información recopilamos, cómo la usamos y qué derechos tenés sobre ella.</p>
        </div>

        <div className="terminos-section">
          <div className="terminos-section-title">1. Quiénes somos</div>
          <p>Nórdico es una empresa argentina fabricante de losetas atérmicas y antideslizantes para pileta, con sede en Carpintería, San Luis, Argentina.</p>
          <p>Podés contactarnos a través del formulario de presupuesto en nuestro sitio o por los medios que figuran al final de esta política.</p>
        </div>

        <div className="terminos-section">
          <div className="terminos-section-title">2. Qué información recopilamos</div>

          <div className="terminos-subsection">
            <div className="terminos-subsection-title">a) Formulario de presupuesto</div>
            <p>Cuando completás nuestro formulario de presupuesto, nos proporcionás los siguientes datos:</p>
            <ul>
              <li>Nombre completo</li>
              <li>Dirección de correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Provincia</li>
              <li>Productos seleccionados y cantidades</li>
              <li>Servicios adicionales requeridos</li>
              <li>Preferencia de forma de pago</li>
            </ul>
            <p>Esta información es necesaria para preparar y enviarte un presupuesto personalizado.</p>
          </div>

          <div className="terminos-subsection">
            <div className="terminos-subsection-title">b) Datos de navegación (Google Analytics)</div>
            <p>Utilizamos Google Analytics para entender cómo los visitantes interactúan con nuestro sitio. Esta herramienta puede recopilar de forma automática:</p>
            <ul>
              <li>Páginas visitadas y tiempo de permanencia</li>
              <li>País y ciudad aproximada (no tu dirección exacta)</li>
              <li>Tipo de dispositivo y navegador</li>
              <li>Fuente de tráfico (cómo llegaste al sitio)</li>
            </ul>
            <p>Esta información es anónima y agregada; no permite identificarte personalmente.</p>
          </div>

          <div className="terminos-subsection">
            <div className="terminos-subsection-title">c) Mapa de ubicación (Google Maps)</div>
            <p>Nuestro sitio incluye un mapa integrado de Google Maps para mostrar nuestra ubicación. Al cargar esta sección, Google puede recopilar datos de navegación según su propia política de privacidad.</p>
          </div>
        </div>

        <div className="terminos-section">
          <div className="terminos-section-title">3. Para qué usamos tu información</div>
          <ul>
            <li><strong>Formulario de presupuesto:</strong> los datos que ingresás se registran en nuestra base de datos interna y nos permiten contactarte por WhatsApp para continuar con tu consulta o pedido.</li>
            <li><strong>Analítica:</strong> para mejorar el contenido y la experiencia del sitio. No vendemos ni compartimos estos datos con terceros con fines comerciales.</li>
          </ul>
        </div>

        <div className="terminos-section">
          <div className="terminos-section-title">4. Cookies</div>
          <p>Nuestro sitio utiliza cookies de terceros asociadas a los siguientes servicios:</p>
          <ul>
            <li><strong>Google Analytics:</strong> almacena información sobre tu visita para generar estadísticas de uso anónimas (<code>_ga</code>, <code>_ga_K5ELXC4SY2</code>). Duración: 2 años.</li>
            <li><strong>Google Maps:</strong> puede establecer cookies al cargar el mapa interactivo de nuestra ubicación.</li>
          </ul>
          <p>Para más información sobre cómo Google usa estos datos, visitá: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>.</p>
        </div>

        <div className="terminos-section">
          <div className="terminos-section-title">5. ¿Compartimos tu información?</div>
          <p>No vendemos, alquilamos ni cedemos tus datos personales a terceros. Solo compartimos información cuando:</p>
          <ul>
            <li>Es necesario para operar servicios que usamos: <strong>Google Analytics</strong> (estadísticas de visitas), <strong>Google Sheets</strong> (registro interno de presupuestos solicitados) y <strong>Google Maps</strong> (mapa de ubicación), todos bajo sus propios acuerdos de privacidad con Google LLC.</li>
            <li>Lo exige la ley argentina vigente.</li>
          </ul>
        </div>

        <div className="terminos-section">
          <div className="terminos-section-title">6. Tus derechos</div>
          <p>De acuerdo con la Ley N.° 25.326 de Protección de los Datos Personales de la República Argentina, tenés derecho a:</p>
          <ul>
            <li>Acceder a los datos personales que tengamos sobre vos.</li>
            <li>Solicitar su rectificación si son incorrectos.</li>
            <li>Solicitar su eliminación cuando ya no sean necesarios para el fin con que fueron recopilados.</li>
            <li>Oponerte al tratamiento de tus datos en cualquier momento.</li>
          </ul>
          <p>Para ejercer cualquiera de estos derechos, contactanos a través del formulario de presupuesto en nuestro sitio.</p>
          <p>La Dirección Nacional de Protección de Datos Personales (DNPDP) es el órgano de control competente en la materia.</p>
        </div>

        <div className="terminos-section">
          <div className="terminos-section-title">7. Seguridad</div>
          <p>Tomamos medidas razonables para proteger la información que nos enviás. Sin embargo, ninguna transmisión de datos por internet es 100 % segura, por lo que no podemos garantizar la seguridad absoluta de la información.</p>
        </div>

        <div className="terminos-section">
          <div className="terminos-section-title">8. Cambios a esta política</div>
          <p>Podemos actualizar esta política ocasionalmente. Cuando lo hagamos, revisaremos la fecha al inicio de la página. Te recomendamos revisarla periódicamente.</p>
        </div>

      </div>

      <Footer />
    </div>
  )
}
