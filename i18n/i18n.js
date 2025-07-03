import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import es from './locales/es.json';
import en from './locales/en.json';

const locales = getLocales();

const lenguajeDelSistema = locales[0]?.languageCode === 'es' ? 'es' : 'en';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',

    lng: lenguajeDelSistema,

    fallbackLng: 'en',

    resources: {
      en: { translation: en },
      es: { translation: es },
    },

    interpolation: {
      escapeValue: false,
    },
  })

export default i18n;