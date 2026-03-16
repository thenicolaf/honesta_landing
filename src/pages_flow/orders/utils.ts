import type { Order } from "./types";

export function formatDateHeading(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function groupByDate<T extends Order>(orders: T[]): [string, T[]][] {
  const map = new Map<string, T[]>();
  for (const order of orders) {
    const key = new Date(order.created_at).toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(order);
  }
  return Array.from(map.entries()).map(([, group]) => [
    formatDateHeading(group[0].created_at),
    group,
  ]);
}
