"use client";

import { create } from "zustand";

export type Locale = "en" | "hi" | "es";

export const LOCALES: { id: Locale; label: string; flag: string }[] = [
  { id: "en", label: "English", flag: "🇬🇧" },
  { id: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { id: "es", label: "Español", flag: "🇪🇸" },
];

/**
 * Lightweight i18n store. In production this would use next-intl with
 * route-based locales (/en, /hi). For the SPA single-route architecture
 * we use a client-side store + localStorage persistence.
 *
 * Translations are namespaced by module. Add keys as needed.
 */
const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.resume-builder": "Resume Builder",
    "nav.resume-review": "Resume Review",
    "nav.jd-optimizer": "JD Optimizer",
    "nav.coach": "AI Career Coach",
    "nav.coding-practice": "Coding Practice",
    "nav.mock-interview": "AI Mock Interview",
    "nav.learning-hub": "Learning Hub",
    "nav.recruiter": "Recruiter Platform",
    "nav.pricing": "Plans & Billing",
    "nav.analytics": "Analytics",
    "nav.admin": "Admin Panel",
    "common.welcome": "Welcome back",
    "common.search": "Search or jump to…",
    "common.upgrade": "Upgrade to Pro",
    "common.signOut": "Sign out",
    "common.new": "New",
    "common.pro": "Pro",
    "common.free": "Free",
    "common.comingSoon": "Coming soon",
  },
  hi: {
    "nav.dashboard": "डैशबोर्ड",
    "nav.resume-builder": "रिज्यूमे बिल्डर",
    "nav.resume-review": "रिज्यूमे समीक्षा",
    "nav.jd-optimizer": "JD ऑप्टिमाइज़र",
    "nav.coach": "एआई करियर कोच",
    "nav.coding-practice": "कोडिंग अभ्यास",
    "nav.mock-interview": "एआई मॉक इंटरव्यू",
    "nav.learning-hub": "लर्निंग हब",
    "nav.recruiter": "रिक्रूटर प्लेटफ़ॉर्म",
    "nav.pricing": "प्लान और बिलिंग",
    "nav.analytics": "एनालिटिक्स",
    "nav.admin": "एडमिन पैनल",
    "common.welcome": "वापसी पर स्वागत है",
    "common.search": "खोजें या जाएं…",
    "common.upgrade": "प्रो में अपग्रेड करें",
    "common.signOut": "साइन आउट",
    "common.new": "नया",
    "common.pro": "प्रो",
    "common.free": "मुफ़्त",
    "common.comingSoon": "जल्द आ रहा है",
  },
  es: {
    "nav.dashboard": "Panel",
    "nav.resume-builder": "Creador de CV",
    "nav.resume-review": "Revisión de CV",
    "nav.jd-optimizer": "Optimizador de JD",
    "nav.coach": "Coach de Carrera IA",
    "nav.coding-practice": "Práctica de Código",
    "nav.mock-interview": "Entrevuesta IA",
    "nav.learning-hub": "Centro de Aprendizaje",
    "nav.recruiter": "Plataforma de Reclutador",
    "nav.pricing": "Planes y Facturación",
    "nav.analytics": "Analíticas",
    "nav.admin": "Panel de Admin",
    "common.welcome": "Bienvenido de nuevo",
    "common.search": "Buscar o ir a…",
    "common.upgrade": "Mejorar a Pro",
    "common.signOut": "Cerrar sesión",
    "common.new": "Nuevo",
    "common.pro": "Pro",
    "common.free": "Gratis",
    "common.comingSoon": "Próximamente",
  },
};

interface I18nStore {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const STORAGE_KEY = "careeros-locale";

function loadLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  return stored && ["en", "hi", "es"].includes(stored) ? stored : "en";
}

export const useI18n = create<I18nStore>((set, get) => ({
  locale: "en",
  setLocale: (l) => {
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, l);
    set({ locale: l });
    document.documentElement.lang = l;
  },
  t: (key) => {
    const { locale } = get();
    return TRANSLATIONS[locale]?.[key] ?? TRANSLATIONS.en[key] ?? key;
  },
}));

/** Call once on mount to hydrate the locale from localStorage. */
export function initLocale() {
  if (typeof window !== "undefined") {
    const l = loadLocale();
    useI18n.getState().setLocale(l);
  }
}
