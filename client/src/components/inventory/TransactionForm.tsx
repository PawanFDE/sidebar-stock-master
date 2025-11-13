// View Component - In/Out Transaction Form
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { InventoryItem } from "@/models/inventory";

interface TransactionFormProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transactionData: {
    itemId: string;
    type: 'in' | 'out';
    quantity: number;
    branch?: string;
  }) => void;
}

export function TransactionForm({ item, isOpen, onClose, onSubmit }: TransactionFormProps) {
  const [type, setType] = useState<'in' | 'out'>('out');
  const [quantity, setQuantity] = useState(1);
  const [branch, setBranch] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    onSubmit({
      itemId: item.id,
      type,
      quantity,
      branch: type === 'out' ? branch : undefined,
    });
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === 'in' ? 'Add Stock (In)' : 'Transfer Stock (Out)'} for {item.name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select value={type} onValueChange={(value: 'in' | 'out') => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="out">Transfer Out</SelectItem>
                <SelectItem value="in">Add Stock In</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              min="1"
              max={type === 'out' ? item.quantity : undefined}
              required
            />
          </div>

          {type === 'out' && (
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g., Downtown Branch"
                required
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {type === 'out' ? 'Transfer' : 'Add Stock'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
