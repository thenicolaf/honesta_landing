"use client";

import { Card, Button } from "@/shared/ui";
import { IconAlertCircle } from "@/shared/icons";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <main className="grow min-h-160 bg-cream flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        <Card variant="default" padding="lg" className="text-center">
          <div className="w-16 h-16 rounded-full bg-sand mx-auto mb-6 flex items-center justify-center">
            <IconAlertCircle className="w-7 h-7 text-orange" />
          </div>
          <h1 className="font-display font-semibold text-heading text-2xl mb-2">
            Something went wrong
          </h1>
          <p className="font-body font-light text-earth/60 text-sm mb-8">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
          <div className="flex flex-col gap-3">
            <Button as="button" type="button" onClick={reset}>
              Try Again
            </Button>
            <Button href="/" variant="outline">
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
