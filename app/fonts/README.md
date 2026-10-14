# Bundled web fonts

The existing Inter, Montserrat and Playfair Display typefaces are bundled with the site so production and blog CI builds do not fetch Google Fonts.

Source: the Google Fonts repository at commit `e9678a5385322c63730122ba464765baad83cfd8`. All three fonts use the SIL Open Font License 1.1; their copyright notices and licenses are included alongside the assets.

Generated with FontTools 4.60.1: WOFF2, normal style, existing weight ranges (Inter 300-700; Montserrat and Playfair Display 400-700), and other variable axes fixed at their original defaults. Latin and extended Latin glyphs, combining accents, punctuation, currency symbols and arrows are included; Swedish, English and Polish text are supported. Playfair Display is internally named StayOnSite Serif in this subset to respect its reserved font name.

This avoids the extensionless Google Fonts URL parsing failure in next/font/google: https://github.com/vercel/next.js/issues/99114

| Asset | Original source | SHA-256 |
| --- | --- | --- |
| `Inter-latin.woff2` | [Google Fonts](https://raw.githubusercontent.com/google/fonts/e9678a5385322c63730122ba464765baad83cfd8/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf) | `f37c39fdfbb5a754767b7def6e581362690150701064b8ab5173a6ff7b1b712d` |
| `Montserrat-latin.woff2` | [Google Fonts](https://raw.githubusercontent.com/google/fonts/e9678a5385322c63730122ba464765baad83cfd8/ofl/montserrat/Montserrat%5Bwght%5D.ttf) | `94ff2238628116536e768aa3035c123e9a491d4b3572e9643860020bba549788` |
| `PlayfairDisplay-latin.woff2` | [Google Fonts](https://raw.githubusercontent.com/google/fonts/e9678a5385322c63730122ba464765baad83cfd8/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf) | `c4d9913d5c085ecc79900faf737378684146182a94dad1b1c3cfdf8a375e6a78` |
