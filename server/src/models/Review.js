import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    tableNumber: { type: String, required: true },
    foodRating: { type: Number, required: true, min: 1, max: 5 },
    serviceRating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;
