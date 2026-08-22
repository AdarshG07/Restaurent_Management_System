import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'info' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);  

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
