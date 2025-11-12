// View - Add Item Page
import { useNavigate } from "react-router-dom";
import { useInventoryController } from "@/controllers/useInventoryController";
import { ItemForm } from "@/components/inventory/ItemForm";
import { InventoryItem } from "@/models/inventory";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AddItem() {
  const navigate = useNavigate();
  const { categories, addItem } = useInventoryController();

  const handleSubmit = (item: Omit<InventoryItem, 'id' | 'status' | 'lastUpdated'>) => {
    addItem(item);
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
        categories={categories.map(c => c.name)}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/inventory')}
      />
    </div>
  );
}
