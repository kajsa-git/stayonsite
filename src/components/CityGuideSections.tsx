'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';
import type { CityGuide } from '@/data/city-guides/common';
import type { TranslationKey } from '@/data/translations';
import { getLocalizedText } from '@/lib/utils';

const navigation: Array<{ href: string; label: TranslationKey }> = [
  { href: '#why', label: 'cityGuide.worksites' },
  { href: '#areas', label: 'cityGuide.areas' },
  { href: '#planning', label: 'cityGuide.planning' },
  { href: '#homes', label: 'cityGuide.properties' },
  { href: '#faq', label: 'cityGuide.faq' },
];

export function CityGuideNavigation() {
  const { t } = useLanguage();
  return (
    <nav aria-label={t('cityGuide.navigation')} className="bg-background">
      <div className="container mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6 py-6 md:px-8">
        {navigation.map(({ href, label }) => (
          <Button key={href} asChild variant="outline" size="sm">
            <a href={href}>{t(label)}</a>
          </Button>
        ))}
        <Button asChild size="sm">
          <a href="#inquiry">
            {t('cityGuide.enquire')}
            <ArrowRight data-icon="inline-end" />
          </a>
        </Button>
      </div>
    </nav>
  );
}

export default function CityGuideSections({ cityName, guide }: { cityName: string; guide: CityGuide }) {
  const { language, t } = useLanguage();
  const local = (text: Parameters<typeof getLocalizedText>[0]) => getLocalizedText(text, language);
  const dateLocale = { sv: 'sv-SE', en: 'en-GB', pl: 'pl-PL' }[language];
  const reviewDate = new Intl.DateTimeFormat(dateLocale, {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  }).format(new Date(guide.reviewedAt));

  return (
    <>
      <section id="areas" aria-labelledby="areas-title" className="scroll-mt-28 bg-muted/40 py-16 md:py-24">
        <div className="container mx-auto flex max-w-6xl flex-col gap-8 px-6 md:px-8">
          <div className="flex max-w-3xl flex-col gap-4">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">{t('cityGuide.areas')}</p>
            <h2 id="areas-title" className="font-heading text-3xl font-semibold leading-tight text-foreground md:text-4xl">
              {t('cityGuide.areaHeading')} {cityName}?
            </h2>
            <p className="leading-relaxed text-muted-foreground">{t('cityGuide.tableCaption')}</p>
          </div>

          <div className="hidden rounded-2xl border bg-background p-2 md:block">
            <Table>
              <TableCaption className="sr-only">{t('cityGuide.tableCaption')}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col" className="w-1/5">{t('cityGuide.area')}</TableHead>
                  <TableHead scope="col" className="w-2/5">{t('cityGuide.suitableFor')}</TableHead>
                  <TableHead scope="col" className="w-2/5">{t('cityGuide.check')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guide.areas.map((area) => (
                  <TableRow key={area.name}>
                    <TableHead scope="row" className="align-top">{area.name}</TableHead>
                    <TableCell className="align-top leading-relaxed">{local(area.suitableFor)}</TableCell>
                    <TableCell className="align-top leading-relaxed">{local(area.check)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-7 md:hidden">
            {guide.areas.map((area) => (
              <div key={area.name} className="flex flex-col gap-4">
                <h3 className="font-heading text-xl font-semibold text-foreground">{area.name}</h3>
                <dl className="flex flex-col gap-4 text-sm leading-relaxed">
                  <div className="flex flex-col gap-1">
                    <dt className="font-semibold text-foreground">{t('cityGuide.suitableFor')}</dt>
                    <dd className="text-muted-foreground">{local(area.suitableFor)}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="font-semibold text-foreground">{t('cityGuide.check')}</dt>
                    <dd className="text-muted-foreground">{local(area.check)}</dd>
                  </div>
                </dl>
                <Separator />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planning" aria-labelledby="planning-title" className="scroll-mt-28 bg-background py-16 md:py-24">
        <div className="container mx-auto grid max-w-6xl gap-10 px-6 md:px-8 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div className="flex flex-col items-start gap-4">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">{t('cityGuide.planning')}</p>
            <h2 id="planning-title" className="font-heading text-3xl font-semibold leading-tight text-foreground">
              {t('cityGuide.planningHeading')} {cityName}
            </h2>
            <Button asChild variant="outline">
              <a href="#inquiry">
                {t('cityGuide.enquire')}
                <ArrowRight data-icon="inline-end" />
              </a>
            </Button>
          </div>
          <div className="flex min-w-0 flex-col gap-10">
            {guide.planning.map((section) => (
              <div key={section.title.sv} className="flex flex-col gap-4">
                <h3 className="font-heading text-xl font-semibold text-foreground md:text-2xl">{local(section.title)}</h3>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.sv} className="leading-7 text-muted-foreground">{local(paragraph)}</p>
                ))}
              </div>
            ))}
            <Separator />
            <div className="flex flex-col gap-4">
              <h3 className="font-heading text-xl font-semibold text-foreground">{t('cityGuide.housingTitle')}</h3>
              <p className="leading-7 text-muted-foreground">{t('cityGuide.housingDescription')}</p>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl bg-muted/50 p-6">
              <h3 className="font-semibold text-foreground">{t('cityGuide.sources')}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{t('cityGuide.sourceNote')}</p>
              <ul className="flex list-disc flex-col gap-3 pl-5 text-sm">
                {guide.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} className="text-primary underline underline-offset-4 hover:no-underline">
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t('cityGuide.author')} · {t('cityGuide.reviewed')}{' '}
                <time dateTime={guide.reviewedAt}>{reviewDate}</time>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
