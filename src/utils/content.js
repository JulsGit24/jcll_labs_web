export const content = {
  en: {
    nav: {
      home: "Home",
      work: "Work",
      photography: "Photography",
      about: "About",
      contact: "Contact",
      book: "Book a Session",
      automation: "Automation"
    },
    home: {
      title: "AI systems and custom software for Richmond businesses",
      subtitle: "Scoped, built, and handed over — automation and internal tools that remove manual work. One engineer, start to finish, in English or Spanish.",
      ctaPrimary: "Book a 30-minute intro call",
      ctaSecondary: "See photography work",
      explore: "Explore Work"
    },
    testimonials: {
      title: "Client Love",
      reviews: [
        {
          id: 1,
          name: "Sarah Jenkins",
          text: "Absolutely stunning photos! JCLL captured the essence of our wedding perfectly. Highly recommended.",
          role: "Wedding Client",
          image: "https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random"
        },
        {
          id: 2,
          name: "David Martinez",
          text: "Professional, creative, and easy to work with. The headshots came out better than I imagined.",
          role: "Corporate Client",
          image: "https://ui-avatars.com/api/?name=David+Martinez&background=random"
        },
        {
          id: 3,
          name: "Emily & Ryan",
          text: "We are in love with our engagement session. Every shot tells a story. Thank you so much!",
          role: "Engagement Session",
          image: "https://ui-avatars.com/api/?name=Emily+Ryan&background=random"
        }
      ]
    },
    about: {
      title: "About Me",
      description: "Mexican-born and now based in Virginia. I’m a Computer Science Engineer specialized in the intersection of marketing, artificial intelligence, and digital innovation. My work focuses on helping individuals and businesses transform ideas into impactful digital experiences through technology-driven solutions and creative storytelling. With a multidisciplinary approach, I offer services that combine technical expertise and visual creativity — from custom software development and AI consulting to photography, video production, and AI-powered content generation. Whether the goal is to optimize business processes, build intelligent tools, or create compelling visual content that elevates a brand, I design solutions that are both functional and aesthetically powerful. My mission is simple: leverage technology and creativity to solve real problems, improve efficiency, and help brands stand out in a competitive digital world.",
      instagram: "Follow on Instagram",
      profileAlt: "Portrait of the photographer"
    },
    work: {
      title: "Selected Works",
      subtitle: "Selected frames",
      // alt text is user-facing — it reaches screen readers, and after prerendering
      // it is also what a crawler believes the work is. `kind` filters the grid:
      // <Work kind="photo" /> on /photography/ leaves out the AI-generated frame,
      // which stays on the homepage as evidence for the AI content service.
      items: [
        { id: 1, src: '/images/photo1.jpg', kind: 'photo', alt: "Contact sheet of nine black-and-white studio portraits", category: "Portrait" },
        { id: 2, src: '/images/photo2.jpg', kind: 'ai', alt: "AI-generated food image: a lemon icebox dessert in hard afternoon light", category: "AI-assisted" },
        { id: 3, src: '/images/photo3.jpg', kind: 'photo', alt: "Low-key studio portrait of a man in a pinstripe suit holding red roses", category: "Studio" },
        { id: 4, src: '/images/photo4.jpg', kind: 'photo', alt: "Golden-hour portrait of a rider seated beside a motorcycle", category: "On location" },
        { id: 5, src: '/images/photo5.jpg', kind: 'photo', alt: "Product photograph of a lager can beside a poured glass on a wooden table", category: "Product" },
        { id: 6, src: '/images/photo6.jpg', kind: 'photo', alt: "Pet portrait of a Cavalier King Charles Spaniel in window light", category: "Pet" }
      ]
    },
    services: {
      title: "What JCLL Labs does",
      breadth: "The same studio builds the system and produces the content that runs through it.",
      // The six names and descriptions are byte-identical to public/home.md and to
      // .well-known/ai-catalog.json. AEO.jsx reads its service list from here so a
      // model never finds this site describing itself two different ways.
      items: [
        { id: 'ai', name: "AI consulting", description: "Strategy and implementation for businesses adopting artificial intelligence." },
        { id: 'software', name: "Custom software development", description: "Intelligent tools and internal systems built to a specific problem." },
        { id: 'automation', name: "Marketing automation", description: "Automation infrastructure and pipelines that remove manual work from marketing operations." },
        { id: 'photo', name: "Photography", description: "Commercial, portrait, and event work.", href: "/photography/" },
        { id: 'video', name: "Video production", description: "Direction through delivery." },
        { id: 'content', name: "AI-assisted content generation", description: "Visual and written content produced with AI in the loop, not instead of the loop." }
      ]
    },
    photography: {
      h1: "Photographer in Richmond, Virginia",
      sub: "Portraits, studio, on-location, and product work — shot, edited, and delivered by JCLL Labs.",
      ctaPrimary: "Book a session",
      ctaSecondary: "See the work",
      shootTitle: "What I shoot",
      areaTitle: "Where I work",
      areaBody: "Based in Richmond, Virginia. Regularly shooting in Richmond, Midlothian, Glen Allen, and Chesterfield.",
      videoTitle: "Video",
      bookTitle: "Book a session",
      // Every card is backed by a frame that exists in the portfolio above, except
      // the last, which points at the Films section.
      shoots: [
        { id: 'portrait', name: "Portrait", description: "Individual and professional portraits, in studio or on location." },
        { id: 'studio', name: "Studio", description: "Controlled low-key lighting for headshots, brand and editorial frames." },
        { id: 'location', name: "On location", description: "Natural-light work in and around Richmond." },
        { id: 'product', name: "Product", description: "Products and packaging, lit and styled for commerce and social." },
        { id: 'pet', name: "Pet", description: "Pet portraits, shot on the animal's own terms and its own schedule." },
        { id: 'event', name: "Event & video", description: "Coverage from setup to the last frame, stills or motion." }
      ]
    },
    animations: {
      title: "Automations",
      description: "Explore how our automation infrastructure works. Click on any node to learn more about each component in the pipeline.",
      hint: "Click on any node to explore",
      originalTitle: "Original Architecture Diagram"
    },
    contact: {
      title: "Get in Touch",
      email: "contact@jcll.me",
      message: "For bookings and inquiries, please email me or reach out via social media.",
      sendButton: "Send Message",
      sending: "Sending...",
      socials: "Connect with me",
      responseTime: "Replies within one business day."
    },
    flash: {
      title: "Shot Captured!",
      message: "Thanks {name}, we'll contact you soon.",
      close: "Close"
    },
    footer: {
      navigation: "Navigation",
      contact: "Contact",
      follow: "Follow",
      location: "Location: Richmond, VA",
      backToTop: "Top",
      rights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service"
    },
    seo: {
      title: "AI Consulting & Custom Software in Richmond, VA | JCLL Labs",
      description: "AI consulting and custom software for Richmond, VA businesses. Automation and internal tools that remove manual work. Book a 30-minute intro call."
    },
    // Per-route <title>/<meta description>/OG image, keyed by the canonical path
    // SEO.jsx derives from the router. A route with no entry falls back to `seo`.
    // Keep this key AFTER `seo` — test/run.mjs §7 reads the first `title:` that
    // follows `seo: {` to byte-match index.html.
    seoPages: {
      '/': {
        ogImage: "/og-image.jpg",
        ogImageAlt: "JCLL Labs — AI systems and custom software for Richmond businesses"
      },
      '/photography/': {
        title: "Photographer in Richmond, VA | JCLL Labs",
        description: "Portrait, event, and brand photography in Richmond, Virginia. Also serving Midlothian, Glen Allen, and Chesterfield. See the work and book a session.",
        ogImage: "/og-photography.jpg",
        ogImageAlt: "JCLL Labs — photographer in Richmond, Virginia"
      }
    },
    referralClub: {
      title: "Referral Club",
      subtitle: "Curated tools, gear, and exclusive partner codes for creators.",
      copied: "copied!",
      redeem: "Redeem"
    },
    interact: {
      title: "Interactive Site",
      subtitle: "Drag to explore and click colored nodes to preview sections.",
      nodes: {
        home: "Home",
        work: "Portfolios",
        about: "About JCLL",
        animations: "Automations",
        contact: "Get in Touch"
      }
    }
  },
  es: {
    nav: {
      home: "Inicio",
      work: "Portafolio",
      photography: "Fotografía",
      about: "Sobre Mí",
      contact: "Contacto",
      book: "Reservar Sesión",
      automation: "Automatización"
    },
    home: {
      title: "Sistemas de IA y software a medida para empresas de Richmond",
      subtitle: "Definidos, construidos y entregados — automatización y herramientas internas que eliminan el trabajo manual. Un solo ingeniero, de principio a fin, en inglés o español.",
      ctaPrimary: "Agenda una llamada de 30 minutos",
      ctaSecondary: "Ver trabajo fotográfico",
      explore: "Explorar Trabajo"
    },
    testimonials: {
      title: "Testimonios",
      reviews: [
        {
          id: 1,
          name: "Sarah Jenkins",
          text: "¡Fotos absolutamente impresionantes! JCLL capturó la esencia de nuestra boda perfectamente. Muy recomendado.",
          role: "Cliente de Boda",
          image: "https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random"
        },
        {
          id: 2,
          name: "David Martinez",
          text: "Profesional, creativo y fácil de trabajar. Los retratos corporativos salieron mejor de lo que imaginaba.",
          role: "Cliente Corporativo",
          image: "https://ui-avatars.com/api/?name=David+Martinez&background=random"
        },
        {
          id: 3,
          name: "Emily & Ryan",
          text: "Estamos enamorados de nuestra sesión de compromiso. Cada toma cuenta una historia. ¡Muchas gracias!",
          role: "Sesión de Compromiso",
          image: "https://ui-avatars.com/api/?name=Emily+Ryan&background=random"
        }
      ]
    },
    about: {
      title: "Sobre Mí",
      description: "Nacido en México y actualmente basado en Virginia. Soy ingeniero en sistemas especializado en la intersección del marketing, la inteligencia artificial y la innovación digital. Mi trabajo se centra en ayudar a personas y empresas a transformar ideas en experiencias digitales impactantes a través de soluciones tecnológicas y storytelling creativo. Con un enfoque multidisciplinario, ofrezco servicios que combinan experiencia técnica y creatividad visual — desde desarrollo de software personalizado y consultoría en IA hasta fotografía, producción de video y generación de contenido impulsado por IA. Ya sea que el objetivo sea optimizar procesos de negocio, crear herramientas inteligentes o producir contenido visual atractivo que eleve una marca, diseño soluciones que son funcionales y estéticamente potentes. Mi misión es simple: aprovechar la tecnología y la creatividad para resolver problemas reales, mejorar la eficiencia y ayudar a las marcas a destacar en un mundo digital competitivo.",
      instagram: "Sígueme en Instagram",
      profileAlt: "Retrato del fotógrafo"
    },
    work: {
      title: "Trabajos Seleccionados",
      subtitle: "Fotografías seleccionadas",
      items: [
        { id: 1, src: '/images/photo1.jpg', kind: 'photo', alt: "Hoja de contactos con nueve retratos de estudio en blanco y negro", category: "Retrato" },
        { id: 2, src: '/images/photo2.jpg', kind: 'ai', alt: "Imagen de comida generada con IA: un postre de limón bajo luz dura de tarde", category: "Con IA" },
        { id: 3, src: '/images/photo3.jpg', kind: 'photo', alt: "Retrato de estudio en clave baja de un hombre con traje a rayas sosteniendo rosas rojas", category: "Estudio" },
        { id: 4, src: '/images/photo4.jpg', kind: 'photo', alt: "Retrato a la hora dorada de un motociclista sentado junto a su moto", category: "En locación" },
        { id: 5, src: '/images/photo5.jpg', kind: 'photo', alt: "Fotografía de producto de una lata de cerveza junto a una copa servida sobre una mesa de madera", category: "Producto" },
        { id: 6, src: '/images/photo6.jpg', kind: 'photo', alt: "Retrato de una mascota, un Cavalier King Charles Spaniel, bajo la luz de una ventana", category: "Mascotas" }
      ]
    },
    services: {
      title: "Qué hace JCLL Labs",
      breadth: "El mismo estudio construye el sistema y produce el contenido que circula por él.",
      items: [
        { id: 'ai', name: "Consultoría en IA", description: "Estrategia e implementación para empresas que adoptan inteligencia artificial." },
        { id: 'software', name: "Desarrollo de software personalizado", description: "Herramientas inteligentes y sistemas internos construidos para un problema específico." },
        { id: 'automation', name: "Automatización de marketing", description: "Infraestructura y pipelines de automatización que eliminan el trabajo manual de las operaciones de marketing." },
        { id: 'photo', name: "Fotografía", description: "Trabajo comercial, de retrato y de eventos.", href: "/photography/" },
        { id: 'video', name: "Producción de video", description: "Desde la dirección hasta la entrega." },
        { id: 'content', name: "Generación de contenido con IA", description: "Contenido visual y escrito producido con IA en el proceso, no en lugar del proceso." }
      ]
    },
    photography: {
      h1: "Fotógrafo en Richmond, Virginia",
      sub: "Retrato, estudio, locación y producto — capturado, editado y entregado por JCLL Labs.",
      ctaPrimary: "Reservar una sesión",
      ctaSecondary: "Ver el trabajo",
      shootTitle: "Qué fotografío",
      areaTitle: "Dónde trabajo",
      areaBody: "Basado en Richmond, Virginia. Fotografiando habitualmente en Richmond, Midlothian, Glen Allen y Chesterfield.",
      videoTitle: "Video",
      bookTitle: "Reservar una sesión",
      shoots: [
        { id: 'portrait', name: "Retrato", description: "Retratos individuales y profesionales, en estudio o en locación." },
        { id: 'studio', name: "Estudio", description: "Iluminación controlada en clave baja para retratos corporativos, de marca y editoriales." },
        { id: 'location', name: "En locación", description: "Trabajo con luz natural en Richmond y sus alrededores." },
        { id: 'product', name: "Producto", description: "Productos y empaques, iluminados y estilizados para comercio y redes." },
        { id: 'pet', name: "Mascotas", description: "Retratos de mascotas, en sus propios términos y a su propio ritmo." },
        { id: 'event', name: "Eventos y video", description: "Cobertura desde el montaje hasta la última toma, en foto o en movimiento." }
      ]
    },
    animations: {
      title: "Automatizaciones",
      description: "Explora cómo funciona nuestra infraestructura de automatización. Haz clic en cualquier nodo para conocer más sobre cada componente del pipeline.",
      hint: "Haz clic en cualquier nodo para explorar",
      originalTitle: "Diagrama de Arquitectura Original"
    },
    contact: {
      title: "Contacto",
      email: "contact@jcll.me",
      message: "Para reservas y consultas, por favor envíame un correo o contáctame vía redes sociales.",
      sendButton: "Enviar Mensaje",
      sending: "Enviando...",
      socials: "Conéctate conmigo",
      responseTime: "Respuesta en un día hábil."
    },
    flash: {
      title: "¡Toma Capturada!",
      message: "Gracias {name}, te contactaremos pronto.",
      close: "Cerrar"
    },
    footer: {
      navigation: "Navegación",
      contact: "Contacto",
      follow: "Sígueme",
      location: "Ubicación: Richmond, VA",
      backToTop: "Arriba",
      rights: "Todos los derechos reservados.",
      privacy: "Política de Privacidad",
      terms: "Términos de Servicio"
    },
    seo: {
      title: "Consultoría en IA y Software a Medida | JCLL Labs",
      description: "Consultoría en IA y software a medida para empresas en Richmond, VA. Automatización y herramientas internas. Agenda una llamada de 30 minutos."
    },
    seoPages: {
      '/': {
        ogImage: "/og-image.jpg",
        ogImageAlt: "JCLL Labs — sistemas de IA y software a medida para empresas de Richmond"
      },
      '/photography/': {
        title: "Fotógrafo en Richmond, VA | JCLL Labs",
        description: "Fotografía de retrato, estudio, producto y eventos en Richmond, Virginia. También en Midlothian, Glen Allen y Chesterfield. Reserva tu sesión.",
        ogImage: "/og-photography.jpg",
        ogImageAlt: "JCLL Labs — fotógrafo en Richmond, Virginia"
      }
    },
    referralClub: {
      title: "Club de Referidos",
      subtitle: "Herramientas seleccionadas, equipo de cámara y códigos exclusivos de socios para creadores.",
      copied: "copiado!",
      redeem: "Canjear"
    },
    interact: {
      title: "Sitio Interactivo",
      subtitle: "Arrastra para explorar y haz clic en los nodos de color para vistas previas.",
      nodes: {
        home: "Inicio",
        work: "Portafolios",
        about: "Sobre JCLL",
        animations: "Automatizaciones",
        contact: "Contacto"
      }
    }
  }
};
