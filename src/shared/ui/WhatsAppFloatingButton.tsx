"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { Button } from "./Button";
import { Tooltip, TooltipTrigger, TooltipContent } from "./Tooltip";
import { IconWhatsApp } from "@/shared/icons";

interface WhatsAppFloatingButtonProps {
  phone: string;
}

const TAB_BAR_LIFT = 72;
const MOBILE_QUERY = "(max-width: 1023.98px)";

const subscribeMobile = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const getMobileSnapshot = () =>
  typeof window === "undefined"
    ? false
    : window.matchMedia(MOBILE_QUERY).matches;

const getMobileServerSnapshot = () => false;

export function WhatsAppFloatingButton({ phone }: WhatsAppFloatingButtonProps) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [tabBarVisible, setTabBarVisible] = useState(true);
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getMobileServerSnapshot,
  );

  useMotionValueEvent(scrollY, "change", (current) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (Math.abs(current - prev) < 4) return;
    const atBottom =
      window.innerHeight + current >= document.body.scrollHeight - 80;
    setTabBarVisible(current > prev && !atBottom);
  });

  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (pathname?.startsWith("/panel")) return null;

  const liftY = isMobile && tabBarVisible ? -TAB_BAR_LIFT : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <motion.div
        animate={{ y: liftY }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative"
      >
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-whatsapp pointer-events-none"
          animate={{ scale: [1, 1.6], opacity: [0, 0.45, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
        />
        <Tooltip side="left">
          <TooltipTrigger asChild>
            <Button
              href={`https://wa.me/${digits}`}
              target="_blank"
              rel="noopener noreferrer"
              size="icon"
              aria-label="Chat with support on WhatsApp"
              className="relative w-11 h-11 bg-whatsapp border-whatsapp text-white hover:bg-whatsapp-hover hover:border-whatsapp-hover hover:scale-115 shadow-lg shadow-earth/20"
            >
              <IconWhatsApp className="w-6 h-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Chat with support</TooltipContent>
        </Tooltip>
      </motion.div>
    </motion.div>
  );
}
