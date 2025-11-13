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
    type: 'in' | 'out' | 'transfer';
    quantity: number;
    branch?: string;
    assetNumber?: string;
    model?: string;
    serialNumber?: string;
    itemTrackingId?: string;
    reason?: string;
  }) => void;
}

export function TransactionForm({ item, isOpen, onClose, onSubmit }: TransactionFormProps) {
  const [type, setType] = useState<'in' | 'out' | 'transfer'>('out');
  const [quantity, setQuantity] = useState(1);
  const [branch, setBranch] = useState('');
  const [assetNumber, setAssetNumber] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [itemTrackingId, setItemTrackingId] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    const baseData = {
      itemId: item.id,
      type,
      quantity,
      branch: (type === 'out' || type === 'transfer') ? branch : undefined,
    };

    if (type === 'transfer') {
      onSubmit({
        ...baseData,
        assetNumber: assetNumber || undefined,
        model: model || undefined,
        serialNumber: serialNumber || undefined,
        itemTrackingId,
        reason: reason || undefined,
      });
    } else {
      onSubmit(baseData);
    }
  };

  const handleClose = () => {
    setType('out');
    setQuantity(1);
    setBranch('');
    setAssetNumber('');
    setModel('');
    setSerialNumber('');
    setItemTrackingId('');
    setReason('');
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-4">
        <DialogHeader>
          <DialogTitle>
            {type === 'in' ? 'Add Stock (In)' : type === 'out' ? 'Transfer Stock (Out)' : 'Transfer Item'} for {item.name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select value={type} onValueChange={(value: 'in' | 'out' | 'transfer') => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="out">Transfer Out (Simple)</SelectItem>
                <SelectItem value="transfer">Transfer (Detailed)</SelectItem>
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
              max={type === 'in' ? undefined : item.quantity}
              required
            />
          </div>

          {(type === 'out' || type === 'transfer') && (
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

          {type === 'transfer' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="itemTrackingId">Item Tracking ID</Label>
                <Input
                  id="itemTrackingId"
                  value={itemTrackingId}
                  onChange={(e) => setItemTrackingId(e.target.value)}
                  placeholder="Required for detailed transfer"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assetNumber">Asset Number (Optional)</Label>
                <Input
                  id="assetNumber"
                  value={assetNumber}
                  onChange={(e) => setAssetNumber(e.target.value)}
                  placeholder="e.g., AN12345"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model (Optional)</Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g., XYZ-Pro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number (Optional)</Label>
                <Input
                  id="serialNumber"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g., SN98765"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Branch relocation"
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {type === 'in' ? 'Add Stock' : type === 'out' ? 'Transfer Out' : 'Transfer Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
