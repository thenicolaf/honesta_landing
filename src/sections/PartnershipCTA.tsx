"use client";

import Image from "next/image";
import { useActionState } from "react";
import { motion } from "motion/react";
import { Button } from "@/shared/ui";
import {
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  FormError,
} from "@/shared/ui";
import { IconInstagram } from "@/shared/icons";
import {
  submitPartnershipInquiry,
  type PartnershipState,
} from "./partnership/actions";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const BUSINESS_TYPES = [
  "Restaurant",
  "Café",
  "Grocery / Health Store",
  "Hotel",
  "Event Catering",
  "Other",
];

function PartnershipForm() {
  const [state, formAction, isPending] = useActionState<
    PartnershipState | null,
    FormData
  >(submitPartnershipInquiry, null);

  if (state?.success) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <p className="font-display font-semibold text-earth text-xl">
          Thank you!
        </p>
        <p className="font-body font-light text-earth/70 text-sm leading-relaxed">
          We&apos;ll be in touch within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form key={state?.attempt ?? 0} action={formAction} className="flex flex-col gap-4">
      <div>
        <FormLabel htmlFor="business_name">Business name</FormLabel>
        <FormInput
          id="business_name"
          name="business_name"
          type="text"
          placeholder="Bloom Café"
          defaultValue={state?.values?.business_name}
          state={state?.fieldErrors?.business_name ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.business_name} />
      </div>

      <div>
        <FormLabel htmlFor="contact_name">Contact person</FormLabel>
        <FormInput
          id="contact_name"
          name="contact_name"
          type="text"
          placeholder="Sara Al Mansoori"
          defaultValue={state?.values?.contact_name}
          state={state?.fieldErrors?.contact_name ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.contact_name} />
      </div>

      <div>
        <FormLabel htmlFor="phone">WhatsApp / Phone</FormLabel>
        <FormInput
          id="phone"
          name="phone"
          type="tel"
          placeholder="+971 50 000 0000"
          defaultValue={state?.values?.phone}
          state={state?.fieldErrors?.phone ? "error" : "default"}
        />
        <FormError message={state?.fieldErrors?.phone} />
      </div>

      <div>
        <FormLabel htmlFor="business_type">
          Business type{" "}
          <span className="normal-case tracking-normal font-light text-earth/40">
            (optional)
          </span>
        </FormLabel>
        <FormSelect
          id="business_type"
          name="business_type"
          defaultValue={state?.values?.business_type ?? ""}
          placeholder="Select type"
          options={BUSINESS_TYPES}
          clearable
        />
      </div>

      <div>
        <FormLabel htmlFor="message">
          Message{" "}
          <span className="normal-case tracking-normal font-light text-earth/40">
            (optional)
          </span>
        </FormLabel>
        <FormTextarea
          id="message"
          name="message"
          rows={3}
          placeholder="Tell us about your volumes, delivery area, or any questions..."
          defaultValue={state?.values?.message}
        />
      </div>

      {state?.error && (
        <p className="font-body text-2xs text-red-500">{state.error}</p>
      )}

      <Button
        as="button"
        type="submit"
        variant="primary"
        size="lg"
        className="w-full mt-1"
        disabled={isPending}
      >
        {isPending ? "Sending…" : "Send Request"}
      </Button>
    </form>
  );
}

export function PartnershipCTA() {
  return (
    <section
      id="contact"
      className="noise relative bg-orange overflow-hidden py-24 md:py-32"
    >
      {/* Background photo */}
      <Image
        src="/images/sections/Contact.webp"
        fill
        className="object-cover scale-105 blur-sm"
        alt=""
        aria-hidden="true"
      />
      {/* Orange tint overlay */}
      <div className="absolute inset-0 bg-orange/60" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            visible: {
              transition: { staggerChildren: 0.14, delayChildren: 0.05 },
            },
          }}
        >
          {/* Label */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="font-body font-semibold uppercase tracking-[0.18em] text-2xs text-white/70 mb-6 text-center"
          >
            Wholesale &amp; Partnerships
          </motion.p>

          {/* H2 */}
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-display font-bold italic text-white-warm leading-tight mb-5 text-center"
            style={{ fontSize: "clamp(1.9rem, 5vw, 3.8rem)" }}
          >
            Bring Honesta to your business
          </motion.h2>

          {/* Subheading */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-body font-light text-white/85 text-base md:text-lg leading-relaxed mb-8 md:mb-12 max-w-xl mx-auto text-center"
          >
            Restaurants, cafés, health stores, boutique hotels — we supply
            businesses of any size. Honest ingredients. Flexible volumes.
            Personal service.
          </motion.p>

          {/* Two-channel contact block */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="grid md:grid-cols-2 gap-6 items-start"
          >
            {/* Instagram card */}
            <div className="bg-white-warm/15 backdrop-blur-sm border border-white/20 rounded-2xl p-5 sm:p-8 flex flex-col gap-5">
              <div>
                <p className="font-body font-semibold text-white text-base mb-1">
                  Message us directly
                </p>
                <p className="font-body font-light text-white/70 text-sm leading-relaxed">
                  Quick questions, samples, or pricing — reach us on Instagram.
                </p>
              </div>

              <Button
                href={process.env.NEXT_PUBLIC_INSTAGRAM_DM_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                size="lg"
                className="w-full justify-center hover:bg-transparent hover:text-white-warm hover:border-white-warm"
              >
                <IconInstagram className="w-5 h-5 shrink-0" />
                Write us on Instagram
              </Button>

              <Button
                href={process.env.NEXT_PUBLIC_INSTAGRAM_BRAND_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="ghost"
                size="lg"
                className="border-transparent text-white/45 hover:text-white/75 hover:border-transparent font-light -mt-2 w-full justify-center"
              >
                instagram.com/{process.env.NEXT_PUBLIC_INSTAGRAM_BRAND}
              </Button>
            </div>

            {/* Partnership form card */}
            <div className="bg-white-warm rounded-2xl p-5 sm:p-8">
              <p className="font-body font-semibold text-earth text-base mb-5">
                Send a partnership request
              </p>
              <PartnershipForm />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
