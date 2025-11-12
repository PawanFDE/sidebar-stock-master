// View Component - Add/Edit Item Form
import { useState } from "react";
import { InventoryItem } from "@/models/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ItemFormProps {
  item?: InventoryItem;
  categories: string[];
  onSubmit: (item: Omit<InventoryItem, 'id' | 'status' | 'lastUpdated'>) => void;
  onCancel?: () => void;
}

export function ItemForm({ item, categories, onSubmit, onCancel }: ItemFormProps) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    sku: item?.sku || '',
    category: item?.category || '',
    quantity: item?.quantity || 0,
    minStock: item?.minStock || 0,
    maxStock: item?.maxStock || 0,
    price: item?.price || 0,
    supplier: item?.supplier || '',
    location: item?.location || '',
    description: item?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{item ? 'Edit Item' : 'Add New Item'}</CardTitle>
      </CardHeader>
      <CardContent>
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
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                required
                placeholder="e.g., ELEC-001"
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
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleChange('supplier', e.target.value)}
                required
                placeholder="e.g., Tech Distributors Inc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Current Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                required
                min="0"
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStock">Maximum Stock *</Label>
              <Input
                id="maxStock"
                type="number"
                value={formData.maxStock}
                onChange={(e) => handleChange('maxStock', parseInt(e.target.value) || 0)}
                required
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                required
                min="0"
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Optional description of the item"
                rows={3}
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
