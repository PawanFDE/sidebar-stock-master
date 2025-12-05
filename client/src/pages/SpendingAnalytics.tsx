// Spending Analytics Page
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInventoryController } from "@/controllers/useInventoryController";
import { ArrowLeft, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SpendingAnalytics() {
  const { allItems, categories } = useInventoryController();
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Get available years from items
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    allItems.forEach(item => {
      if (item.createdAt) {
        years.add(new Date(item.createdAt).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [allItems]);

  // Calculate monthly spending by category
  const monthlySpendingByCategory = useMemo(() => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const categorySpending: Record<string, Record<string, number>> = {};

    // Initialize structure
    categories.forEach(cat => {
      categorySpending[cat.name] = {};
      months.forEach(month => {
        categorySpending[cat.name][month] = 0;
      });
    });

    // Calculate spending
    allItems.forEach(item => {
      if (item.createdAt && item.price) {
        const itemDate = new Date(item.createdAt);
        const itemYear = itemDate.getFullYear();
        
        if (itemYear.toString() === selectedYear) {
          const monthName = months[itemDate.getMonth()];
          const category = item.category || "Uncategorized";
          
          if (!categorySpending[category]) {
            categorySpending[category] = {};
            months.forEach(month => {
              categorySpending[category][month] = 0;
            });
          }
          
          const totalPrice = (item.price || 0) * (item.quantity || 1);
          categorySpending[category][monthName] += totalPrice;
        }
      }
    });

    return { categorySpending, months };
  }, [allItems, categories, selectedYear]);

  // Calculate category totals for the year
  const categoryYearlyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    Object.entries(monthlySpendingByCategory.categorySpending).forEach(([category, monthData]) => {
      totals[category] = Object.values(monthData).reduce((sum, val) => sum + val, 0);
    });

    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, total]) => total > 0);
  }, [monthlySpendingByCategory]);

  const totalYearlySpending = useMemo(() => {
    return categoryYearlyTotals.reduce((sum, [_, total]) => sum + total, 0);
  }, [categoryYearlyTotals]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Spending Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your inventory spending by category and month</p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Yearly Summary */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Total Spending {selectedYear}
          </CardTitle>
          <CardDescription>Total amount spent on inventory items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">
            {formatCurrency(totalYearlySpending)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Across {categoryYearlyTotals.length} categories
          </p>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Spending by Category
          </CardTitle>
          <CardDescription>Annual spending breakdown for {selectedYear}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryYearlyTotals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No spending data available for {selectedYear}
              </div>
            ) : (
              categoryYearlyTotals.map(([category, total]) => {
                const percentage = (total / totalYearlySpending) * 100;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category}</span>
                        <Badge variant="outline">{percentage.toFixed(1)}%</Badge>
                      </div>
                      <span className="text-lg font-bold">{formatCurrency(total)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Spending Months by Category */}
      {categoryYearlyTotals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending by Category</CardTitle>
            <CardDescription>All months with spending for each category in {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryYearlyTotals.map(([category, yearTotal]) => {
                // Get all months with spending for this category
                const monthsData = monthlySpendingByCategory.months
                  .map(month => ({
                    month,
                    amount: monthlySpendingByCategory.categorySpending[category]?.[month] || 0
                  }))
                  .filter(item => item.amount > 0)
                  .sort((a, b) => b.amount - a.amount); // All months, sorted by amount

                if (monthsData.length === 0) return null;

                return (
                  <div key={category} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg mb-3 text-primary">{category}</h3>
                    <div className="space-y-2">
                      {monthsData.map((item, index) => {
                        const percentage = (item.amount / yearTotal) * 100;
                        return (
                          <div key={item.month} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0 ? 'bg-yellow-500 text-white' :
                                index === 1 ? 'bg-gray-400 text-white' :
                                'bg-orange-600 text-white'
                              }`}>
                                {index + 1}
                              </div>
                              <span className="text-sm font-medium">{item.month}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold">{formatCurrency(item.amount)}</div>
                              <div className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
