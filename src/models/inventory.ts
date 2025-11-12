// Models - Data structures and types

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  price: number;
  supplier: string;
  location: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  lastUpdated: Date;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
}

export interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  totalValue: number;
  categories: number;
}

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export const getStockStatus = (quantity: number, minStock: number): StockStatus => {
  if (quantity === 0) return 'out-of-stock';
  if (quantity <= minStock) return 'low-stock';
  return 'in-stock';
};
