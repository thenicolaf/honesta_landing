"use client";

import { useScroll, useTransform, motion } from "motion/react";

export function HeroParallax({ children }: { children: React.ReactNode }) {
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 600], [0, 120]);

  return (
    <motion.div className="absolute inset-0" style={{ y: imageY }}>
      {children}
    </motion.div>
  );
}
