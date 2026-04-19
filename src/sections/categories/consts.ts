import {
  IconLeaf,
  IconLightning,
  IconGift,
  IconFruitLeather,
} from "@/shared/icons";

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

