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
import { ArrowRightLeft, Barcode, Building2, FileText, Hash, MessageSquare, Tag } from "lucide-react";
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
  const [assetNumber, setAssetNumber] = useState("FDE/IT/");
  const [model, setModel] = useState(item?.model || ""); // Initialize with item.model
  const [serialNumber, setSerialNumber] = useState(initialSerialNumber || "");
  const [itemTrackingId, setItemTrackingId] = useState("CRE");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

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

    let finalReason = reason;
    if (reason === "Replacement Equipment" && note) {
      finalReason = `${reason} - ${note}`;
    }

    if (itemTrackingId === "CRE") {
      // Show error if user hasn't entered an ID
      // We can rely on HTML5 validation if we set it to empty string, but here we want to keep "CRE" visible.
      // So we'll just let the backend handle it or show a toast? 
      // Actually, let's just send it. The backend will validate it starts with CRE.
      // But wait, the backend also checks if it exists.
      // If we send "CRE", it exists.
      // But "CRE" is not a valid ID.
      // Let's alert the user.
      alert("Please enter a valid Item Tracking ID (e.g., CRE123).");
      return;
    }

    // Always submit as transfer
    onSubmit({
      itemId: item.id,
      type: "transfer",
      quantity,
      branch,
      assetNumber: assetNumber === "FDE/IT/" ? undefined : assetNumber,
      model: model || undefined,
      serialNumber: serialNumber || undefined,
      itemTrackingId: itemTrackingId,
      reason: finalReason || undefined,
    });
  };

  const handleClose = () => {
    setQuantity(1);
    setBranch("");
    setAssetNumber("FDE/IT/");
    setModel("");
    setSerialNumber("");
    setItemTrackingId("CRE");
    setReason("");
    setNote("");
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b bg-muted/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <ArrowRightLeft className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Transfer Item</DialogTitle>
              <p className="text-sm text-muted-foreground">Move inventory to a different branch</p>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-4 p-3 bg-card rounded-lg border shadow-sm">
            <div className="flex-1 min-w-[120px]">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Item Name</span>
              <p className="font-medium text-foreground truncate">{item.name}</p>
            </div>
            <div className="flex-1 min-w-[100px]">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Category</span>
              <p className="font-medium text-foreground">{item.category}</p>
            </div>
            <div className="flex-1 min-w-[80px]">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Available</span>
              <p className="font-medium text-primary">{item.quantity} units</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Core Transfer Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Transfer Details
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="branch" className="text-xs font-medium text-muted-foreground">Destination Branch *</Label>
                <Select
                  value={branch}
                  onValueChange={(value) => setBranch(value)}
                  required
                >
                  <SelectTrigger className="h-10">
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
                <Label htmlFor="quantity" className="text-xs font-medium text-muted-foreground">Quantity *</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                    max={item.quantity}
                    required
                    className="pl-9 h-10"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground text-right">Max: {item.quantity}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemTrackingId" className="text-xs font-medium text-muted-foreground">Item Tracking ID *</Label>
                <div className="relative">
                  <Barcode className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="itemTrackingId"
                    value={itemTrackingId}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val.startsWith("CRE")) {
                        setItemTrackingId("CRE");
                      } else {
                        setItemTrackingId(val);
                      }
                    }}
                    placeholder="Scan or enter ID"
                    required
                    className="pl-9 h-10"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Additional Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Additional Information
              </h3>

              <div className="space-y-2">
                <Label htmlFor="serialNumber" className="text-xs font-medium text-muted-foreground">Serial Number</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="serialNumber"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g., SN98765"
                    disabled={!!initialSerialNumber}
                    className="pl-9 h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="assetNumber" className="text-xs font-medium text-muted-foreground">Asset Number</Label>
                  <Input
                    id="assetNumber"
                    value={assetNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val.startsWith("FDE/IT/")) {
                        setAssetNumber("FDE/IT/");
                      } else {
                        setAssetNumber(val);
                      }
                    }}
                    placeholder="e.g., FDE/IT/12345"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-xs font-medium text-muted-foreground">Model</Label>
                  <Input
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g., XYZ-Pro"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-xs font-medium text-muted-foreground">Reason</Label>
                <Select
                  value={reason}
                  onValueChange={(value) => setReason(value)}
                  required
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New Equipment">New Equipment</SelectItem>
                    <SelectItem value="Replacement Equipment">Replacement Equipment</SelectItem>
                    <SelectItem value="Repaired">Repaired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reason === "Replacement Equipment" && (
                <div className="space-y-2">
                  <Label htmlFor="note" className="text-xs font-medium text-muted-foreground">Note</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Enter a small note..."
                      className="pl-9 h-10"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} className="h-10 px-6">
              Cancel
            </Button>
            <Button type="submit" className="h-10 px-6 bg-primary hover:bg-primary/90 shadow-md transition-all hover:scale-[1.02]">
              Confirm Transfer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
