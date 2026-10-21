"use client";

import dynamic from "next/dynamic";
import { CartProvider } from "@/components/ui/Cart";
import { Cursor, Loader } from "@/components/ui/Interactions";
import { Nav } from "@/components/ui/Nav";
import { BackgroundController, SmoothScroll } from "@/components/ui/SmoothScroll";
import { Hero, Marquee } from "@/components/sections/Hero";
import { Story } from "@/components/sections/Story";
import { Ingredients } from "@/components/sections/Ingredients";
import { Flavors } from "@/components/sections/Flavors";
import { Shop } from "@/components/sections/Shop";
import { Finale, Footer } from "@/components/sections/Finale";

const Stage = dynamic(() => import("@/components/three/Stage"), { ssr: false });

export default function Page() {
  return (
    <CartProvider>
      <SmoothScroll />
      <Loader />
      <Cursor />
      <Nav />
      <Stage />
      <main>
        <Hero />
        <Marquee items={["Vitalizes body & mind", "80 mg caffeine", "Alpine water", "Since 1987"]} />
        <Story />
        <Ingredients />
        <Flavors />
        <Shop />
        <Finale />
      </main>
      <Footer />
      <BackgroundController />
      <div className="grain" aria-hidden />
    </CartProvider>
  );
}
