/**
 * The U.S. 250 ml range. Each flavour's can is a real product photo in
 * `public/cans/` (see `canPhotos.ts`); the colours here only drive the page
 * (accents, background, rim light).
 */
export type Flavor = {
  id: string;
  name: string;
  edition: string | null;
  taste: string;
  description: string;
  notes: string[];
  /** Front-on product photo of the can. */
  photo: string;
  /** UI accent for this flavour (chips, outlines, swatches). */
  primary: string;
  /** Page background while this flavour is in focus. */
  bg: string;
  /** Rim-light colour in the 3D scene. */
  glow: string;
  price: number;
};

const can = (id: string) => `/cans/${id}.webp`;

export const flavors: Flavor[] = [
  {
    id: "original",
    name: "Original",
    edition: null,
    taste: "The Original",
    description: "The icon. Crisp, bright and unmistakable — the taste that started it all in 1987.",
    notes: ["Classic", "Crisp", "Iconic"],
    photo: can("original"),
    primary: "#C9CED8",
    bg: "#0B1A46",
    glow: "#3B6CFF",
    price: 2.49,
  },
  {
    id: "sugarfree",
    name: "Sugarfree",
    edition: "Sugarfree",
    taste: "Original taste, no sugar",
    description: "All the wings, none of the sugar. A lighter, sharper take on the original formula.",
    notes: ["No sugar", "Light", "Sharp"],
    photo: can("sugarfree"),
    primary: "#8FD3F4",
    bg: "#0B3557",
    glow: "#8FD3F4",
    price: 2.49,
  },
  {
    id: "zero",
    name: "Zero",
    edition: "Zero",
    taste: "Zero sugar",
    description: "Zero sugar, zero compromise — the Red Bull lift with a clean, crisp finish.",
    notes: ["Zero sugar", "Clean", "Crisp"],
    photo: can("zero"),
    primary: "#BFD8F0",
    bg: "#16263F",
    glow: "#9FC4FF",
    price: 2.49,
  },
  {
    id: "red",
    name: "Red",
    edition: "The Red Edition",
    taste: "Watermelon",
    description: "Juicy watermelon with a cool, clean finish. Summer, distilled into 250 ml.",
    notes: ["Watermelon", "Juicy", "Cool"],
    photo: can("red"),
    primary: "#E8474B",
    bg: "#4A0716",
    glow: "#FF2A4D",
    price: 2.79,
  },
  {
    id: "yellow",
    name: "Yellow",
    edition: "The Yellow Edition",
    taste: "Tropical",
    description: "A sun-soaked hit of tropical fruit. Bright, golden and impossible to ignore.",
    notes: ["Tropical", "Golden", "Bright"],
    photo: can("yellow"),
    primary: "#FFC906",
    bg: "#4D3500",
    glow: "#FFC906",
    price: 2.79,
  },
  {
    id: "seablue",
    name: "Sea Blue",
    edition: "The Sea Blue Edition",
    taste: "Juneberry",
    description: "Bright juneberry with a crisp, cooling edge. Clear water energy.",
    notes: ["Juneberry", "Crisp", "Cool"],
    photo: can("seablue"),
    primary: "#3AA0F0",
    bg: "#062A4F",
    glow: "#2E8BFF",
    price: 2.79,
  },
  {
    id: "amber",
    name: "Amber",
    edition: "The Amber Edition",
    taste: "Strawberry Apricot",
    description: "Ripe strawberry meets sun-warmed apricot. Golden hour in a can.",
    notes: ["Strawberry", "Apricot", "Warm"],
    photo: can("amber"),
    primary: "#FF9A2E",
    bg: "#4D2200",
    glow: "#FF8A1F",
    price: 2.79,
  },
  {
    id: "peach",
    name: "Peach",
    edition: "The Peach Edition",
    taste: "White Peach",
    description: "Soft, juicy white peach with a bright finish. Sweet, never sleepy.",
    notes: ["White peach", "Juicy", "Soft"],
    photo: can("peach"),
    primary: "#F06A9E",
    bg: "#4A0F2C",
    glow: "#FF7AB8",
    price: 2.79,
  },
  {
    id: "coconut",
    name: "Coconut",
    edition: "The Coconut Edition",
    taste: "Coconut Berry",
    description: "Creamy coconut with a tart berry twist. Island energy, chilled.",
    notes: ["Coconut", "Berry", "Creamy"],
    photo: can("coconut"),
    primary: "#DDE1E7",
    bg: "#262B36",
    glow: "#DCE6FF",
    price: 2.79,
  },
  {
    id: "pink",
    name: "Pink",
    edition: "The Pink Edition",
    taste: "Wild Berries",
    description: "A burst of wild berries — bright, tangy and a little bit rebellious.",
    notes: ["Wild berries", "Tangy", "Bright"],
    photo: can("pink"),
    primary: "#F7A8C8",
    bg: "#4A1A33",
    glow: "#FF9ACB",
    price: 2.79,
  },
  {
    id: "iced",
    name: "Iced",
    edition: "The Iced Edition",
    taste: "Iced Vanilla Berry",
    description: "Smooth vanilla and berry over ice. Frosty, creamy, wide awake.",
    notes: ["Vanilla", "Berry", "Frosty"],
    photo: can("iced"),
    primary: "#8FD6E3",
    bg: "#0C3A44",
    glow: "#A6F0FF",
    price: 2.79,
  },
  {
    id: "apple",
    name: "Apple",
    edition: "The Apple Edition",
    taste: "Fuji Apple & Ginger",
    description: "Crisp Fuji apple with a warm kick of ginger. Autumn, energised.",
    notes: ["Fuji apple", "Ginger", "Crisp"],
    photo: can("apple"),
    primary: "#F0556A",
    bg: "#4A1420",
    glow: "#FF6A7A",
    price: 2.79,
  },
  {
    id: "summer",
    name: "Summer",
    edition: "The Summer Edition",
    taste: "Sudachi Lime",
    description: "Zesty sudachi lime — sharp, sunny citrus for long days.",
    notes: ["Sudachi", "Lime", "Zesty"],
    photo: can("summer"),
    primary: "#F2E27A",
    bg: "#3E3A08",
    glow: "#F5EB7A",
    price: 2.79,
  },
];

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  cans: number;
  flavorIds: string[];
  tag?: string;
  swatch: string;
};

export const products: Product[] = [
  {
    id: "original-4",
    name: "Original 4-Pack",
    subtitle: "4 × 250 ml",
    price: 9.49,
    cans: 4,
    flavorIds: ["original"],
    tag: "Best seller",
    swatch: "#1F3C8C",
  },
  {
    id: "editions-12",
    name: "Editions Variety",
    subtitle: "12 × 250 ml · 6 flavours",
    price: 32.99,
    cans: 12,
    flavorIds: ["peach", "seablue", "amber", "yellow", "red", "coconut"],
    tag: "New",
    swatch: "#F06A9E",
  },
  {
    id: "sugarfree-24",
    name: "Sugarfree Case",
    subtitle: "24 × 250 ml",
    price: 49.99,
    cans: 24,
    flavorIds: ["sugarfree"],
    swatch: "#6FBDE8",
  },
  {
    id: "seasonal-4",
    name: "Seasonal Drop",
    subtitle: "4 × 250 ml · Limited",
    price: 10.99,
    cans: 4,
    flavorIds: ["summer", "apple", "iced", "pink"],
    tag: "Limited",
    swatch: "#F2E27A",
  },
];

export const flavorById = (id: string) => flavors.find((f) => f.id === id) ?? flavors[0];
