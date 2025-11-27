// View - Transferred Items List Page
import { ReturnForm } from "@/components/inventory/ReturnForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInventoryController } from "@/controllers/useInventoryController";
import { InventoryItem } from "@/models/inventory";
import { ArrowLeftRight, Calendar, Hash, MapPin, Package, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface TransferredItemGroup {
  branch: string;
  items: (Pick<InventoryItem, 'id' | 'name' | 'category'> & { 
    quantity: number;
    assetNumber?: string;
    model?: string;
    serialNumber?: string;
    itemTrackingId?: string;
    reason?: string;
    transferDate?: string;
  })[];
}

type SelectedReturnItem = (Pick<InventoryItem, 'id' | 'name'> & { 
  quantity: number;
  itemTrackingId?: string;
});

export default function TransferredItemsList() {
  const { getTransferredItems, createTransaction, loading } = useInventoryController();
  const [groupedItems, setGroupedItems] = useState<TransferredItemGroup[]>([]);
  const [returnItem, setReturnItem] = useState<SelectedReturnItem | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchItems = async () => {
    const items = await getTransferredItems();
    setGroupedItems(items);
  };

  useEffect(() => {
    fetchItems();
  }, [getTransferredItems]);

  const handleOpenReturnDialog = (item: SelectedReturnItem, branch: string) => {
    setReturnItem(item);
    setSelectedBranch(branch);
  };

  const handleCloseReturnDialog = () => {
    setReturnItem(null);
    setSelectedBranch('');
  };

  const handleReturnSubmit = async (transactionData: {
    itemId: string;
    type: 'return';
    quantity: number;
    branch: string;
    itemTrackingId?: string;
  }) => {
    await createTransaction(transactionData);
    handleCloseReturnDialog();
    fetchItems(); // Re-fetch the items to update the list
  };

  const filteredGroupedItems = useMemo(() => {
    if (!searchTerm) {
      return groupedItems;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
    // Filter items within groups first
    const filteredGroups = groupedItems.map(group => {
      // Check if branch name matches
      const branchMatch = group.branch.toLowerCase().includes(lowerCaseSearchTerm);
      
      if (branchMatch) {
        return group; // Return whole group if branch matches
      }

      // Otherwise filter items
      const filteredItems = group.items.filter(item => 
        (item.name && item.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (item.itemTrackingId && item.itemTrackingId.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (item.assetNumber && item.assetNumber.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (item.serialNumber && item.serialNumber.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (item.model && item.model.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (item.category && item.category.toLowerCase().includes(lowerCaseSearchTerm))
      );

      return {
        ...group,
        items: filteredItems
      };
    }).filter(group => group.items.length > 0); // Remove empty groups

    return filteredGroups;
  }, [groupedItems, searchTerm]);

  // Calculate total items for summary
  const totalItems = useMemo(() => {
    return groupedItems.reduce((acc, group) => acc + group.items.reduce((sum, item) => sum + item.quantity, 0), 0);
  }, [groupedItems]);

  const totalBranches = groupedItems.length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Transferred Items</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track items currently located at external branches.
          </p>
        </div>
        <div className="flex gap-4">
           <Card className="p-4 flex items-center gap-4 bg-primary/5 border-primary/20">
             <div className="p-2 bg-primary/10 rounded-full">
               <MapPin className="h-5 w-5 text-primary" />
             </div>
             <div>
               <p className="text-sm font-medium text-muted-foreground">Active Branches</p>
               <h3 className="text-2xl font-bold">{totalBranches}</h3>
             </div>
           </Card>
           <Card className="p-4 flex items-center gap-4 bg-orange-500/5 border-orange-500/20">
             <div className="p-2 bg-orange-500/10 rounded-full">
               <Package className="h-5 w-5 text-orange-600" />
             </div>
             <div>
               <p className="text-sm font-medium text-muted-foreground">Total Items</p>
               <h3 className="text-2xl font-bold text-orange-600">{totalItems}</h3>
             </div>
           </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search items, branches, serials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && groupedItems.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredGroupedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No items found</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                {searchTerm 
                  ? "No items match your search criteria. Try a different search term." 
                  : "No items have been transferred to any branches yet."}
              </p>
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={filteredGroupedItems.map(g => g.branch)} className="space-y-4">
              {filteredGroupedItems.map((group) => (
                <AccordionItem key={group.branch} value={group.branch} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                        <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex flex-col items-start text-left">
                        <span className="font-semibold text-lg">{group.branch}</span>
                        <span className="text-sm text-muted-foreground font-normal">
                          {group.items.reduce((sum, item) => sum + item.quantity, 0)} items in stock
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Item Details</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Identifiers</TableHead>
                            <TableHead>Transfer Date</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.items.map((item) => (
                            <TableRow key={item.id} className="hover:bg-muted/5">
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{item.name}</span>
                                  {item.model && (
                                    <span className="text-xs text-muted-foreground">Model: {item.model}</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="font-normal">
                                  {item.category}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1 text-sm">
                                  {item.itemTrackingId && (
                                    <div className="flex items-center gap-1 text-xs font-mono bg-muted/50 w-fit px-1.5 py-0.5 rounded">
                                      <Hash className="h-3 w-3 text-muted-foreground" />
                                      {item.itemTrackingId}
                                    </div>
                                  )}
                                  {item.serialNumber && (
                                    <div className="text-xs text-muted-foreground">
                                      SN: {item.serialNumber}
                                    </div>
                                  )}
                                  {item.assetNumber && (
                                    <div className="text-xs text-muted-foreground">
                                      Asset: {item.assetNumber}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {item.transferDate ? (
                                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {new Date(item.transferDate).toLocaleDateString()}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-xs">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 border-dashed hover:border-solid hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                                  onClick={() => handleOpenReturnDialog(item, group.branch)}
                                >
                                  <ArrowLeftRight className="h-3.5 w-3.5 mr-1.5" />
                                  Return
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <ReturnForm
        item={returnItem}
        branch={selectedBranch}
        isOpen={!!returnItem}
        onClose={handleCloseReturnDialog}
        onSubmit={handleReturnSubmit}
      />
    </div>
  );
}
