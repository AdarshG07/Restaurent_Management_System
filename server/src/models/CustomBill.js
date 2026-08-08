import mongoose from 'mongoose';

const billItemSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const customBillSchema = mongoose.Schema(
  {
    tableNumber: { type: String, default: 'Guest' },
    items: [billItemSchema],
    subtotal: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const CustomBill = mongoose.model('CustomBill', customBillSchema);
export default CustomBill;
