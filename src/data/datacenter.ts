export const DATACENTER_PATHS = {
  sv: '/datacenter-boende',
  en: '/en/data-centre-accommodation-sweden',
  pl: '/pl/zakwaterowanie-centra-danych-szwecja',
} as const;

export const DATACENTER_UPDATED = '2026-10-27';

export const DATACENTER_SOURCES = {
  horndal: {
    title: 'Google tar spadtaget för sitt första datacenter i Sverige',
    publisher: 'Google',
    url: 'https://blog.google/intl/sv-se/foretagsnyheter/google-tar-spadtaget-for-sitt-forsta-datacenter-i-sverige/',
    checkedDate: DATACENTER_UPDATED,
  },
  borlange: {
    title: 'Mistral AI and EcoDataCenter Partner to Build AI-focused Data Center in Sweden',
    publisher: 'EcoDataCenter',
    url: 'https://ecodatacenter.tech/press/mistral-ai-and-ecodatacenter-partner-to-build-ai-focused-data-center-in-sweden-3431886',
    checkedDate: DATACENTER_UPDATED,
  },
  gavle: {
    title: 'Hur Microsoft adresserar digital suveränitet i Sverige',
    publisher: 'Microsoft',
    url: 'https://news.microsoft.com/source/emea/2026/10/hur-microsoft-adresserar-digital-suveranitet-i-sverige/?lang=sv',
    checkedDate: DATACENTER_UPDATED,
  },
} as const;
