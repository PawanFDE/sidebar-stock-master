const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactionsByItem,
  getBranches,
  getItemsByBranch,
  getAllTransferredItems,
} = require('../controllers/transactionController');

router.route('/').post(createTransaction);
router.route('/branches').get(getBranches);
router.route('/transferred-items').get(getAllTransferredItems);
router.route('/branch/:branchName').get(getItemsByBranch);
router.route('/:itemId').get(getTransactionsByItem);

module.exports = router;
