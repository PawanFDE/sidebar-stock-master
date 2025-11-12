// View Component - Inventory Items Table
import { InventoryItem } from "@/models/inventory";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

export function InventoryTable({ items, onEdit, onDelete }: InventoryTableProps) {
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
            <TableHead>SKU</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No items found. Add your first inventory item to get started.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/30">
                <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <span className="font-semibold">{item.quantity}</span>
                  <span className="text-muted-foreground text-sm ml-1">/ {item.maxStock}</span>
                </TableCell>
                <TableCell>${item.price.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.location}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
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
                      onClick={() => onDelete(item.id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
