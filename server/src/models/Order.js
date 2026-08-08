import mongoose from 'mongoose';

const orderItemSchema = mongoose.Schema(
  {
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    instructions: { type: String, default: '' },
  },
  { _id: false }
);

const paymentSchema = mongoose.Schema(
  {
    paymentId: { type: String },
    method: { type: String, default: 'Cash' },
    status: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
    amount: { type: Number, default: 0 },
    raw: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const orderSchema = mongoose.Schema(
  {
    tableNumber: { type: String, required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true, default: 0 },
    gst: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['RECEIVED', 'PREPARING', 'READY_TO_SERVE', 'SERVED', 'COMPLETED', 'CANCELLED'],
      default: 'RECEIVED',
    },
    estimatedMinutes: { type: Number, default: 20 },
    customerNotes: { type: String, default: '' },
    payment: paymentSchema,
    createdByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
