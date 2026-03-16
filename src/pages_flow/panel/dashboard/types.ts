export type ProductSales = {
  name: string;
  quantity: number;
  revenue: number;
};

export type DashboardStats = {
  orders: {
    total: number;
    revenue: number;
    avgOrderValue: number;
    totalDelivery: number;
    byStatus: Record<string, number>;
    productSales: ProductSales[];
  };
  products: {
    total: number;
    published: number;
    draft: number;
    archived: number;
    outOfStock: number;
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
