import mongoose from 'mongoose';

const tableSchema = mongoose.Schema(
  {
    number: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED'],
      default: 'AVAILABLE',
    },
    qrId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const Table = mongoose.model('Table', tableSchema);
export default Table;
