// View - Add Item Page
import { ItemForm } from "@/components/inventory/ItemForm";
import { Button } from "@/components/ui/button";
import { useInventoryController } from "@/controllers/useInventoryController";
import { InventoryItem } from "@/models/inventory";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AddItem() {
  const navigate = useNavigate();
  const { categories, addItem } = useInventoryController();

  const handleSubmit = async (item: Omit<InventoryItem, 'id' | 'status' | 'lastUpdated'>) => {
    await addItem(item);
    navigate('/inventory');
  };

  const handleSubmitMultiple = async (items: Omit<InventoryItem, 'id' | 'status' | 'lastUpdated'>[]) => {
    // Add all items without navigating
    for (const item of items) {
      await addItem(item);
    }
    // Navigate only after all items are added
    navigate('/inventory');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Item</h1>
          <p className="text-muted-foreground mt-1">Add a new item to your inventory</p>
        </div>
      </div>

      <ItemForm
        categories={categories}
        onSubmit={handleSubmit}
        onSubmitMultiple={handleSubmitMultiple}
        onCancel={() => navigate('/inventory')}
      />
    </div>
  );
}
