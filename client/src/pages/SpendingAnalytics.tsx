// Spending Analytics Page - Modern Dashboard UI
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInventoryController } from "@/controllers/useInventoryController";
import { ArrowLeft, BarChart3, Calendar, DollarSign, PieChart, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SpendingAnalytics() {
  const { allItems, categories } = useInventoryController();
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [viewMode, setViewMode] = useState<'overview' | 'categories' | 'timeline'>('overview');

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
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const categorySpending: Record<string, Record<string, number>> = {};
    const monthlyTotals: Record<string, number> = {};

    // Initialize structures
    categories.forEach(cat => {
      categorySpending[cat.name] = {};
      months.forEach(month => {
        categorySpending[cat.name][month] = 0;
      });
    });

    months.forEach(month => {
      monthlyTotals[month] = 0;
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
          monthlyTotals[monthName] += totalPrice;
        }
      }
    });

    return { categorySpending, months, monthlyTotals };
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

  // Calculate statistics
  const stats = useMemo(() => {
    const monthlyAmounts = Object.values(monthlySpendingByCategory.monthlyTotals).filter(amt => amt > 0);
    const avgMonthly = monthlyAmounts.length > 0 
      ? monthlyAmounts.reduce((sum, amt) => sum + amt, 0) / monthlyAmounts.length 
      : 0;
    
    const maxMonth = Object.entries(monthlySpendingByCategory.monthlyTotals)
      .reduce((max, [month, amount]) => amount > max.amount ? { month, amount } : max, { month: '', amount: 0 });
    
    const minMonth = Object.entries(monthlySpendingByCategory.monthlyTotals)
      .filter(([_, amount]) => amount > 0)
      .reduce((min, [month, amount]) => amount < min.amount ? { month, amount } : min, { month: '', amount: Infinity });

    return {
      avgMonthly,
      maxMonth,
      minMonth: minMonth.amount === Infinity ? { month: '', amount: 0 } : minMonth,
      activeMonths: monthlyAmounts.length
    };
  }, [monthlySpendingByCategory]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getColorForIndex = (index: number) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 
      'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-background to-muted/20 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Spending Analytics
            </h1>
            <p className="text-muted-foreground mt-1">Comprehensive financial insights for your inventory</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spending */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spending</CardTitle>
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalYearlySpending)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {categoryYearlyTotals.length} categories
            </p>
          </CardContent>
        </Card>

        {/* Average Monthly */}
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-background hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Monthly</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-full">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.avgMonthly)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeMonths} active months
            </p>
          </CardContent>
        </Card>

        {/* Highest Month */}
        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 via-green-500/5 to-background hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Highest Month</CardTitle>
              <div className="p-2 bg-green-500/10 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.maxMonth.amount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.maxMonth.month || 'N/A'}
            </p>
          </CardContent>
        </Card>

        {/* Lowest Month */}
        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-background hover:shadow-lg transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lowest Month</CardTitle>
              <div className="p-2 bg-orange-500/10 rounded-full">
                <TrendingDown className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.minMonth.amount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.minMonth.month || 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <PieChart className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Category Distribution
                </CardTitle>
                <CardDescription>Spending breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryYearlyTotals.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No spending data for {selectedYear}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categoryYearlyTotals.slice(0, 6).map(([category, total], index) => {
                      const percentage = (total / totalYearlySpending) * 100;
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getColorForIndex(index)}`} />
                              <span className="font-medium text-sm">{category}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-sm">{formatCurrency(total)}</div>
                              <Badge variant="outline" className="text-xs">{percentage.toFixed(1)}%</Badge>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${getColorForIndex(index)}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Monthly Trend
                </CardTitle>
                <CardDescription>Spending pattern throughout {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {monthlySpendingByCategory.months.map((month) => {
                    const amount = monthlySpendingByCategory.monthlyTotals[month] || 0;
                    const maxAmount = Math.max(...Object.values(monthlySpendingByCategory.monthlyTotals));
                    const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                    
                    return (
                      <div key={month} className="flex items-center gap-3">
                        <div className="w-12 text-xs font-medium text-muted-foreground">{month}</div>
                        <div className="flex-1">
                          <div className="w-full bg-muted rounded-full h-6 relative overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-primary to-primary/60 h-6 rounded-full transition-all flex items-center justify-end pr-2"
                              style={{ width: `${percentage}%` }}
                            >
                              {amount > 0 && (
                                <span className="text-xs font-bold text-white">
                                  {formatCurrency(amount)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Category Analysis</CardTitle>
              <CardDescription>Monthly breakdown for each category in {selectedYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryYearlyTotals.map(([category, yearTotal], catIndex) => {
                  const monthsData = monthlySpendingByCategory.months
                    .map(month => ({
                      month,
                      amount: monthlySpendingByCategory.categorySpending[category]?.[month] || 0
                    }))
                    .filter(item => item.amount > 0)
                    .sort((a, b) => b.amount - a.amount);

                  if (monthsData.length === 0) return null;

                  return (
                    <Card key={category} className="border-2 hover:shadow-lg transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getColorForIndex(catIndex)}`} />
                          <CardTitle className="text-lg">{category}</CardTitle>
                        </div>
                        <div className="text-2xl font-bold text-primary">{formatCurrency(yearTotal)}</div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {monthsData.map((item, index) => {
                            const percentage = (item.amount / yearTotal) * 100;
                            return (
                              <div key={item.month} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Badge variant={index === 0 ? "default" : "outline"} className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                                    {index + 1}
                                  </Badge>
                                  <span className="font-medium">{item.month}</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold">{formatCurrency(item.amount)}</div>
                                  <div className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Month-by-Month Timeline</CardTitle>
              <CardDescription>Chronological view of spending in {selectedYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {monthlySpendingByCategory.months.map((month, index) => {
                  const monthTotal = monthlySpendingByCategory.monthlyTotals[month] || 0;
                  if (monthTotal === 0) return null;

                  const categoriesInMonth = Object.entries(monthlySpendingByCategory.categorySpending)
                    .map(([cat, months]) => ({
                      category: cat,
                      amount: months[month] || 0
                    }))
                    .filter(item => item.amount > 0)
                    .sort((a, b) => b.amount - a.amount);

                  return (
                    <div key={month} className="border-l-4 border-primary pl-4 pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold">{month}</h3>
                          <p className="text-sm text-muted-foreground">{categoriesInMonth.length} categories</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-primary">{formatCurrency(monthTotal)}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {categoriesInMonth.map((item, catIndex) => {
                          const percentage = (item.amount / monthTotal) * 100;
                          return (
                            <div key={item.category} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getColorForIndex(catIndex)}`} />
                                <span className="text-sm font-medium">{item.category}</span>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
