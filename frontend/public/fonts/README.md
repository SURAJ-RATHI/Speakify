# Manrope Font Files

This folder contains the locally-hosted Manrope font files that replace the Google Fonts CDN import.

## How to Download the Fonts

1. Go to [Google Fonts - Manrope](https://fonts.google.com/specimen/Manrope)
2. Select the font weights you need (400, 500, 600, 700, 800)
3. Download the font files in both WOFF and WOFF2 formats
4. Place the files in this folder with the following naming convention:
   - `Manrope-400.woff2` (weight 400)
   - `Manrope-400.woff` (weight 400)
   - `Manrope-500.woff2` (weight 500)
   - `Manrope-500.woff` (weight 500)
   - `Manrope-600.woff2` (weight 600)
   - `Manrope-600.woff` (weight 600)
   - `Manrope-700.woff2` (weight 700)
   - `Manrope-700.woff` (weight 700)
   - `Manrope-800.woff2` (weight 800)
   - `Manrope-800.woff` (weight 800)

## Alternative: Use Online Converter

If you only find TTF or OTF files, you can convert them using:
- [FontForge](https://fontforge.org/)
- Online converters like [CloudConvert](https://cloudconvert.com/)

## Benefits of Local Fonts

✅ Removes render-blocking Google Fonts request (saves ~870ms)
✅ Improves FCP (First Contentful Paint)
✅ Improves LCP (Largest Contentful Paint)
✅ Uses `font-display: swap` for instant text visibility
✅ Better performance control over static assets
