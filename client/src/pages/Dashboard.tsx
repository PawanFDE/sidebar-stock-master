// View - Dashboard Page
import { Package, TrendingDown, DollarSign, FolderOpen } from "lucide-react";
import { StatsCard } from "@/components/inventory/StatsCard";
import { useInventoryController } from "@/controllers/useInventoryController";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { stats, allItems } = useInventoryController();

  const lowStockItems = allItems.filter(
    item => item.status === 'low-stock' || item.status === 'out-of-stock'
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your inventory system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Items"
          value={stats.totalItems.toLocaleString()}
          icon={Package}
          variant="info"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Low Stock Alerts"
          value={stats.lowStockItems}
          icon={TrendingDown}
          variant="warning"
        />
        <StatsCard
          title="Total Value"
          value={`$${stats.totalValue.toLocaleString()}`}
          icon={DollarSign}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Categories"
          value={stats.categories}
          icon={FolderOpen}
          variant="default"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.length === 0 ? (
                <p className="text-muted-foreground text-sm">All items are well stocked!</p>
              ) : (
                lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sku}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold">{item.quantity}</p>
                        <p className="text-xs text-muted-foreground">units</p>
                      </div>
                      <Badge variant={item.status === 'out-of-stock' ? 'destructive' : 'warning'}>
                        {item.status === 'out-of-stock' ? 'Out' : 'Low'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
