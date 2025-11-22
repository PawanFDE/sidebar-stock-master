const InventoryItem = require('../models/inventory');
const Category = require('../models/category');
const { extractInvoiceData } = require('../utils/gemini');

// Helper to calculate warranty expiry
function calculateWarrantyExpiry(warrantyStr, startDate = new Date()) {
  if (!warrantyStr) return null;
  
  const match = warrantyStr.match(/(\d+)\s*(year|month|day|week)s?/i);
  if (!match) return null;

  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  
  const expiryDate = new Date(startDate);
  
  if (unit.startsWith('year')) {
    expiryDate.setFullYear(expiryDate.getFullYear() + amount);
  } else if (unit.startsWith('month')) {
    expiryDate.setMonth(expiryDate.getMonth() + amount);
  } else if (unit.startsWith('week')) {
    expiryDate.setDate(expiryDate.getDate() + amount * 7);
  } else if (unit.startsWith('day')) {
    expiryDate.setDate(expiryDate.getDate() + amount);
  }
  
  return expiryDate;
}

// Helper to check for duplicate serial numbers
async function checkDuplicateSerialNumbers(serialNumber, excludeItemId = null) {
  if (!serialNumber) return null;

  const newSerials = serialNumber.split(',').map(s => s.trim()).filter(s => s);
  if (newSerials.length === 0) return null;

  // Find all items that have a serial number
  const query = { serialNumber: { $exists: true, $ne: '' } };
  if (excludeItemId) {
    query._id = { $ne: excludeItemId };
  }

  const existingItems = await InventoryItem.find(query).select('serialNumber name');

  for (const item of existingItems) {
    if (!item.serialNumber) continue;
    const existingSerials = item.serialNumber.split(',').map(s => s.trim());
    
    for (const newSerial of newSerials) {
      if (existingSerials.includes(newSerial)) {
        return { serial: newSerial, existingItemName: item.name };
      }
    }
  }

  return null;
}

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Public
const getInventoryItems = async (req, res) => {
  try {
    const items = await InventoryItem.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single inventory item by ID
// @route   GET /api/inventory/:id
// @access  Public
const getInventoryItemById = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an inventory item
// @route   POST /api/inventory
// @access  Public
const createInventoryItem = async (req, res) => {
  const { name, category, quantity, maxStock, price, supplier, model, serialNumber, warranty, location, description } = req.body;

  try {
    // Check for duplicate serial numbers
    const duplicate = await checkDuplicateSerialNumbers(serialNumber);
    if (duplicate) {
      return res.status(400).json({ 
        message: `Serial number '${duplicate.serial}' already exists in item '${duplicate.existingItemName}'.` 
      });
    }

    const warrantyExpiryDate = calculateWarrantyExpiry(warranty);

    // Check if serial numbers are provided
    if (serialNumber && serialNumber.trim()) {
      // Split serial numbers by comma and create separate items
      const serialNumbers = serialNumber.split(',').map(s => s.trim()).filter(s => s);
      
      if (serialNumbers.length > 1) {
        // Create separate items for each serial number
        const createdItems = [];
        
        for (const sn of serialNumbers) {
          const item = new InventoryItem({
            name,
            category,
            quantity: 1, // Each item with unique serial number has quantity 1
            maxStock,
            price,
            supplier,
            model,
            serialNumber: sn,
            warranty,
            warrantyExpiryDate,
            location,
            status: 'in-stock',
            description,
            createdBy: req.user._id,
            lastUpdatedBy: req.user._id,
          });
          
          const createdItem = await item.save();
          createdItems.push(createdItem);
        }
        
        return res.status(201).json({ 
          message: `${createdItems.length} items created successfully`,
          items: createdItems 
        });
      } else {
        // Single serial number - create one item with quantity 1
        const item = new InventoryItem({
          name,
          category,
          quantity: 1,
          maxStock,
          price,
          supplier,
          model,
          serialNumber: serialNumbers[0],
          warranty,
          warrantyExpiryDate,
          location,
          status: 'in-stock',
          description,
          createdBy: req.user._id,
          lastUpdatedBy: req.user._id,
        });

        const createdItem = await item.save();
        return res.status(201).json(createdItem);
      }
    } else {
      // No serial number provided - create item with specified quantity
      const item = new InventoryItem({
        name,
        category,
        quantity,
        maxStock,
        price,
        supplier,
        model,
        serialNumber: '',
        warranty,
        warrantyExpiryDate,
        location,
        status: quantity === 0 ? 'out-of-stock' : 'in-stock',
        description,
        createdBy: req.user._id,
        lastUpdatedBy: req.user._id,
      });

      const createdItem = await item.save();
      return res.status(201).json(createdItem);
    }
  } catch (error) {
    console.error("Error creating inventory item:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an inventory item
// @route   PUT /api/inventory/:id
// @access  Public
const updateInventoryItem = async (req, res) => {
  const { name, category, quantity, maxStock, price, supplier, model, serialNumber, warranty, location, description } = req.body;

  try {
    const item = await InventoryItem.findById(req.params.id);

    if (item) {
      // Check for duplicate serial numbers, excluding current item
      if (serialNumber !== undefined) {
         const duplicate = await checkDuplicateSerialNumbers(serialNumber, req.params.id);
         if (duplicate) {
           return res.status(400).json({ 
             message: `Serial number '${duplicate.serial}' already exists in item '${duplicate.existingItemName}'.` 
           });
         }
      }

      item.name = name !== undefined ? name : item.name;
      item.category = category !== undefined ? category : item.category;
      item.quantity = quantity !== undefined ? quantity : item.quantity;
      item.maxStock = maxStock !== undefined ? maxStock : item.maxStock;
      item.price = price !== undefined ? price : item.price;
      item.supplier = supplier !== undefined ? supplier : item.supplier;
      item.model = model !== undefined ? model : item.model;
      item.serialNumber = serialNumber !== undefined ? serialNumber : item.serialNumber;
      
      if (warranty !== undefined) {
        item.warranty = warranty;
        // Recalculate expiry if warranty changes. Base it on original creation date to be consistent with "purchase date" concept
        item.warrantyExpiryDate = calculateWarrantyExpiry(warranty, item.createdAt);
      }
      
      item.location = location !== undefined ? location : item.location;
      item.description = description !== undefined ? description : item.description;
      item.lastUpdatedBy = req.user._id;

      item.status = item.quantity === 0 ? 'out-of-stock' : 'in-stock';

      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an inventory item
// @route   DELETE /api/inventory/:id
// @access  Public
const deleteInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);

    if (item) {
      await item.deleteOne();
      res.json({ message: 'Item removed' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to find closest matching category
function findClosestCategory(extractedCategory, availableCategories) {
  if (!extractedCategory || !availableCategories || availableCategories.length === 0) {
    return '';
  }

  const extracted = extractedCategory.toLowerCase().trim();
  
  // First, try exact match
  const exactMatch = availableCategories.find(cat => 
    cat.name.toLowerCase() === extracted
  );
  if (exactMatch) return exactMatch.name;

  // Then try partial match (category name contains extracted or vice versa)
  const partialMatch = availableCategories.find(cat => {
    const catName = cat.name.toLowerCase();
    return catName.includes(extracted) || extracted.includes(catName);
  });
  if (partialMatch) return partialMatch.name;

  // Return empty string if no match found (user will need to select manually)
  return '';
}

// @desc    Upload invoice and extract data
// @route   POST /api/inventory/upload-invoice
// @access  Public
const uploadInvoice = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Fetch available categories from database
    const categories = await Category.find({});
    const categoryNames = categories.map(c => c.name).join(', ');

    const extractedDataArray = await extractInvoiceData(
      req.file.buffer, 
      req.file.mimetype,
      categoryNames
    );

    // Match the extracted category with available categories for each item
    const processedItems = extractedDataArray.map(item => {
      const matchedCategory = findClosestCategory(item.category, categories);
      return {
        ...item,
        category: matchedCategory
      };
    });

    res.status(200).json({ items: processedItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to process invoice' });
  }
};

module.exports = {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  uploadInvoice
};