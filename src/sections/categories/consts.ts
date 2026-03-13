import { Category } from "@/shared/types";
import {
  IconLeaf,
  IconLightning,
  IconGift,
  IconFruitLeather,
} from "@/shared/icons";


export const SLUG_TO_CATEGORY: Record<string, Category> = {
  "dried-fruits": Category.DriedFruits,
  "fruit-leather": Category.FruitLeather,
  "mix-and-gift": Category.MixAndGift,
  "mix-seeds": Category.MixSeeds,
};

export const CATEGORY_UI_MAP: Record<
  string,
  { Icon: React.ComponentType<React.ComponentProps<"svg">>; placeholderBg: string }
> = {
  "mix-and-gift": {
    Icon: IconGift,
    placeholderBg: "bg-bark/10",
  },
  "dried-fruits": {
    Icon: IconLeaf,
    placeholderBg: "bg-orange/10",
  },
  "fruit-leather": {
    Icon: IconFruitLeather,
    placeholderBg: "bg-moss/10",
  },
  "mix-seeds": {
    Icon: IconLightning,
    placeholderBg: "bg-earth/10",
  },
};

export const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
};

export const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};
