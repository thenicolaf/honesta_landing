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
};
