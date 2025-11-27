const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
    },
    itemName: {
      type: String,
    },
    itemCategory: {
      type: String,
    },
    type: {
      type: String,
      required: true,
      enum: ['in', 'out', 'return', 'transfer', 'confirmation'],
    },
    quantity: {
      type: Number,
      required: true,
    },
    branch: {
      type: String,
      // Required for 'out', 'return', or 'transfer' transactions
      required: function () {
        return this.type === 'out' || this.type === 'return' || this.type === 'transfer';
      },
    },
    assetNumber: {
      type: String,
    },
    model: {
      type: String,
    },
    serialNumber: {
      type: String,
    },
    itemTrackingId: {
      type: String,
      // Required for 'transfer' transactions, optional for 'return'
      required: function () {
        return this.type === 'transfer';
      },
    },
    reason: {
      type: String,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
