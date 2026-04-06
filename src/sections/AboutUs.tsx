"use client";

import { motion } from "motion/react";
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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

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
              <motion.div
                className="mx-auto max-w-3xl text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.13, delayChildren: 0.05 },
                  },
                }}
              >
                <motion.h3
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="font-display font-semibold text-heading mb-4"
                  style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)" }}
                >
                  Why HONESTA?
                </motion.h3>
                <motion.p
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="font-body font-light text-earth/70 text-base leading-relaxed"
                >
                  Our brand name is our promise. In a world overloaded with
                  complex ingredients, we choose purity. We create products that
                  we genuinely enjoy eating ourselves and confidently share with
                  our loved ones.
                </motion.p>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                className="flex flex-wrap justify-center gap-10 md:gap-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
                  },
                }}
              >
                {badges.map(({ Icon, label, description }) => (
                  <motion.div
                    key={label}
                    variants={fadeUp}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    className="flex flex-col items-center gap-3 text-center w-36 md:w-40"
                  >
                    <Icon className="w-12 h-12 text-moss" />
                    <div className="w-8 h-px bg-parchment" />
                    <p className="font-body font-semibold uppercase tracking-[0.12em] text-2xs text-earth">
                      {label}
                    </p>
                    <p className="font-body font-light text-sm text-earth/60 leading-snug">
                      {description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
              {/* ── The Perfect Snack ────────────────────── */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.13, delayChildren: 0.05 },
                  },
                }}
              >
                <motion.h3
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="font-display font-semibold text-heading text-center mb-10"
                  style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)" }}
                >
                  The Perfect Snack for Everyone
                </motion.h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {audienceCards.map(({ icon: Icon, title, text }) => (
                    <motion.div
                      key={title}
                      variants={fadeUp}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      <Card variant="default" padding="lg" className="h-full">
                        <Icon className="w-10 h-10 text-orange mb-5" />
                        <h4 className="font-display font-semibold text-heading text-lg mb-3">
                          {title}
                        </h4>
                        <p className="font-body font-light text-earth/70 text-sm leading-relaxed">
                          {text}
                        </p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* ── Our Approach to Quality ────────────────── */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.13, delayChildren: 0.05 },
                  },
                }}
              >
                <motion.h3
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="font-display font-semibold text-heading text-center mb-10"
                  style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)" }}
                >
                  Our Approach to Quality
                </motion.h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {qualityCards.map(({ icon: Icon, title, text }) => (
                    <motion.div
                      key={title}
                      variants={fadeUp}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      <Card variant="sand" padding="lg" className="h-full">
                        <Icon className="w-10 h-10 text-orange mb-5" />
                        <h4 className="font-display font-semibold text-heading text-lg mb-3">
                          {title}
                        </h4>
                        <p className="font-body font-light text-earth/70 text-sm leading-relaxed">
                          {text}
                        </p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* ── Mission ─────────────────────────────── */}
              <motion.div
                className="mx-auto max-w-3xl text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.13, delayChildren: 0.05 },
                  },
                }}
              >
                <motion.h3
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="font-display font-semibold text-heading mb-6"
                  style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)" }}
                >
                  Our Mission
                </motion.h3>

                <motion.p
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="font-body font-light text-earth/70 text-base lg:text-lg leading-relaxed mb-8"
                >
                  To give people the opportunity to snack right without wasting
                  time studying labels. We are building a community of those who
                  choose honesty&nbsp;&mdash; in food, in relationships, and in
                  life.
                </motion.p>

                <motion.p
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="font-display font-bold italic text-heading"
                  style={{ fontSize: "clamp(1.3rem, 3vw, 1.8rem)" }}
                >
                  HONESTA&nbsp;&mdash; Honest products for everyone.
                </motion.p>
              </motion.div>
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
