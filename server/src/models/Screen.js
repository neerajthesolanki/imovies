import mongoose from 'mongoose';

const screenSchema = new mongoose.Schema(
  {
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
      index: true
    },
    screenNumber: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      default: 'Audi 1'
    },
    screenType: {
      type: String,
      enum: ['Standard 2D', 'IMAX 3D', '4DX', 'Dolby Cinema'],
      default: 'Standard 2D'
    },
    soundSystem: {
      type: String,
      default: 'Dolby Atmos 7.1'
    },
    totalCapacity: {
      type: Number,
      required: true,
      default: 80
    },
    seatingLayout: [
      {
        row: { type: String, required: true }, // e.g., 'A', 'B', 'C'
        category: {
          type: String,
          enum: ['VIP', 'Premium', 'Executive', 'Regular'],
          default: 'Regular'
        },
        basePriceMultiplier: {
          type: Number,
          default: 1.0
        },
        seats: [
          {
            number: { type: Number, required: true },
            seatId: { type: String, required: true }, // e.g. "A1", "A2"
            isActive: { type: Boolean, default: true }
          }
        ]
      }
    ]
  },
  {
    timestamps: true
  }
);

screenSchema.index({ theatre: 1, screenNumber: 1 }, { unique: true });

const Screen = mongoose.models.Screen || mongoose.model('Screen', screenSchema);
export default Screen;
