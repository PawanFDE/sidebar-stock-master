// View - Categories Page
import { useInventoryController } from "@/controllers/useInventoryController";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen } from "lucide-react";

export default function Categories() {
  const { categories, allItems } = useInventoryController();

  const categoriesWithCount = categories.map(cat => ({
    ...cat,
    itemCount: allItems.filter(item => item.category === cat.name).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Categories</h1>
        <p className="text-muted-foreground mt-1">Browse inventory by category</p>
      </div>

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
