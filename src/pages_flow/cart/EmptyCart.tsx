import { EmptyState } from "@/shared/ui";
import { ShoppingBag } from "lucide-react";

export function EmptyCart() {
  return (
    <main className="grow min-h-160 bg-cream flex items-center justify-center px-4 py-16">
      <EmptyState
        icon={<ShoppingBag className="w-10 h-10 text-earth/15" />}
        label="Your cart is empty"
        description="Add some products to get started."
        action={{ label: "Browse Products", href: "/#products" }}
      />
    </main>
  );
}
