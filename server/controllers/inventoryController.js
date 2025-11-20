const InventoryItem = require('../models/inventory');
const Category = require('../models/category');
const { extractInvoiceData } = require('../utils/gemini');

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
  const { name, category, quantity, minStock, maxStock, price, supplier, model, location, description } = req.body;

  try {
    const item = new InventoryItem({
      name,
      category,
      quantity,
      minStock,
      maxStock,
      price,
      supplier,
      model,
      location,
      status: quantity <= minStock ? (quantity === 0 ? 'out-of-stock' : 'low-stock') : 'in-stock',
      description,
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an inventory item
// @route   PUT /api/inventory/:id
// @access  Public
const updateInventoryItem = async (req, res) => {
  const { name, category, quantity, minStock, maxStock, price, supplier, model, location, description } = req.body;

  try {
    const item = await InventoryItem.findById(req.params.id);

    if (item) {
      item.name = name || item.name;
      item.category = category || item.category;
      item.quantity = quantity !== undefined ? quantity : item.quantity;
      item.minStock = minStock !== undefined ? minStock : item.minStock;
      item.maxStock = maxStock !== undefined ? maxStock : item.maxStock;
      item.price = price !== undefined ? price : item.price;
      item.supplier = supplier || item.supplier;
      item.model = model || item.model;
      item.location = location || item.location;
      item.description = description || item.description;

      item.status = item.quantity <= item.minStock ? (item.quantity === 0 ? 'out-of-stock' : 'low-stock') : 'in-stock';

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

    const extractedData = await extractInvoiceData(
      req.file.buffer, 
      req.file.mimetype,
      categoryNames
    );

    // Match the extracted category with available categories
    const matchedCategory = findClosestCategory(extractedData.category, categories);
    extractedData.category = matchedCategory;

    res.status(200).json(extractedData);
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