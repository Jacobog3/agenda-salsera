import type { AcademyRecord } from "@/types/academy";
import type { EventRecord } from "@/types/event";
import type { SpotRecord } from "@/types/spot";
import type { TeacherRecord } from "@/types/teacher";

export const sampleEvents: EventRecord[] = [
  {
    id: "evt-1",
    slug: "salsa-social-zona-10",
    titleEs: "Salsa Social en Zona 10",
    titleEn: "Salsa Social in Zona 10",
    descriptionEs:
      "Una noche relajada para bailar salsa y bachata con DJs locales, clases introductorias y ambiente social.",
    descriptionEn:
      "A relaxed night of salsa and bachata with local DJs, intro classes, and a social atmosphere.",
    coverImageUrl: "/images/events/salsa-social-zona-10.svg",
    galleryUrls: [],
    danceStyle: "salsa_bachata",
    city: "Ciudad de Guatemala",
    area: "Zona 10",
    venueName: "Casa de la Danza",
    address: "Diagonal 6, Zona 10",
    startsAt: "2026-03-20T20:00:00-06:00",
    priceAmount: 50,
    currency: "GTQ",
    organizerName: "Explora Salsa GT",
    contactUrl: "https://wa.me/50255550101",
    externalUrl: "https://instagram.com/explorasalsagt",
    isFeatured: true
  },
  {
    id: "evt-2",
    slug: "bachata-sunset-antigua",
    titleEs: "Bachata Sunset en Antigua",
    titleEn: "Bachata Sunset in Antigua",
    descriptionEs:
      "Taller corto al atardecer seguido de social bachatero con vista al volcán.",
    descriptionEn:
      "A short sunset workshop followed by a bachata social with a volcano view.",
    coverImageUrl: "/images/events/bachata-sunset-antigua.svg",
    galleryUrls: [],
    danceStyle: "bachata",
    city: "Antigua Guatemala",
    area: "Centro",
    venueName: "Terraza Antigua",
    address: "5a Avenida Norte",
    startsAt: "2026-03-22T18:30:00-06:00",
    priceAmount: 75,
    currency: "GTQ",
    organizerName: "Bachata Antigua",
    contactUrl: "https://wa.me/50255550102",
    externalUrl: "https://instagram.com/bachataantigua",
    isFeatured: true
  },
  {
    id: "evt-3",
    slug: "practica-dominical-cayala",
    titleEs: "Práctica dominical en Cayalá",
    titleEn: "Sunday practice in Cayala",
    descriptionEs:
      "Espacio informal para practicar vueltas, conexión y musicalidad entre amigos.",
    descriptionEn:
      "An informal space to practice turns, connection, and musicality with friends.",
    coverImageUrl: "/images/events/practica-cayala.svg",
    galleryUrls: [],
    danceStyle: "salsa",
    city: "Ciudad de Guatemala",
    area: "Cayalá",
    venueName: "Plaza Central",
    address: "Ciudad Cayalá",
    startsAt: "2026-03-29T16:00:00-06:00",
    priceAmount: null,
    currency: "GTQ",
    organizerName: "Comunidad Social GT",
    contactUrl: "https://wa.me/50255550103",
    externalUrl: null,
    isFeatured: false
  }
];

export const sampleAcademies: AcademyRecord[] = [
  {
    id: "acd-1",
    slug: "casa-de-la-danza",
    name: "Casa de la Danza",
    descriptionEs:
      "Academia con clases regulares de salsa en línea, bachata sensual y práctica social para todos los niveles.",
    descriptionEn:
      "Academy with recurring classes in salsa on1, sensual bachata, and social practice for all levels.",
    coverImageUrl: "/images/academies/casa-de-la-danza.svg",
    city: "Ciudad de Guatemala",
    area: "Zona 10",
    address: "Diagonal 6, Zona 10",
    stylesTaught: ["salsa", "bachata"],
    whatsappUrl: "https://wa.me/50255550111",
    instagramUrl: "https://instagram.com/casadeladanzagt",
    websiteUrl: "https://casadeladanza.gt",
    isFeatured: true
  },
  {
    id: "acd-2",
    slug: "ritmo-antigua",
    name: "Ritmo Antigua",
    descriptionEs:
      "Espacio de aprendizaje con enfoque social, clases para visitantes y comunidad local en Antigua.",
    descriptionEn:
      "Learning space with a social focus, classes for visitors, and a local community in Antigua.",
    coverImageUrl: "/images/academies/ritmo-antigua.svg",
    city: "Antigua Guatemala",
    area: "Centro",
    address: "6a Calle Oriente",
    stylesTaught: ["salsa_bachata", "other"],
    whatsappUrl: "https://wa.me/50255550112",
    instagramUrl: "https://instagram.com/ritmoantigua",
    websiteUrl: null,
    isFeatured: true
  }
];

