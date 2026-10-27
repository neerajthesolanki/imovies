import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true
    },
    screenName: {
      type: String,
      default: 'Audi 1'
    },
    seats: [
      {
        seatId: { type: String, required: true },
        row: { type: String, required: true },
        number: { type: Number, required: true },
        category: { type: String, default: 'Regular' },
        price: { type: Number, required: true }
      }
    ],
    showDate: {
      type: Date,
      required: true
    },
    showTime: {
      type: String,
      required: true
    },
    pricingSummary: {
      subtotal: { type: Number, required: true },
      convenienceFee: { type: Number, default: 35 },
      taxAmount: { type: Number, default: 15 },
      totalAmount: { type: Number, required: true }
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'failed'],
      default: 'pending',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    qrCodeUrl: {
      type: String,
      default: ''
    },
    cancellation: {
      isCancelled: { type: Boolean, default: false },
      cancelledAt: { type: Date },
      refundAmount: { type: Number, default: 0 },
      reason: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ user: 1, createdAt: -1 });

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
export default Booking;
