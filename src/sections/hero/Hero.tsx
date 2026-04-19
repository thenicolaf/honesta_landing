import Image from "next/image";
import { HeroContent } from "./HeroContent";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative h-screen min-h-160 overflow-hidden bg-cream"
    >
      {/* Parallax via CSS scroll-driven animation — no JS */}
      <div className="absolute inset-0 animate-hero-parallax">
        {/* Left hero image */}
        <div className="absolute inset-y-0 left-0 w-1/4 max-xl:w-1/3 max-md:w-[40%] animate-hero-slide-left">
          <Image
            src="/honesta_left_hero.webp"
            alt=""
            fill
            priority
            className="object-cover object-right"
            sizes="(max-width: 768px) 40vw, (max-width: 1280px) 33vw, 25vw"
          />
        </div>

        {/* Right hero image */}
        <div className="absolute inset-y-0 right-0 w-1/4 max-xl:w-1/3 max-md:w-[40%] animate-hero-slide-right">
          <Image
            src="/honesta_right_hero.webp"
            alt=""
            fill
            priority
            className="object-cover object-left"
            sizes="(max-width: 768px) 40vw, (max-width: 1280px) 33vw, 25vw"
          />
        </div>
      </div>

      {/* Soft overlay — warm fade from center */}
      <div className="absolute inset-0 bg-radial-[ellipse_60%_80%_at_center] from-sand/70 via-sand/30 to-transparent max-md:from-sand/85 max-md:via-sand/50" />

      {/* Content */}
      <HeroContent />
    </section>
  );
}