export const sampleSpots: SpotRecord[] = [
  {
    id: "spot-1",
    slug: "las-palmas-noches-tropicales",
    name: "Noches Tropicales – Las Palmas",
    descriptionEs:
      "Noches de salsa y ritmos tropicales en un ambiente relajado, de martes a domingo.",
    descriptionEn:
      "Salsa and tropical rhythm nights in a relaxed atmosphere, Tuesday through Sunday.",
    coverImageUrl: "/images/spots/las-palmas.svg",
    city: "Antigua Guatemala",
    area: "Centro",
    address: "5a Avenida Norte, Antigua Guatemala",
    scheduleEs: "Martes a Domingo · 9:15 PM",
    scheduleEn: "Tuesday to Sunday · 9:15 PM",
    coverChargeEs: "Por consumo",
    coverChargeEn: "No cover (minimum consumption)",
    whatsappUrl: "https://wa.me/50255550201",
    instagramUrl: "https://instagram.com/laspalmasantigua",
    googleMapsUrl: null,
    isFeatured: true
  },
  {
    id: "spot-2",
    slug: "la-casbah-jueves-latino",
    name: "Jueves Latino – La Casbah",
    descriptionEs:
      "Las Vibras de La Casbah con música latina cada jueves, ambiente social y pista de baile.",
    descriptionEn:
      "La Casbah vibes with Latin music every Thursday, social atmosphere and dance floor.",
    coverImageUrl: "/images/spots/la-casbah.svg",
    city: "Antigua Guatemala",
    area: "Centro",
    address: "5a Calle Poniente, Antigua Guatemala",
    scheduleEs: "Jueves · 8:00 PM",
    scheduleEn: "Thursdays · 8:00 PM",
    coverChargeEs: "Por consumo",
    coverChargeEn: "No cover (minimum consumption)",
    whatsappUrl: null,
    instagramUrl: "https://instagram.com/lacasbah",
    googleMapsUrl: null,
    isFeatured: true
  }
];

export const sampleTeachers: TeacherRecord[] = [
  {
    id: "tch-1",
    slug: "jose-medina",
    name: "Jose Medina",
    bioEs:
      "Jose Medina es un maestro de salsa y bachata con base en Antigua Guatemala. Trabaja principalmente en clases privadas y bootcamps para alumnos que buscan una experiencia mas flexible y personalizada.",
    bioEn:
      "Jose Medina is a salsa and bachata teacher based in Antigua Guatemala. He mainly works through private lessons and bootcamps for students looking for a more flexible and personalized experience.",
    profileImageUrl: "/local-images/teachers/jose-medina-profile.png",
    bannerImageUrl: null,
    city: "Antigua Guatemala",
    area: null,
    address: "Antigua Guatemala",
    stylesTaught: ["salsa", "bachata"],
    levels: "Principiante e intermedio",
    modality: "presencial",
    classFormats: ["Privadas", "Bootcamps"],
    teachingZones: ["Antigua Guatemala"],
    teachingVenues: ["Antigua Guatemala"],
    scheduleText: "Sabados · 4:00 PM a 5:00 PM",
    bookingUrl: null,
    whatsappUrl: "https://wa.me/50235695855",
    instagramUrl: "https://www.instagram.com/jmedinasalsa/",
    websiteUrl: null,
    trialClass: false,
    priceText: null,
    isFeatured: true
  }
];
