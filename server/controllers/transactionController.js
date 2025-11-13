const Transaction = require('../models/transaction');
const InventoryItem = require('../models/inventory');

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Public
const createTransaction = async (req, res) => {
  const { itemId, type, quantity, branch } = req.body;

  if (!itemId || !type || !quantity) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if ((type === 'out' || type === 'return') && !branch) {
    return res.status(400).json({ message: 'Branch is required for "out" and "return" transactions' });
  }

  try {
    const item = await InventoryItem.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (type === 'out' && item.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock for this transaction' });
    }

    // Update inventory item quantity
    if (type === 'out') {
      item.quantity -= quantity;
    } else { // 'in' or 'return'
      item.quantity += quantity;
    }
    
    // Determine item status based on stock levels
    if (item.quantity <= item.minStock && item.quantity > 0) {
      item.status = 'low-stock';
    } else if (item.quantity === 0) {
      item.status = 'out-of-stock';
    } else {
      item.status = 'in-stock';
    }

    const updatedItem = await item.save();

    // Create the transaction
    const transaction = new Transaction({
      itemId,
      type,
      quantity,
      branch,
    });

    const createdTransaction = await transaction.save();

    res.status(201).json({
      transaction: createdTransaction,
      item: updatedItem,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all transactions for a specific item
// @route   GET /api/transactions/:itemId
// @access  Public
const getTransactionsByItem = async (req, res) => {
  try {
    const transactions = await Transaction.find({ itemId: req.params.itemId }).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all unique branches from transactions
// @route   GET /api/transactions/branches
// @access  Public
const getBranches = async (req, res) => {
  try {
    const branches = await Transaction.distinct('branch', { type: 'out' });
    res.status(200).json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all items for a specific branch
// @route   GET /api/transactions/branch/:branchName
// @access  Public
const getItemsByBranch = async (req, res) => {
  try {
    const branchName = req.params.branchName;
    const items = await Transaction.aggregate([
      { $match: { type: 'out', branch: branchName } },
      {
        $group: {
          _id: '$itemId',
          quantity: { $sum: '$quantity' },
        },
      },
      {
        $lookup: {
          from: 'inventoryitems',
          localField: '_id',
          foreignField: '_id',
          as: 'itemDetails',
        },
      },
      { $unwind: '$itemDetails' },
      {
        $project: {
          _id: '$itemDetails._id',
          name: '$itemDetails.name',
          sku: '$itemDetails.sku',
          category: '$itemDetails.category',
          price: '$itemDetails.price',
          location: '$itemDetails.location',
          supplier: '$itemDetails.supplier',
          quantity: '$quantity',
        },
      },
    ]);
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all transferred items, grouped by branch
// @route   GET /api/transactions/transferred-items
// @access  Public
const getAllTransferredItems = async (req, res) => {
  try {
    const transferredItems = await Transaction.aggregate([
      { $match: { type: { $in: ['out', 'return'] } } },
      {
        $group: {
          _id: { branch: '$branch', itemId: '$itemId' },
          netQuantity: {
            $sum: {
              $cond: [{ $eq: ['$type', 'out'] }, '$quantity', { $multiply: ['$quantity', -1] }],
            },
          },
        },
      },
      { $match: { netQuantity: { $gt: 0 } } },
      {
        $lookup: {
          from: 'inventoryitems',
          localField: '_id.itemId',
          foreignField: '_id',
          as: 'itemDetails',
        },
      },
      { $unwind: '$itemDetails' },
      {
        $group: {
          _id: '$_id.branch',
          items: {
            $push: {
              id: '$itemDetails._id',
              name: '$itemDetails.name',
              sku: '$itemDetails.sku',
              category: '$itemDetails.category',
              quantity: '$netQuantity',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          branch: '$_id',
          items: 1,
        },
      },
    ]);
    res.status(200).json(transferredItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createTransaction,
  getTransactionsByItem,
  getBranches,
  getItemsByBranch,
  getAllTransferredItems,
};
