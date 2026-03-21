import { SearchX } from "lucide-react";
import { Card, Button } from "@/shared/ui";
import { GoBackButton } from "./_components/GoBackButton";

export default function NotFound() {
  return (
    <main className="grow min-h-160 bg-cream flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        <Card variant="default" padding="lg" className="text-center">
          <div className="w-16 h-16 rounded-full bg-sand mx-auto mb-6 flex items-center justify-center">
            <SearchX className="w-7 h-7 text-earth/50" />
          </div>
          <h1 className="font-display font-semibold text-heading text-2xl mb-2">
            Page Not Found
          </h1>
          <p className="font-body font-light text-earth/60 text-sm mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col gap-3">
            <Button href="/">Back to Home</Button>
            <GoBackButton />
          </div>
        </Card>
      </div>
    </main>
  );
}
