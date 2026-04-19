import type { MixCompositionEntry } from "@/lib/orders";

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  promo_discount: number;
  quantity: number;
  mix_composition: MixCompositionEntry[] | null;
};

export type Order = {
  id: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  promotion_discount: number;
  promo_code_id: string | null;
  promo_discount: number;
  promo_code?: { code: string } | null;
  address: string;
  created_at: string;
  order_items: OrderItem[];
};

export type AdminOrder = Order & {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  notes: string | null;
  gender: string | null;
  birthday: string | null;
  is_fulfilled: boolean;
};
