# Superseded

Replaced on 2026-09-27 by the Darkroom design direction for the no-code pivot:

- Spec with live prototypes: `.claudedocs/design/darkroom.html`
- Tokens: `apps/web/src/app/globals.css` (paper, ink, fog, flash, ok/warn/bad)
- Fonts: Archivo (display, `wdth-*` utilities), Geist, Geist Mono via `apps/web/src/app/layout.tsx`
- Primitives: `components/brand/aperture.tsx`, `components/ui/develop.tsx`, `components/preview/*`, `components/ui/url-composer.tsx`

Rules that still apply everywhere:

- Saturated color appears only inside previews, and it is the customer's brand. Our chrome is ink, paper and fog.
- Fog means "not developed yet": blank previews, skeletons, sites without tags.
- One action color (flash yellow) per view.
- One signature motion: develop. Don't add fade-ups to every block.
- Public copy speaks to founders: "your link", "paste this". Developer terms stay on the Developer page.
