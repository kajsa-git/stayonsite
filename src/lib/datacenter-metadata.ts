import { DATACENTER_PATHS } from '@/data/datacenter';
import { datacenterTranslations } from '@/data/datacenter-translations';
import { COMPANY_FACTS } from '@/data/constants';
import { buildMetadata } from '@/lib/metadata';

export function datacenterMetadata(locale: keyof typeof DATACENTER_PATHS) {
  const copy = datacenterTranslations[locale];
  return buildMetadata({
    title: copy['datacenter.meta.title'],
    description: copy['datacenter.meta.description'],
    canonical: `${COMPANY_FACTS.url}${DATACENTER_PATHS[locale]}`,
    locale,
    hreflangs: Object.entries(DATACENTER_PATHS).map(([lang, path]) => ({
      lang,
      href: `${COMPANY_FACTS.url}${path}`,
    })),
  });
}
