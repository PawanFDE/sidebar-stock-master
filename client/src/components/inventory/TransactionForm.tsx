// View Component - In/Out Transaction Form
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InventoryItem } from "@/models/inventory";
import { useEffect, useState } from "react";
import branchesData from "../../fed_branches.json";

interface TransactionFormProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  initialSerialNumber?: string;
  onSubmit: (transactionData: {
    itemId: string;
    type: "in" | "out" | "transfer";
    quantity: number;
    branch?: string;
    assetNumber?: string;
    model?: string;
    serialNumber?: string;
    itemTrackingId?: string;
    reason?: string;
  }) => void;
}

export function TransactionForm({
  item,
  isOpen,
  onClose,
  initialSerialNumber,
  onSubmit,
}: TransactionFormProps) {

  const [quantity, setQuantity] = useState(1);
  const [branch, setBranch] = useState("");
  const [assetNumber, setAssetNumber] = useState("");
  const [model, setModel] = useState(item?.model || ""); // Initialize with item.model
  const [serialNumber, setSerialNumber] = useState(initialSerialNumber || "");
  const [itemTrackingId, setItemTrackingId] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (item) {
      setModel(item.model || "");
    }
    if (initialSerialNumber) {
      setSerialNumber(initialSerialNumber);
      // If a specific serial number is provided, we likely want to transfer just that 1 item
      setQuantity(1);
    }
  }, [item, initialSerialNumber, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    // Always submit as transfer
    onSubmit({
      itemId: item.id,
      type: "transfer",
      quantity,
      branch,
      assetNumber: assetNumber || undefined,
      model: model || undefined,
      serialNumber: serialNumber || undefined,
      itemTrackingId,
      reason: reason || undefined,
    });
  };

  const handleClose = () => {
    setQuantity(1);
    setBranch("");
    setAssetNumber("");
    setModel("");
    setSerialNumber("");
    setItemTrackingId("");
    setReason("");
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {/* WIDTH UPDATED HERE */}
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto p-4">
        <DialogHeader>
          <DialogTitle>
            Transfer Item for {item.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type Select Removed - Defaulting to Transfer */}

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              min="1"
              max={item.quantity}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Select
              value={branch}
              onValueChange={(value) => setBranch(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a branch" />
              </SelectTrigger>
              <SelectContent>
                {branchesData.fed_branches.map((branchName) => (
                  <SelectItem key={branchName} value={branchName}>
                    {branchName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
              disabled={!!initialSerialNumber}
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Transfer Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
