const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  uploadInvoice,
} = require('../controllers/inventoryController');

router.route('/').get(getInventoryItems).post(createInventoryItem);
router.post('/upload-invoice', upload.single('invoice'), uploadInvoice);
router.route('/:id').get(getInventoryItemById).put(updateInventoryItem).delete(deleteInventoryItem);

module.exports = router;