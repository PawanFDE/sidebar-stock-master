// View - Dashboard Page
import { StatsCard } from "@/components/inventory/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventoryController } from "@/controllers/useInventoryController";
import { FolderOpen, Package, TrendingDown, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { stats, allItems } = useInventoryController();
  const [subAdminCount, setSubAdminCount] = useState<number>(0);

  // Get user info from localStorage to check role
  const userInfoString = localStorage.getItem("userInfo");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const userRole = userInfo?.role;

  // Fetch sub-admin count for superadmin
  useEffect(() => {
    const fetchSubAdminCount = async () => {
      if (userRole === "superadmin") {
        try {
          const token = userInfo?.token;
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/users/subadmin-count`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            setSubAdminCount(data.count);
          }
        } catch (error) {
          console.error("Error fetching sub-admin count:", error);
        }
      }
    };
    fetchSubAdminCount();
  }, [userRole, userInfo?.token]);

  const lowStockItems = allItems
    .filter(
      (item) => item.status === "low-stock" || item.status === "out-of-stock"
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your inventory system
        </p>
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
          title="Categories"
          value={stats.categories}
          icon={FolderOpen}
          variant="default"
        />
        {userRole === "superadmin" && (
          <StatsCard
            title="Sub Admins"
            value={subAdminCount}
            icon={Users}
            variant="info"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Category Alerts */}
              {Object.entries(allItems.reduce((acc, item) => {
                const cat = item.category || 'Uncategorized';
                acc[cat] = (acc[cat] || 0) + item.quantity;
                return acc;
              }, {} as Record<string, number>))
              .filter(([_, total]) => total <= 3)
              .map(([category, total]) => (
                <div
                  key={`cat-${category}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-destructive" />
                      <p className="font-medium text-sm text-destructive">Category: {category}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Critical category stock level</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-destructive">{total}</p>
                      <p className="text-xs text-destructive/80">total units</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Item Alerts */}
              {lowStockItems.length === 0 && Object.entries(allItems.reduce((acc, item) => {
                  const cat = item.category || 'Uncategorized';
                  acc[cat] = (acc[cat] || 0) + item.quantity;
                  return acc;
                }, {} as Record<string, number>)).filter(([_, total]) => total <= 3).length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  All items are well stocked!
                </p>
              ) : (
                lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Category: {item.category}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold">{item.quantity}</p>
                        <p className="text-xs text-muted-foreground">units</p>
                      </div>
                      <Badge
                        variant={
                          item.status === "out-of-stock"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {item.status === "out-of-stock" ? "Out" : "Low"}
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
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated{" "}
                      {item.lastUpdated
                        ? new Date(item.lastUpdated).toLocaleDateString()
                        : "N/A"}
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
