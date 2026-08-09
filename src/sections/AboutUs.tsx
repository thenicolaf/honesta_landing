import Link from "next/link";
import { BackLink, Card } from "@/shared/ui";
import { SHOP_CATEGORY_LINKS } from "@/shared/consts/navLinks";
import {
  IconLeaf,
  IconHands,
  IconBurjKhalifa,
  IconCleanLabel,
  IconNoSugar,
} from "@/shared/icons";

const approachCards = [
  {
    icon: IconLeaf,
    title: "Real Ingredients",
    text: "We choose ingredients for their quality, flavour and purpose.",
  },
  {
    icon: IconCleanLabel,
    title: "Clear Recipes",
    text: "We believe customers should always know what is inside the product.",
  },
  {
    icon: IconHands,
    title: "Careful Production",
    text: "We use thoughtful preparation and controlled processes to achieve consistent quality and honest taste.",
  },
  {
    icon: IconNoSugar,
    title: "No Unnecessary Additives",
    text: "We do not add ingredients simply to make a product look more impressive or to hide the natural character of the food.",
  },
];

export function AboutUs() {
  return (
    <section className="noise relative bg-cream">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-12 lg:pt-16 pb-20 lg:pb-28">
        <BackLink sticky className="mb-8" />
        {/* ── Header ─────────────────────────────────── */}
        <div className="mx-auto max-w-3xl text-center mb-8 lg:mb-10">
          <p
            className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss mb-6 animate-hero-fade-up"
            style={{ animationDelay: "0.05s" }}
          >
            About Us
          </p>

          <h1
            className="font-display font-bold italic text-heading leading-tight mb-8 animate-hero-fade-up"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              animationDelay: "0.18s",
            }}
          >
            A Brand Built on Honest Food
          </h1>

          <div
            className="flex flex-col gap-4 font-body font-light text-earth/70 text-base lg:text-lg leading-relaxed animate-hero-fade-up"
            style={{ animationDelay: "0.31s" }}
          >
            <p>
              HONESTA began with a simple belief: people should be able to
              understand what they are eating.
            </p>
            <p>
              We create premium natural foods in the UAE using carefully
              selected ingredients, clear recipes and thoughtful production
              methods. What started with dried fruits and fruit rolls has grown
              into a broader collection that includes dried vegetables, ghee,
              jerky and signature mixes.
            </p>
            <p>
              Our products are different, but the principle behind them is
              always the same: real ingredients, honest taste and nothing
              unnecessary.
            </p>
          </div>
        </div>

        {/* ── Full details ────────────────────────────── */}
        <div className="flex flex-col gap-12 lg:gap-16 pt-6">
          {/* Why HONESTA */}
          <div className="mx-auto max-w-3xl text-center">
            <h3
              className="font-display font-semibold text-heading mb-4 animate-about-stagger"
              style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)" }}
            >
              Why HONESTA
            </h3>
            <div className="flex flex-col gap-4 font-body font-light text-earth/70 text-base leading-relaxed animate-about-stagger">
              <p>Our name is our promise.</p>
              <p>
                We do not use complicated recipes to make simple food look more
                impressive. We focus on the quality of the ingredients, the
                balance of flavour and careful production at every stage.
              </p>
              <p>
                We make products that we are happy to eat ourselves and proud to
                share with our families, customers and business partners.
              </p>
            </div>
          </div>

          {/* ── Our Products ─────────────────────────── */}
          <div className="mx-auto max-w-3xl text-center">
            <h3
              className="font-display font-semibold text-heading mb-4 animate-about-stagger"
              style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)" }}
            >
              Our Products
            </h3>
            <p className="font-body font-light text-earth/70 text-base leading-relaxed mb-8 animate-about-stagger">
              Our collection includes:
            </p>

            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mb-8">
              {SHOP_CATEGORY_LINKS.map(({ label, href }) => (
                <li key={href} className="animate-about-stagger">
                  <Link
                    href={href}
                    className="group flex h-full flex-col items-center justify-center gap-3 rounded-2xl bg-white-warm border border-parchment/60 px-4 py-6 md:py-7 transition-all duration-300 hover:border-orange/40 hover:shadow-sm hover:-translate-y-0.5"
                  >
                    <span className="font-display font-semibold text-heading text-lg md:text-xl text-center leading-snug">
                      {label}
                    </span>
                    <span
                      aria-hidden
                      className="h-px w-6 bg-orange/50 transition-all duration-300 group-hover:w-10"
                    />
                  </Link>
                </li>
              ))}
            </ul>

            <p className="font-body font-light text-earth/70 text-base leading-relaxed animate-about-stagger">
              Each product has its own recipe and character. Some contain only
              one ingredient, while others combine a small number of carefully
              selected ingredients. Every ingredient is clearly declared.
            </p>
          </div>

          {/* ── Made in the UAE ──────────────────────── */}
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3 mb-4 animate-about-stagger">
              <IconBurjKhalifa className="w-6 h-6 text-moss" />
              <h3
                className="font-display font-semibold text-heading"
                style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)" }}
              >
                Made in the UAE
              </h3>
            </div>
            <div className="flex flex-col gap-4 font-body font-light text-earth/70 text-base leading-relaxed animate-about-stagger">
              <p>HONESTA is a UAE-based family brand.</p>
              <p>
                Our products are made in the UAE in carefully controlled batches
                using professional equipment and hands-on quality control. We
                pay attention to every stage&nbsp;&mdash; from ingredient
                selection and preparation to production and packaging.
              </p>
            </div>
          </div>

          {/* ── Our Approach ─────────────────────────── */}
          <div>
            <h3
              className="font-display font-semibold text-heading text-center mb-10 animate-about-stagger"
              style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)" }}
            >
              Our Approach
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {approachCards.map(({ icon: Icon, title, text }) => (
                <div key={title} className="animate-about-stagger">
                  <Card
                    variant="sand"
                    padding="none"
                    className="h-full p-4 md:p-6"
                  >
                    <Icon className="w-7 h-7 md:w-9 md:h-9 text-orange mb-3 md:mb-4" />
                    <h4 className="font-display font-semibold text-heading text-base md:text-lg mb-1.5 md:mb-2 leading-snug">
                      {title}
                    </h4>
                    <p className="font-body font-light text-earth/70 text-2xs md:text-sm leading-relaxed">
                      {text}
                    </p>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* ── Who HONESTA Is For ───────────────────── */}
          <div className="mx-auto max-w-3xl text-center">
            <h3
              className="font-display font-semibold text-heading mb-4 animate-about-stagger"
              style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)" }}
            >
              Who HONESTA Is For
            </h3>
            <div className="flex flex-col gap-4 font-body font-light text-earth/70 text-base leading-relaxed animate-about-stagger">
              <p>
                HONESTA is made for people who value quality, clarity and real
                flavour.
              </p>
              <p>
                Our products can be enjoyed at home, at work, while travelling,
                with tea or coffee, as part of breakfast, in recipes, at events,
                or as a thoughtful gift.
              </p>
              <p>
                We also work with caf&eacute;s, restaurants, hotels, gyms,
                retailers, corporate clients and event partners across the UAE.
              </p>
            </div>
          </div>

          {/* ── Mission ─────────────────────────────── */}
          <div className="mx-auto max-w-3xl text-center">
            <h3
              className="font-display font-semibold text-heading mb-6 animate-about-stagger"
              style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)" }}
            >
              Our Mission
            </h3>

            <div className="flex flex-col gap-4 font-body font-light text-earth/70 text-base lg:text-lg leading-relaxed mb-8 animate-about-stagger">
              <p>
                Our mission is to build a trusted UAE food brand known for clear
                ingredients, thoughtful products and uncompromising attention to
                quality.
              </p>
              <p>We want choosing honest food to feel simple.</p>
            </div>

            <p
              className="font-display font-bold italic text-heading animate-about-stagger"
              style={{ fontSize: "clamp(1.3rem, 3vw, 1.8rem)" }}
            >
              Real ingredients, honest taste. Nothing else.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
