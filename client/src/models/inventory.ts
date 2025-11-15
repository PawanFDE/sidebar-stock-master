// Models - Data structures and types

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock?: number;
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
}

export interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  categories: number;
}

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export const getStockStatus = (quantity: number, minStock: number): StockStatus => {
  if (quantity === 0) return 'out-of-stock';
  if (quantity <= minStock) return 'low-stock';
  return 'in-stock';
};
