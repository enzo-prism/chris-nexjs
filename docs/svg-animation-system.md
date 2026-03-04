# SVG Animation System

Reference for the custom SVG motion layer used on the marketing site.

## Why this exists

The site uses lightweight, CSS-driven SVG animation accents to improve visual hierarchy without introducing heavy animation runtime dependencies.

Design goals:

- keep motion subtle and brand-appropriate for healthcare
- avoid layout shift and interaction interference
- respect reduced-motion user preferences
- keep assets reusable across sections/pages

## Current implementation

### Components

- `client/src/components/common/animated/AnimatedDentalAura.tsx`
  - orbital, node-based decorative accent used in hero backgrounds
  - includes `idPrefix` for safe `<defs>` usage when mounted multiple times
  - supports decorative and non-decorative accessibility modes (`title`, `desc`)
- `client/src/components/common/animated/AnimatedFlowDivider.tsx`
  - animated wave divider for transitions between major sections
  - includes `idPrefix`, decorative mode, and semantic SVG structure

### Current placements

- Hero accents:
  - `client/src/components/sections/HeroSection.tsx`
- Offers -> testimonials transition divider:
  - `client/src/pages/Home.tsx`

### Motion hooks and keyframes

Global animation classes and keyframes live in:

- `app/globals.css`

Key class families:

- `.svg-aura-orbital-*` for orbital accents
- `.svg-divider-wave-*` for section dividers

Keyframes:

- `svg-float-y`
- `svg-drift-x`
- `svg-dash-forward`
- `svg-dash-reverse`
- `svg-soft-pulse`
- `svg-node-twinkle`

## Accessibility and safety

- Decorative usage defaults to `aria-hidden`.
- Components support non-decorative mode with `title` and `desc`.
- `prefers-reduced-motion: reduce` disables wrapper and inner SVG animation hooks.
- Animations are non-blocking (`pointer-events-none` at placement level where needed).

## Performance policy

- Animate wrapper containers for transform-heavy effects when possible.
- Keep SVG precision low and deterministic.
- Avoid mixed animation technologies in a single asset.
- Keep accent assets small and avoid unnecessary nested groups.

## Usage pattern

Example:

```tsx
<AnimatedDentalAura
  idPrefix="hero-aura-primary"
  className="absolute -right-20 top-16 hidden h-64 w-64 text-sky-100/75 lg:block"
/>
```

Guidelines:

- always set a unique `idPrefix` when adding multiple instances on the same page
- keep accents behind content unless intentionally interactive
- use color via `currentColor` class utilities to align with section palette

## QA checklist for SVG motion changes

1. `pnpm run check`
2. `pnpm run build`
3. Visual check on:
   - desktop hero
   - tablet breakpoint
   - mobile breakpoint
4. Reduced-motion check:
   - enable OS/browser reduced-motion
   - verify accents render without movement
5. Confirm no overlap with critical text or CTA hit targets

## Extension guidance

When adding a new animated SVG accent:

1. place reusable component in `client/src/components/common/animated/`
2. use semantic IDs/classes and `viewBox`
3. keep animation CSS in `app/globals.css` unless strongly section-specific
4. include `idPrefix` support for defs safety
5. update this document with new component and placement references
