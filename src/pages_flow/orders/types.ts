export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
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
