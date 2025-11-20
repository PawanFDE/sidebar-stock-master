// View Component - Add/Edit Item Form
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Category, InventoryItem } from "@/models/inventory";
import axios from "axios";
import { Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ItemFormProps {
  item?: InventoryItem;
  categories: Category[];
  onSubmit: (item: Omit<InventoryItem, 'id' | 'status' | 'lastUpdated'>) => void;
  onCancel?: () => void;
}

export function ItemForm({ item, categories, onSubmit, onCancel }: ItemFormProps) {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || '',
    quantity: item?.quantity || 0,
    minStock: item?.minStock || 0,
    supplier: item?.supplier || '',
    model: item?.model || '',
    serialNumber: item?.serialNumber || '',
    location: item?.location || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataToSend = new FormData();
    formDataToSend.append('invoice', file);

    setUploading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/inventory/upload-invoice', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const extractedData = response.data;
      
      setFormData(prev => ({
        ...prev,
        name: extractedData.name || prev.name,
        category: extractedData.category || prev.category,
        quantity: extractedData.quantity || prev.quantity,
        minStock: extractedData.minStock || prev.minStock,
        supplier: extractedData.supplier || prev.supplier,
        model: extractedData.model || prev.model,
        serialNumber: extractedData.serialNumber 
          ? (prev.serialNumber ? prev.serialNumber + ', ' + extractedData.serialNumber : extractedData.serialNumber)
          : prev.serialNumber,
        location: extractedData.location || prev.location,
      }));

      toast.success("Invoice data extracted successfully!");
    } catch (error) {
      console.error("Error uploading invoice:", error);
      toast.error("Failed to extract data from invoice.");
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{item ? 'Edit Item' : 'Add New Item'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 border border-dashed rounded-lg bg-muted/50">
          <Label htmlFor="invoice-upload" className="cursor-pointer flex flex-col items-center gap-2">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">
              {uploading ? "Processing Invoice..." : "Upload Invoice to Auto-fill"}
            </span>
            <span className="text-xs text-muted-foreground">
              Supports Images and PDFs
            </span>
            <Input
              id="invoice-upload"
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </Label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                placeholder="e.g., Laptop Dell XPS 15"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleChange('supplier', e.target.value)}
                placeholder="e.g., Tech Distributors Inc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="e.g., XPS 15"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number(s)</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => handleChange('serialNumber', e.target.value)}
                placeholder="e.g., SN123456, SN123457 (comma separated)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">{item ? 'Current Quantity *' : 'Adding Quantity *'}</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                required
                min="0"
                disabled={!!item}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Minimum Stock *</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => handleChange('minStock', parseInt(e.target.value) || 0)}
                required
                min="0"
                disabled={!!item}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">Storage Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                required
                placeholder="e.g., Warehouse A, Shelf 12"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              {item ? 'Update Item' : 'Add Item'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
