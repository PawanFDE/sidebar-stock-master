// View - Categories Page
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventoryController } from "@/controllers/useInventoryController";
import { FolderOpen } from "lucide-react";
import { useState } from "react";

export default function Categories() {
  const { categories, allItems, addCategory } = useInventoryController();
  const [newCategoryName, setNewCategoryName] = useState("");

  const categoriesWithCount = categories.map(cat => ({
    ...cat,
    itemCount: allItems.filter(item => item.category === cat.name).length,
  }));

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Categories</h1>
        <p className="text-muted-foreground mt-1">Browse inventory by category</p>
      </div>

      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name"
            className="flex-grow px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Add Category
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoriesWithCount.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FolderOpen className="h-5 w-5 text-primary" />
                  </div>
                  {category.name}
                </CardTitle>
                <Badge variant="secondary">{category.itemCount} items</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {category.description || 'No description available'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
