"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { sendGAEvent } from "@next/third-parties/google";
import { COOKIE_CONSENT_KEY } from "@/shared/consts";
import { Button } from "./Button";
import { Card } from "./Card";

interface CookieConsentProps {
  show?: boolean;
}

export function CookieConsent({ show = false }: CookieConsentProps) {
  const [visible, setVisible] = useState(show);

  function handleChoice(value: "accepted" | "declined") {
    document.cookie = `${COOKIE_CONSENT_KEY}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    sendGAEvent("event", "cookie_consent", { consent: value });
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <Card
            variant="default"
            padding="sm"
            className="border border-earth/8 shadow-lg shadow-earth/8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <p className="font-body font-light text-sm text-earth/80 grow">
                We use cookies to improve your experience and save your
                preferences. By continuing to use the site, you agree to our use
                of cookies.
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  as="button"
                  variant="text"
                  color="default"
                  size="sm"
                  onClick={() => handleChoice("declined")}
                >
                  Decline
                </Button>
                <Button
                  as="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleChoice("accepted")}
                >
                  Accept
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
