# Sumber aset

## Aset yang dibundel

- Logo vektor dan favicon: `public/favicon.svg`
- Social preview: `public/og.png`
- Newsreader Variable dan IBM Plex Sans Variable: dibundel melalui paket Fontsource pada saat build

## Media jarak jauh

Situs menggunakan foto natural dari Pexels dan Unsplash serta footage hewan nyata dari Wikimedia Commons. URL sumber dipertahankan di `lib/data.ts`, `components/HomeExperience.tsx`, `components/AuthExperience.tsx`, dan `app/about/page.tsx` agar asal media dapat diaudit.
