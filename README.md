# Red Bull — scroll-driven 3D storefront (concept)

Unofficial design concept. Not affiliated with Red Bull GmbH.

```bash
npm install
npm run dev        # http://localhost:3100
```

## Stack
Next.js 16 (App Router) · Tailwind CSS v4 · React Three Fiber + drei · GSAP ScrollTrigger · Framer Motion · Lenis

## How it fits together
- **One fixed WebGL canvas** (`components/three/Stage.tsx`) sits behind or in front of the page content, depending on z-index. Each section declares where the can should be with `data-can="x y scale rotX rotZ"`. Every frame the rig blends the two keyframes on either side of the viewport centre, so the can moves through the page, pinned sections included.
- **The can uses real product photos** (`lib/canPhotos.ts`). Each flavour's front-on studio shot in `public/cans/` is cropped automatically. It's cut out for the shop cards and unwrapped through a cylinder (photo column = sin(angle)) into the 3D can's label. Labels are built on demand, up to 4K wide, and only a few are kept on the GPU. The 3D body adds a clear-coat lacquer, so the studio light panels reflect off it as it turns.
- **Shared state** (`lib/store.ts`) is a mutable object for pointer, scroll velocity and active edition, so the render loop never causes React to re-render.
- **Scroll**: Lenis drives GSAP's ticker. ScrollTrigger handles the pinned story (word-by-word reveal), the pinned editions selector (each edition swaps the label mid-spin and recolours the page) and the background colour changes per section.

## Editing
- Editions and products: `lib/flavors.ts` (add a flavour = drop a front-on photo in `public/cans/` and add an entry)
- Can path through the page: the `data-can` attribute on each section
- Colours and fonts: `app/globals.css` (`@theme`)
