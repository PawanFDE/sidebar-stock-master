// View Component - Inventory Items Table
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { InventoryItem } from "@/models/inventory";
import { ArrowRightLeft, Pencil, Trash2 } from "lucide-react";

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string, serialNumber?: string) => void;
  onTransaction: (item: InventoryItem) => void;
  onView: (item: InventoryItem) => void;
  onTransferSerial?: (item: InventoryItem, serialNumber: string) => void;
}

export function InventoryTable({ items, onEdit, onDelete, onTransaction, onView, onTransferSerial }: InventoryTableProps) {
  // Flatten items: separate by serial number
  const displayItems = items.flatMap((item) => {
    if (item.serialNumber) {
      const serials = item.serialNumber.split(',').map(s => s.trim()).filter(s => s);
      
      if (serials.length > 0) {
        const rows = serials.map((serial, index) => ({
          ...item,
          // Create a unique ID for the key, but keep original ID for actions
          displayId: `${item.id}-${index}`,
          quantity: 1, // Display as single unit
          serialNumber: serial,
          isSplit: true
        }));

        // If there are more items than serial numbers, add a remainder row
        if (item.quantity > serials.length) {
          rows.push({
            ...item,
            displayId: `${item.id}-remainder`,
            quantity: item.quantity - serials.length,
            serialNumber: '',
            isSplit: true
          });
        }
        return rows;
      }
    }
    // Return original item if no serials
    return [{ ...item, displayId: item.id, isSplit: false }];
  });

  const getStatusBadge = (status: InventoryItem['status']) => {
    const variants = {
      'in-stock': 'default',
      'low-stock': 'warning',
      'out-of-stock': 'destructive',
    } as const;

    const labels = {
      'in-stock': 'In Stock',
      'low-stock': 'Low Stock',
      'out-of-stock': 'Out of Stock',
    };

    return (
      <Badge variant={variants[status]} className="capitalize">
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-muted/50">
            <TableHead>Name</TableHead>
            <TableHead>Serial Number</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Model</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No items found. Add your first inventory item to get started.
              </TableCell>
            </TableRow>
          ) : (
            displayItems.map((item) => (
              <TableRow 
                key={item.displayId} 
                className="hover:bg-muted/30 cursor-pointer"
                onClick={() => onView(item)}
              >
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  {item.serialNumber ? (
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {item.serialNumber}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <span className="font-semibold">{item.quantity}</span>
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.model || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                      className="hover:bg-primary/10 hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (item.isSplit && item.serialNumber && onTransferSerial) {
                          onTransferSerial(item, item.serialNumber);
                        } else {
                          onTransaction(item);
                        }
                      }}
                      className="hover:bg-blue-500/10 hover:text-blue-500"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {item.isSplit && item.serialNumber
                              ? `This will remove the item with serial number "${item.serialNumber}" from the inventory.` 
                              : "This action cannot be undone. This will permanently delete the item."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => {
                            if (item.isSplit && item.serialNumber) {
                              onDelete(item.id, item.serialNumber);
                            } else {
                              onDelete(item.id);
                            }
                          }}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
