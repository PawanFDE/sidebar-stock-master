// View - Inventory List Page
import { useState } from "react";
import { useInventoryController } from "@/controllers/useInventoryController";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ItemForm } from "@/components/inventory/ItemForm";
import { InventoryItem } from "@/models/inventory";

export default function InventoryList() {
  const navigate = useNavigate();
  const {
    items,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    updateItem,
    deleteItem,
  } = useInventoryController();

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
  };

  const handleUpdate = (updates: Omit<InventoryItem, 'id' | 'status' | 'lastUpdated'>) => {
    if (editingItem) {
      updateItem(editingItem.id, updates);
      setEditingItem(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage all your inventory items</p>
        </div>
        <Button onClick={() => navigate('/add-item')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <InventoryTable items={items} onEdit={handleEdit} onDelete={deleteItem} />

      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <ItemForm
              item={editingItem}
              categories={categories}
              onSubmit={handleUpdate}
              onCancel={() => setEditingItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
