import next from "eslint-config-next";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "stayonsite-quick-lodgings-finder/**",
      "next-env.d.ts",
      "tsconfig.tsbuildinfo",
    ],
  },
  ...next,
  {
    rules: {
      // Marknadstext i sv/en/pl innehåller medvetet citattecken och apostrofer i
      // JSX-text. Regeln är rent kosmetisk och ger bara brus här → av.
      "react/no-unescaped-entities": "off",
      // Bilder serveras ooptimerade by design (next.config: images.unoptimized),
      // så <img> är det avsedda elementet. next/image är inte aktuellt → av.
      "@next/next/no-img-element": "off",
      // Nya React Compiler-regler i react-hooks v6. De flaggar etablerade,
      // avsiktliga mönster (setState i effekt, Math.random i useMemo för
      // skeleton-bredd i vendorad shadcn-kod, "latest ref"-mönstret i
      // use-google-places). Behåll som varningar så att de syns och kan
      // triageras över tid, utan att fälla bygget.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
    },
  },
];

export default eslintConfig;
