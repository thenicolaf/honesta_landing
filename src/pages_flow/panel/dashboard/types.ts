export type ProductSales = {
  name: string;
  weight_g: number;
  quantity: number;
  revenue: number;
};

export type MixPresetSales = {
  name: string;
  image_url: string | null;
  weight_g: number;
  count: number;
  revenue: number;
};

export type MixSales = {
  name: string;
  quantity: number;
  revenue: number;
  presets: MixPresetSales[];
};

export type DashboardStats = {
  orders: {
    total: number;
    revenue: number;
    avgOrderValue: number;
    totalDelivery: number;
    byStatus: Record<string, number>;
    productSales: ProductSales[];
    mixSales: MixSales[];
  };
  products: {
    total: number;
    published: number;
    draft: number;
    archived: number;
    outOfStock: number;
    bestSellers: number;
    newProducts: number;
    onPromotion: number;
  };
  categories: {
    total: number;
  };
  partnerships: {
    total: number;
  };
  users: {
    total: number;
  };
  activePromotions: {
    id: string;
    name: string;
    discount_type: string;
    discount_value: number;
    ends_at: string;
    product_count: number;
  }[];
};
