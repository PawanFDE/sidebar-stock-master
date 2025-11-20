// Component to display and select multiple items extracted from invoice
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Package, XCircle } from "lucide-react";
import { useState } from "react";

interface ExtractedItem {
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  supplier: string;
  model?: string;
  serialNumber?: string;
  warranty?: string;
  location: string;
  description?: string;
}

interface MultiItemSelectorProps {
  items: ExtractedItem[];
  onAddSelected: (selectedItems: ExtractedItem[]) => void;
  onCancel: () => void;
}

export function MultiItemSelector({ items, onAddSelected, onCancel }: MultiItemSelectorProps) {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(items.map((_, index) => index)) // All items selected by default
  );

  const toggleItem = (index: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndices(newSelected);
  };

  const selectAll = () => {
    setSelectedIndices(new Set(items.map((_, index) => index)));
  };

  const deselectAll = () => {
    setSelectedIndices(new Set());
  };

  const handleAddSelected = () => {
    const selectedItems = items.filter((_, index) => selectedIndices.has(index));
    onAddSelected(selectedItems);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {items.length} Item{items.length > 1 ? 's' : ''} Found in Invoice
        </CardTitle>
        <CardDescription>
          Select the items you want to add to inventory. All items are selected by default.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {selectedIndices.size} of {items.length} item{items.length > 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Deselect All
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {items.map((item, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all ${
                  selectedIndices.has(index)
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
                onClick={() => toggleItem(index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedIndices.has(index)}
                      onCheckedChange={() => toggleItem(index)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-base">{item.name || 'Unnamed Item'}</h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          )}
                        </div>
                        {selectedIndices.has(index) ? (
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {item.category && (
                          <div>
                            <span className="text-muted-foreground">Category:</span>{' '}
                            <Badge variant="secondary" className="ml-1">
                              {item.category}
                            </Badge>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Quantity:</span>{' '}
                          <span className="font-medium">{item.quantity}</span>
                        </div>
                        {item.supplier && (
                          <div>
                            <span className="text-muted-foreground">Supplier:</span>{' '}
                            <span className="font-medium">{item.supplier}</span>
                          </div>
                        )}
                        {item.model && (
                          <div>
                            <span className="text-muted-foreground">Model:</span>{' '}
                            <span className="font-medium">{item.model}</span>
                          </div>
                        )}
                        {item.serialNumber && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Serial:</span>{' '}
                            <span className="font-medium text-xs">{item.serialNumber}</span>
                          </div>
                        )}
                        {item.warranty && (
                          <div>
                            <span className="text-muted-foreground">Warranty:</span>{' '}
                            <span className="font-medium">{item.warranty}</span>
                          </div>
                        )}
                        {item.location && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Location:</span>{' '}
                            <span className="font-medium">{item.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleAddSelected}
            disabled={selectedIndices.size === 0}
            className="flex-1"
          >
            Add {selectedIndices.size} Item{selectedIndices.size !== 1 ? 's' : ''} to Inventory
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
