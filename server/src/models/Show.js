import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
      index: true
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true
    },
    showDate: {
      type: Date,
      required: true,
      index: true
    },
    startTime: {
      type: String, // e.g. "10:30 AM", "02:15 PM", "06:45 PM", "09:30 PM"
      required: true
    },
    endTime: {
      type: String,
      default: ''
    },
    format: {
      type: String,
      default: '2D'
    },
    language: {
      type: String,
      default: 'English'
    },
    pricing: {
      vip: { type: Number, default: 450 },
      premium: { type: Number, default: 350 },
      executive: { type: Number, default: 250 },
      regular: { type: Number, default: 180 }
    },
    bookedSeats: {
      type: [String], // Array of seat IDs: e.g. ["A1", "A2"]
      default: []
    },
    temporaryHolds: [
      {
        seatId: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        holdToken: { type: String, required: true },
        expiresAt: { type: Date, required: true }
      }
    ],
    status: {
      type: String,
      enum: ['scheduled', 'open', 'almost_full', 'sold_out', 'cancelled', 'completed'],
      default: 'open'
    }
  },
  {
    timestamps: true
  }
);

showSchema.index({ movie: 1, showDate: 1, theatre: 1 });

const Show = mongoose.models.Show || mongoose.model('Show', showSchema);
export default Show;
