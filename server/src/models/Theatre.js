import mongoose from 'mongoose';

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide theatre name'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      index: true
    },
    address: {
      type: String,
      required: [true, 'Please provide full address']
    },
    postalCode: {
      type: String,
      default: ''
    },
    facilities: {
      type: [String],
      default: ['Dolby Atmos', '4K Laser Projection', 'Food Court', 'Parking']
    },
    phone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

theatreSchema.index({ name: 'text', city: 'text' });

const Theatre = mongoose.models.Theatre || mongoose.model('Theatre', theatreSchema);
export default Theatre;
