const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['in', 'out', 'return'],
    },
    quantity: {
      type: Number,
      required: true,
    },
    branch: {
      type: String,
      // Required for 'out' or 'return' transactions
      required: function () {
        return this.type === 'out' || this.type === 'return';
      },
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
