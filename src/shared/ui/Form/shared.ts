import { cva, type VariantProps } from "class-variance-authority";

export const labelVariants = cva(
  "font-body font-semibold text-earth text-xs uppercase tracking-[0.12em] block mb-2",
);

export const fieldVariants = cva(
  "w-full border rounded-xl px-4 font-body font-light text-earth bg-cream placeholder:text-earth/30 focus:outline-none transition-colors text-sm disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-sand/30",
  {
    variants: {
      state: {
        default: "border-parchment focus:border-orange",
        error: "border-red-400 focus:border-red-500",
      },
    },
    defaultVariants: {
      state: "default",
    },
  },
);

export type FieldVariantProps = VariantProps<typeof fieldVariants>;
