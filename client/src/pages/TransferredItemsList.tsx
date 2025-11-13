// View - Transferred Items List Page
import { useState, useEffect } from "react";
import { useInventoryController } from "@/controllers/useInventoryController";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReturnForm } from "@/components/inventory/ReturnForm";
import { InventoryItem } from "@/models/inventory";
import { ArrowLeftRight } from "lucide-react";

interface TransferredItemGroup {
  branch: string;
  items: (Pick<InventoryItem, 'id' | 'name' | 'sku' | 'category'> & { 
    quantity: number;
    assetNumber?: string;
    model?: string;
    serialNumber?: string;
    itemTrackingId?: string;
    reason?: string;
  })[];
}

type SelectedReturnItem = (Pick<InventoryItem, 'id' | 'name'> & { quantity: number });

export default function TransferredItemsList() {
  const { getTransferredItems, createTransaction, loading } = useInventoryController();
  const [groupedItems, setGroupedItems] = useState<TransferredItemGroup[]>([]);
  const [returnItem, setReturnItem] = useState<SelectedReturnItem | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  const fetchItems = async () => {
    const items = await getTransferredItems();
    // The aggregation pipeline in the backend returns netQuantity, 
    // but for 'transfer' type, we want to show the original quantity and details.
    // This might require further refinement in the backend aggregation or frontend processing
    // to correctly display individual transferred item details.
    // For now, we'll assume the backend provides the necessary details.
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
  }) => {
    await createTransaction(transactionData);
    handleCloseReturnDialog();
    fetchItems(); // Re-fetch the items to update the list
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transferred Items</h1>
        <p className="text-muted-foreground mt-1">
          Overview of all items transferred to different locations.
        </p>
      </div>

      {loading && groupedItems.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-8">
          {groupedItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No items have been transferred yet.
            </p>
          ) : (
            groupedItems.map((group) => (
              <Card key={group.branch}>
                <CardHeader>
                  <CardTitle className="text-xl">{group.branch}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Item Tracking ID</TableHead>
                        <TableHead>Asset Number</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Serial Number</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="font-semibold">
                            {item.quantity}
                          </TableCell>
                          <TableCell>{item.itemTrackingId || 'N/A'}</TableCell>
                          <TableCell>{item.assetNumber || 'N/A'}</TableCell>
                          <TableCell>{item.model || 'N/A'}</TableCell>
                          <TableCell>{item.serialNumber || 'N/A'}</TableCell>
                          <TableCell>{item.reason || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenReturnDialog(item, group.branch)}
                            >
                              <ArrowLeftRight className="h-4 w-4 mr-2" />
                              Transfer Back
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

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
