import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { InventoryItem, Category, DashboardStats } from '../models/inventory';
import { useToast } from '../components/ui/use-toast'; // Assuming this is the correct path

// Utility for API calls
async function api(endpoint: string, method: string = 'GET', data?: any) {
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Something went wrong');
  }

  return response.json();
}

export const useInventoryController = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchItemsAndCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsData, categoriesData] = await Promise.all([
        api('/inventory'), // GET /api/inventory
        api('/categories'), // GET /api/categories
      ]);
      setItems(itemsData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error fetching data',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItemsAndCategories();
  }, [fetchItemsAndCategories]);

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
  const addItem = useCallback(async (item: Omit<InventoryItem, 'id' | 'status' | 'lastUpdated'>) => {
    try {
      const newItem = await api('/inventory', 'POST', item); // POST /api/inventory
      setItems(prev => [...prev, newItem]);
      toast({
        title: 'Item added',
        description: `${newItem.name} has been added to inventory.`,
      });
      // Re-fetch all data to update categories and ensure data consistency
      fetchItemsAndCategories();
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error adding item',
        description: err.message,
        variant: 'destructive',
      });
    }
  }, [fetchItemsAndCategories]);

  // Update item
  const updateItem = useCallback(async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const updatedItem = await api(`/inventory/${id}`, 'PUT', updates); // PUT /api/inventory/:id
      setItems(prev => prev.map(item => (item.id === id ? updatedItem : item)));
      toast({
        title: 'Item updated',
        description: 'Inventory item has been updated successfully.',
      });
      // Re-fetch all data to update categories and ensure data consistency
      fetchItemsAndCategories();
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error updating item',
        description: err.message,
        variant: 'destructive',
      });
    }
  }, [fetchItemsAndCategories]);

  // Delete item
  const deleteItem = useCallback(async (id: string) => {
    try {
      const itemToDelete = items.find(i => i.id === id);
      await api(`/inventory/${id}`, 'DELETE'); // DELETE /api/inventory/:id
      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Item deleted',
        description: `${itemToDelete?.name} has been removed from inventory.`,
        variant: 'destructive',
      });
      // Re-fetch all data to update categories and ensure data consistency
      fetchItemsAndCategories();
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error deleting item',
        description: err.message,
        variant: 'destructive',
      });
    }
  }, [items, fetchItemsAndCategories]);

  // Add new category
  const addCategory = useCallback(async (categoryName: string) => {
    try {
      const newCategory = await api('/categories', 'POST', { name: categoryName }); // POST /api/categories
      setCategories(prev => [...prev, newCategory]);
      toast({
        title: 'Category added',
        description: `${newCategory.name} has been added as a new category.`,
      });
      return newCategory;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error adding category',
        description: err.message,
        variant: 'destructive',
      });
      throw err;
    }
  }, []);

  // Delete category
  const deleteCategory = useCallback(async (id: string) => {
    try {
      const categoryToDelete = categories.find(c => c.id === id);
      await api(`/categories/${id}`, 'DELETE'); // DELETE /api/categories/:id
      setCategories(prev => prev.filter(category => category.id !== id));
      toast({
        title: 'Category deleted',
        description: `${categoryToDelete?.name} has been removed.`,
        variant: 'destructive',
      });
      // Re-fetch all data to update categories and ensure data consistency
      fetchItemsAndCategories();
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error deleting category',
        description: err.message,
        variant: 'destructive',
      });
    }
  }, [categories, fetchItemsAndCategories]);

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
    addCategory,
    deleteCategory,
    loading,
    error,
  };
};
