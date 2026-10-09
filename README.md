# Tapki — sitio web

Página de Tapki con todos sus productos: Tapki Menu, Tapki Control, Tapki Card y Tapki Vendedor. Está en español e inglés.

Next.js 16 · React 19 · Tailwind CSS 4 · Framer Motion

```bash
npm install
npm run dev
```

## Agregar un producto

1. Pon una captura vertical (390×780 o proporción 1:2) en `public/shots/`.
2. En `lib/content.ts`, copia un bloque de `projects` y cambia los textos en `es` y `en`.

El producto aparece solo en el catálogo, en el menú y en el contador del inicio.

## Textos y WhatsApp

- Textos: `lib/content.ts` (`copy`).
- Número de WhatsApp: `lib/hero-data.ts` (`WHATSAPP`).

## Publicar

Importa el repo en Vercel (Add New → Project). No necesita variables de entorno.
