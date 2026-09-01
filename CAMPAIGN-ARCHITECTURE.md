# Kampanjarkitektur: Meta

## Annonskonto

```text
StayOnSite Meta Ads
├── 01_BOSTADSAGARE
│   └── META_LEADS_OWNER_SE_2026Q3
│       ├── OWNER_PRIORITY_JKG_KRN_GAV_LKP
│       │   ├── AD_COMPANY_ONLY_FEED_REELS
│       │   ├── AD_ZERO_FEE_FEED_REELS
│       │   └── AD_LOCAL_DEMAND_PRIORITY_FEED_REELS
│       └── OWNER_VOLUME_GBG_STHLM
│           ├── AD_COMPANY_ONLY_FEED_REELS
│           ├── AD_ZERO_FEE_FEED_REELS
│           └── AD_LOCAL_DEMAND_VOLUME_FEED_REELS
└── 02_FORETAGSKUNDER
    └── Förbereds men aktiveras inte i fas 1
```

## Kampanj

| Fält | Inställning |
|---|---|
| Namn | `META_LEADS_OWNER_SE_2026Q3` |
| Objective | Leads |
| Special Ad Category | Housing |
| Conversion location | Website |
| Dataset | StayOnSite Pixel + CAPI när klart |
| Conversion event | Lead |
| Bid strategy | Highest volume / Lowest cost |
| Attribution | 7-day click / 1-day view |
| Placements | Advantage+ |

## Annonsuppsättning 1: prioriterade projektstäder

- **Namn:** `OWNER_PRIORITY_JKG_KRN_GAV_LKP`
- **Platser:** Jönköping, Kiruna, Gävle och Linköping med den radie eller områdesnivå Ads Manager tillåter för bostadskategorin.
- **Målgrupp:** Bred, utan ålder, kön eller detaljerade intressen.
- **Budget:** 60 % av startbudgeten.
- **Annonser:** Tre koncept.

## Annonsuppsättning 2: volymstäder

- **Namn:** `OWNER_VOLUME_GBG_STHLM`
- **Platser:** Göteborg och Stockholm med den radie eller områdesnivå Ads Manager tillåter för bostadskategorin.
- **Målgrupp:** Bred.
- **Budget:** 40 % av startbudgeten.
- **Annonser:** Samma tre koncept med relevant stadscopy.

## URL och UTM-standard

Bas:

```text
https://www.stayonsite.se/lp/husagare
```

Mall:

```text
?utm_source=meta&utm_medium=paid_social&utm_campaign=meta_leads_owner_se_2026q3&utm_content={{ad.name}}&utm_term={{adset.name}}
```

Behåll Metas `fbclid`; sajten fångar redan värdet.

## Annonsnivå

- En huvudidé per annons.
- Villa- och radhusbilderna används som kreativa varianter inom bostadstyps-/efterfrågekonceptet, inte som nya annonsuppsättningar.
- Primärtext under cirka 125 tecken i rekommenderad variant.
- Rubrik 27–40 tecken när möjligt.
- CTA-knapp: “Sign Up” eller närmast tillgängliga svenska motsvarighet som matchar “Registrera din bostad”.
- 1080×1350 för Feed och 1080×1920 för Stories/Reels.
- Förhandsgranska alla automatiska kreativa förbättringar innan publicering.

## Senare: företagskundsdelen

Skapa en separat kampanjfamilj först när företagslandningssidan, eventet och CRM-flödet är definierade. Optimera inte båda affärssidorna mot samma generiska `Lead` utan att skicka tydlig `formType`/eventparameter och hålla rapporteringen separat.
