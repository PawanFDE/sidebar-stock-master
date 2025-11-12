const express = require('express');
const router = express.Router();
const {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} = require('../controllers/inventoryController');

router.route('/').get(getInventoryItems).post(createInventoryItem);
router.route('/:id').get(getInventoryItemById).put(updateInventoryItem).delete(deleteInventoryItem);

module.exports = router;