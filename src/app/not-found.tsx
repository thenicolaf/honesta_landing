import { SearchX } from "lucide-react";
import { Card, Button } from "@/shared/ui";

export default function NotFound() {
  return (
    <main className="grow min-h-160 bg-cream flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        <Card variant="default" padding="lg" className="text-center">
          <div className="w-16 h-16 rounded-full bg-sand mx-auto mb-6 flex items-center justify-center">
            <SearchX className="w-7 h-7 text-earth/50" />
          </div>
          <h1 className="font-display font-semibold text-heading text-2xl mb-2">
            Page not found
          </h1>
          <p className="font-body font-light text-earth/60 text-sm mb-8">
            The page may have moved, but there is more to discover at HONESTA.
          </p>
          <div className="flex flex-col gap-3">
            <Button href="/shop">Shop all</Button>
            <Button href="/" variant="outline">
              Back to home
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
