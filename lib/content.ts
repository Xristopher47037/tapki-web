// Todo el texto de la página vive aquí.
// Para agregar un producto nuevo: copia un bloque de `projects`, cámbialo y pon su captura en public/shots/.

export type Lang = "es" | "en";
type T = Record<Lang, string>;

export type Project = {
  id: string;
  name: string;
  status: "live" | "dev";
  shot: string; // captura vertical en public/shots/
  niche: T;
  tagline: T;
  problem: T;
  features: Record<Lang, string[]>;
};

export const projects: Project[] = [
  {
    id: "menu",
    name: "Tapki Menu",
    status: "live",
    shot: "/shots/menu.webp",
    niche: { es: "Restaurantes", en: "Restaurants" },
    tagline: {
      es: "La carta, los pedidos y la caja en un solo lugar.",
      en: "Menu, orders and checkout in one place.",
    },
    problem: {
      es: "Cartas en papel, pedidos que se pierden y cuentas hechas a mano.",
      en: "Paper menus, lost orders and bills added up by hand.",
    },
    features: {
      es: [
        "Carta digital con QR y placas NFC en cada mesa",
        "Pedidos por WhatsApp con tamaños, opciones y adiciones",
        "App de meseros y caja con mesas, rondas y cobro por persona",
        "Horarios, estadísticas y QR personalizado",
        "Panel del dueño para editar platos, fotos y diseño",
      ],
      en: [
        "Digital menu with QR codes and NFC tags on every table",
        "WhatsApp ordering with sizes, options and add-ons",
        "Waiter app and checkout with tables, rounds and split bills",
        "Opening hours, analytics and custom QR codes",
        "Owner dashboard to edit dishes, photos and design",
      ],
    },
  },
  {
    id: "control",
    name: "Tapki Control",
    status: "live",
    shot: "/shots/control.webp",
    niche: { es: "Conjuntos y empresas", en: "Buildings and companies" },
    tagline: {
      es: "La asistencia de tu personal con un toque.",
      en: "Staff attendance with a single tap.",
    },
    problem: {
      es: "No saber a qué hora entra y sale tu personal, ni poder demostrarlo.",
      en: "Not knowing when your staff clocks in and out, or being able to prove it.",
    },
    features: {
      es: [
        "Registro con chip NFC, PIN y foto obligatoria",
        "Detecta solo si es entrada o salida",
        "Varios conjuntos, turnos y novedades",
        "Alertas automáticas de incumplimiento",
        "Reportes en Excel y CSV",
      ],
      en: [
        "Check-in with NFC tag, PIN and mandatory photo",
        "Knows on its own whether it's a check-in or check-out",
        "Multiple sites, shifts and incident notes",
        "Automatic compliance alerts",
        "Excel and CSV reports",
      ],
    },
  },
  {
    id: "card",
    name: "Tapki Card",
    status: "live",
    shot: "/shots/card.webp",
    niche: { es: "Profesionales y equipos", en: "Professionals and teams" },
    tagline: {
      es: "Tu tarjeta de presentación en un toque.",
      en: "Your business card in a single tap.",
    },
    problem: {
      es: "Tarjetas de papel que se pierden y datos que nadie guarda.",
      en: "Paper cards that get lost and contact details nobody saves.",
    },
    features: {
      es: [
        "Tarjeta NFC que abre tu perfil digital",
        "Guardar contacto con un toque",
        "Pase para Google Wallet",
        "Código QR de respaldo",
        "Llamar, WhatsApp, correo y ubicación",
      ],
      en: [
        "NFC card that opens your digital profile",
        "Save the contact in one tap",
        "Google Wallet pass",
        "Backup QR code",
        "Call, WhatsApp, email and location",
      ],
    },
  },
  {
    id: "vendedor",
    name: "Tapki Vendedor",
    status: "dev",
    shot: "/shots/vendedor.webp",
    niche: { es: "Negocios que venden por WhatsApp", en: "Businesses that sell on WhatsApp" },
    tagline: {
      es: "Un vendedor con IA que atiende 24/7.",
      en: "An AI salesperson that never clocks out.",
    },
    problem: {
      es: "Clientes que se van porque nadie les contestó a tiempo.",
      en: "Customers who leave because nobody answered in time.",
    },
    features: {
      es: [
        "Responde con trato humano y cálido",
        "Recuerda a cada cliente y lo que habló",
        "Clasifica clientes: frío, tibio y caliente",
        "Modo copiloto o autónomo",
        "Resumen diario al dueño y paso a humano",
      ],
      en: [
        "Replies with a warm, human tone",
        "Remembers every customer and their conversation",
        "Scores leads: cold, warm and hot",
        "Copilot or autopilot mode",
        "Daily owner summary and human handoff",
      ],
    },
  },
];

export const copy = {
  es: {
    home: "Inicio",
    menuHint: "Empieza aquí",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    headline: ["Software completo", "para cada", "problema"],
    badge: "Un toque. Listo.",
    paragraph: ["Creamos programas distintos para problemas distintos.", "Cada uno, lo más completo en su nicho."],
    demo: "Pedir demo",
    explore: "Ver productos",
    stats: [
      { value: "24/7", label: "Atención sin pausa" },
      { value: "NFC", label: "Un toque y listo" },
    ],
    counter: { value: String(projects.length), suffix: "+", label: "Productos y contando" },
    tabs: ["Carta, pedidos y caja", "Asistencia con un toque", "Tu tarjeta en un toque"],
    catalogKicker: "Productos",
    catalogTitle: "Un problema, un software.",
    catalogIntro: "Cada producto nace de un problema real y cubre todo lo que ese negocio necesita.",
    problemLabel: "El problema",
    live: "En uso",
    dev: "En desarrollo",
    wantDemo: (name: string) => `Hola, quiero una demo de ${name}`,
    wantInfo: "Hola, quiero saber más de Tapki",
    otherTitle: "¿Tienes otro problema?",
    otherText: "Cuéntanos qué te quita tiempo y lo convertimos en software.",
    otherCta: "Escríbenos por WhatsApp",
    otherMsg: "Hola Tapki, tengo un problema que quiero resolver con software:",
    footer: "Software completo para cada problema · Popayán, Colombia",
  },
  en: {
    home: "Home",
    menuHint: "Start here",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    headline: ["Complete software", "for every", "problem"],
    badge: "One tap. Done.",
    paragraph: ["We build different programs for different problems.", "Each one, the most complete in its niche."],
    demo: "Get a demo",
    explore: "See products",
    stats: [
      { value: "24/7", label: "Always-on service" },
      { value: "NFC", label: "One tap, done" },
    ],
    counter: { value: String(projects.length), suffix: "+", label: "Products and counting" },
    tabs: ["Menu, orders and checkout", "Attendance in one tap", "Your card in one tap"],
    catalogKicker: "Products",
    catalogTitle: "One problem, one software.",
    catalogIntro: "Every product starts from a real problem and covers everything that business needs.",
    problemLabel: "The problem",
    live: "Live",
    dev: "In development",
    wantDemo: (name: string) => `Hi, I'd like a demo of ${name}`,
    wantInfo: "Hi, I'd like to know more about Tapki",
    otherTitle: "Got a different problem?",
    otherText: "Tell us what's eating your time and we'll turn it into software.",
    otherCta: "Message us on WhatsApp",
    otherMsg: "Hi Tapki, I have a problem I'd like to solve with software:",
    footer: "Complete software for every problem · Popayán, Colombia",
  },
};
