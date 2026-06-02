# Nordico — Sitio Web Principal

Sitio web público de Nordico. Permite a los clientes conocer los productos, calcular un presupuesto y contactarse por WhatsApp.

**URL en producción:** [nordico.net.ar](https://www.nordico.net.ar)

---

## Stack tecnológico

| Tecnología | Uso |
|-----------|-----|
| Next.js 16 (App Router) | Framework principal |
| React 19 | UI |
| Tailwind CSS v4 | Estilos |
| GSAP 3 | Animaciones |
| Supabase | Base de datos (productos y servicios) |
| Vercel | Hosting y deploy |
| Google Sheets (Apps Script) | Registro de leads del formulario |
| WhatsApp Business API | Envío de presupuestos |

---

## Levantar localmente

```bash
npm install
npm run dev
# Disponible en http://localhost:3000
```

### Variables de entorno

Crear un archivo `.env.local` en esta carpeta con:

```env
NEXT_PUBLIC_SUPABASE_URL=<URL del proyecto Supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clave anónima de Supabase>
```

Estos valores están en el dashboard de Supabase → Project Settings → API.

---

## Páginas y rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Home: hero, estadísticas, galería de trabajos, testimonios |
| `/productos` | Catálogo de losetas con slider de imágenes por modelo |
| `/presupuesto` | Formulario de 5 pasos para calcular presupuesto |
| `/instalacion` | Guía técnica de instalación en 6 pasos |
| `/terminos` | Términos y condiciones + política de privacidad |

---

## Estructura de carpetas

```
src/
├── app/                    # Rutas de Next.js (App Router)
│   ├── page.tsx            # Home
│   ├── layout.tsx          # Layout global (fuentes, SEO, nav)
│   ├── globals.css         # Estilos base + variables CSS
│   ├── robots.ts           # Configuración robots.txt
│   ├── sitemap.ts          # Sitemap automático
│   ├── productos/page.tsx
│   ├── presupuesto/page.tsx
│   ├── instalacion/page.tsx
│   └── terminos/page.tsx
├── components/
│   ├── ui/
│   │   ├── Masonry.jsx             # Galería masonry con lightbox
│   │   └── stagger-testimonials.tsx  # Carrusel de testimonios
│   ├── HomeClient.tsx          # Hero + galería + testimonios
│   ├── ProductosClient.tsx     # Grid de productos con slider
│   ├── PresupuestoClient.tsx   # Formulario de presupuesto multi-paso
│   ├── NavWrapper.tsx          # Wrapper del nav para Next.js
│   ├── PillNav.jsx             # Barra de navegación animada con GSAP
│   ├── Footer.tsx
│   ├── ScrollTopButton.tsx     # Botón flotante scroll-to-top
│   └── SectionDivider.tsx      # Divisor visual ◆ entre secciones
├── config/
│   └── products.ts         # Catálogo y servicios (datos fallback)
├── hooks/
│   ├── useProducts.ts      # Fetch productos desde Supabase
│   └── useServices.ts      # Fetch servicios desde Supabase
└── lib/
    ├── supabaseClient.ts   # Cliente de Supabase inicializado
    └── utils.ts            # Función cn() para clases de Tailwind
```

---

## Integraciones externas

### Supabase
- Tabla `products`: modelos de losetas con precios
- Tabla `services`: servicios adicionales (Laca, Cemento, etc.)
- Los hooks tienen fallback a `src/config/products.ts` si Supabase falla

### Google Sheets
- Al enviar el formulario de presupuesto se registra el lead via Apps Script
- El endpoint está definido en `src/components/PresupuestoClient.tsx`

### WhatsApp
- Al finalizar el formulario se abre WhatsApp con el presupuesto pre-escrito
- Número configurado en `PresupuestoClient.tsx`

---

## Deploy

El deploy es automático via Vercel al hacer push a `main`.

```bash
npm run build   # build de producción local
npm run start   # servir build local
```
