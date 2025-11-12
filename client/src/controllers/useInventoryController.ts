// Controller - Business logic and state management
import { useState, useCallback, useMemo } from 'react';
import { InventoryItem, getStockStatus, DashboardStats, Category } from '@/models/inventory';
import { toast } from '@/hooks/use-toast';

// Mock data for initial state
const mockCategories: Category[] = [
  { id: '1', name: 'Electronics', description: 'Electronic devices and components', itemCount: 0 },
  { id: '2', name: 'Furniture', description: 'Office and home furniture', itemCount: 0 },
  { id: '3', name: 'Supplies', description: 'Office supplies and materials', itemCount: 0 },
  { id: '4', name: 'Tools', description: 'Hardware and tools', itemCount: 0 },
];

const mockItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Laptop Dell XPS 15',
    sku: 'ELEC-001',
    category: 'Electronics',
    quantity: 45,
    minStock: 10,
    maxStock: 100,
    price: 1299.99,
    supplier: 'Tech Distributors Inc.',
    location: 'Warehouse A, Shelf 12',
    status: 'in-stock',
    lastUpdated: new Date(),
    description: 'High-performance laptop for business use',
  },
  {
    id: '2',
    name: 'Office Chair Ergonomic',
    sku: 'FURN-023',
    category: 'Furniture',
    quantity: 8,
    minStock: 15,
    maxStock: 50,
    price: 299.99,
    supplier: 'Office Furniture Co.',
    location: 'Warehouse B, Section 3',
    status: 'low-stock',
    lastUpdated: new Date(),
    description: 'Comfortable ergonomic office chair',
  },
  {
    id: '3',
    name: 'Printer Paper A4',
    sku: 'SUPP-105',
    category: 'Supplies',
    quantity: 0,
    minStock: 50,
    maxStock: 500,
    price: 4.99,
    supplier: 'Paper World',
    location: 'Warehouse A, Shelf 5',
    status: 'out-of-stock',
    lastUpdated: new Date(),
    description: 'Standard A4 printer paper, 500 sheets per ream',
  },
  {
    id: '4',
    name: 'Wireless Mouse',
    sku: 'ELEC-045',
    category: 'Electronics',
    quantity: 120,
    minStock: 30,
    maxStock: 200,
    price: 24.99,
    supplier: 'Tech Distributors Inc.',
    location: 'Warehouse A, Shelf 15',
    status: 'in-stock',
    lastUpdated: new Date(),
    description: 'Ergonomic wireless mouse with USB receiver',
  },
  {
    id: '5',
    name: 'Standing Desk',
    sku: 'FURN-087',
    category: 'Furniture',
    quantity: 12,
    minStock: 5,
    maxStock: 30,
    price: 549.99,
    supplier: 'Office Furniture Co.',
    location: 'Warehouse B, Section 1',
    status: 'in-stock',
    lastUpdated: new Date(),
    description: 'Adjustable height standing desk',
  },
];

export const useInventoryController = () => {
  const [items, setItems] = useState<InventoryItem[]>(mockItems);
  const [categories] = useState<Category[]>(mockCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filtered items based on search and category
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'all' || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, selectedCategory]);

  // Dashboard statistics
  const stats: DashboardStats = useMemo(() => {
    return {
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      lowStockItems: items.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length,
      totalValue: items.reduce((sum, item) => sum + (item.quantity * item.price), 0),
      categories: categories.length,
    };
  }, [items, categories]);

  // Add new item
  const addItem = useCallback((item: Omit<InventoryItem, 'id' | 'status' | 'lastUpdated'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      status: getStockStatus(item.quantity, item.minStock),
      lastUpdated: new Date(),
    };
    
    setItems(prev => [...prev, newItem]);
    toast({
      title: 'Item added',
      description: `${newItem.name} has been added to inventory.`,
    });
  }, []);

  // Update item
  const updateItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates, lastUpdated: new Date() };
        if (updates.quantity !== undefined || updates.minStock !== undefined) {
          updated.status = getStockStatus(
            updates.quantity ?? item.quantity,
            updates.minStock ?? item.minStock
          );
        }
        return updated;
      }
      return item;
    }));
    toast({
      title: 'Item updated',
      description: 'Inventory item has been updated successfully.',
    });
  }, []);

  // Delete item
  const deleteItem = useCallback((id: string) => {
    const item = items.find(i => i.id === id);
    setItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: 'Item deleted',
      description: `${item?.name} has been removed from inventory.`,
      variant: 'destructive',
    });
  }, [items]);

  return {
    items: filteredItems,
    allItems: items,
    categories,
    stats,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    addItem,
    updateItem,
    deleteItem,
  };
};
