"use client";

import { GraduationCap, Sparkles } from "lucide-react";
import {
  Card,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleChevron,
  CollapsibleContent,
} from "@/shared/ui";
import {
  IconLeaf,
  IconLightning,
  IconHands,
  IconBurjKhalifa,
  IconCleanLabel,
  IconNoSugar,
} from "@/shared/icons";
import { useAboutExpanded } from "./about/AboutExpandedProvider";

const audienceCards = [
  {
    icon: GraduationCap,
    title: "For Children & Students",
    text: "Our fruit leathers and crisps are a safe and delicious alternative to candy. A convenient format for school lunchboxes that provides the energy of natural fruits without \u201Csugar crashes\u201D or artificial food coloring.",
  },
  {
    icon: IconLightning,
    title: "For Athletes & Active Individuals",
    text: "A natural powerhouse of carbs and vitamins for quick recovery before or after a workout. A light snack that boosts energy without leaving you feeling weighed down.",
  },
  {
    icon: IconLeaf,
    title: "For Those Who Choose Clean Eating",
    text: "If you carefully read labels and refuse to compromise on quality for the sake of a quick bite, HONESTA is made for you. We are returning food to its original purpose: to nourish the body and bring true enjoyment.",
  },
];

const qualityCards = [
  {
    icon: Sparkles,
    title: "Transparent Ingredients",
    text: "Our fruit leathers and crisps contain only ripe fruits, gently dehydrated at low temperatures to preserve maximum nutritional value. Our desserts feature premium Belgian Callebaut chocolate.",
  },
  {
    icon: IconHands,
    title: "Honest Production",
    text: "We are a family project, and the integrity of our process is fundamental to us. Thorough preparation of raw materials, the use of professional equipment, and personal control at every stage allow us to guarantee quality we are proud of.",
  },
];

const badges = [
  {
    Icon: IconBurjKhalifa,
    label: "Made in UAE",
    description: "Crafted in Dubai",
  },
  {
    Icon: IconLeaf,
    label: "100% Fruit",
    description: "Nothing else added",
  },
  {
    Icon: IconHands,
    label: "Small Batch",
    description: "Made by hand",
  },
  {
    Icon: IconCleanLabel,
    label: "Clean Label",
    description: "What you see = all",
  },
  {
    Icon: IconNoSugar,
    label: "No Sugar Added",
    description: "Natural sweetness only",
  },
];

export function AboutUs() {
  const { expanded, setExpanded } = useAboutExpanded();

  return (
    <section id="about" className="noise relative bg-cream overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-28">
        {/* ── Header ─────────────────────────────────── */}
        <div className="mx-auto max-w-3xl text-center mb-8 lg:mb-10">
          <p
            className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-moss mb-6 animate-hero-fade-up"
            style={{ animationDelay: "0.05s" }}
          >
            About Us
          </p>

          <h2
            className="font-display font-bold italic text-heading leading-tight mb-8 animate-hero-fade-up"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              animationDelay: "0.18s",
            }}
          >
            A Taste You Can Trust
          </h2>

          <p
            className="font-body font-light text-earth/70 text-base lg:text-lg leading-relaxed animate-hero-fade-up"
            style={{ animationDelay: "0.31s" }}
          >
            We created HONESTA as a personal manifesto against endless shelves
            of snacks where bright packaging hides preservatives, excess sugar,
            and chemical additives. Our goal is to create an honest product for
            everyone who values their health and chooses mindful nutrition
            without compromise.
          </p>
        </div>

        {/* ── Collapsible details ─────────────────────── */}
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleContent>
            <div className="flex flex-col gap-12 lg:gap-16 pt-6">
              {/* Why HONESTA? */}
              <div className="mx-auto max-w-3xl text-center">
                <h3
                  className="font-display font-semibold text-heading mb-4 animate-about-stagger"
                  style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)" }}
                >
                  Why HONESTA?
                </h3>
                <p className="font-body font-light text-earth/70 text-base leading-relaxed animate-about-stagger">
                  Our brand name is our promise. In a world overloaded with
                  complex ingredients, we choose purity. We create products that
                  we genuinely enjoy eating ourselves and confidently share with
                  our loved ones.
                </p>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-10 md:gap-6">
                {badges.map(({ Icon, label, description }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-3 text-center w-36 md:w-40 animate-about-stagger"
                  >
                    <Icon className="w-12 h-12 text-moss" />
                    <div className="w-8 h-px bg-parchment" />
                    <p className="font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth">
                      {label}
                    </p>
                    <p className="font-body font-light text-sm text-earth/60 leading-snug">
                      {description}
                    </p>
                  </div>
                ))}
              </div>

              {/* ── The Perfect Snack ────────────────────── */}
              <div>
                <h3
                  className="font-display font-semibold text-heading text-center mb-10 animate-about-stagger"
                  style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)" }}
                >
                  The Perfect Snack for Everyone
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {audienceCards.map(({ icon: Icon, title, text }) => (
                    <div key={title} className="animate-about-stagger">
                      <Card variant="default" padding="lg" className="h-full">
                        <Icon className="w-10 h-10 text-orange mb-5" />
                        <h4 className="font-display font-semibold text-heading text-lg mb-3">
                          {title}
                        </h4>
                        <p className="font-body font-light text-earth/70 text-sm leading-relaxed">
                          {text}
                        </p>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Our Approach to Quality ────────────────── */}
              <div>
                <h3
                  className="font-display font-semibold text-heading text-center mb-10 animate-about-stagger"
                  style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)" }}
                >
                  Our Approach to Quality
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {qualityCards.map(({ icon: Icon, title, text }) => (
                    <div key={title} className="animate-about-stagger">
                      <Card variant="sand" padding="lg" className="h-full">
                        <Icon className="w-10 h-10 text-orange mb-5" />
                        <h4 className="font-display font-semibold text-heading text-lg mb-3">
                          {title}
                        </h4>
                        <p className="font-body font-light text-earth/70 text-sm leading-relaxed">
                          {text}
                        </p>
                      </Card>
                    </div>
                  ))}
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

                <p className="font-body font-light text-earth/70 text-base lg:text-lg leading-relaxed mb-8 animate-about-stagger">
                  To give people the opportunity to snack right without wasting
                  time studying labels. We are building a community of those who
                  choose honesty&nbsp;&mdash; in food, in relationships, and in
                  life.
                </p>

                <p
                  className="font-display font-bold italic text-heading animate-about-stagger"
                  style={{ fontSize: "clamp(1.3rem, 3vw, 1.8rem)" }}
                >
                  HONESTA&nbsp;&mdash; Honest products for everyone.
                </p>
              </div>
            </div>
          </CollapsibleContent>

          <CollapsibleTrigger className="mx-auto mt-8 flex items-center gap-2 font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth/55 hover:text-orange transition-colors duration-200">
            {expanded ? "Read Less" : "Read More"}
            <CollapsibleChevron />
          </CollapsibleTrigger>
        </Collapsible>
      </div>
    </section>
  );
}
