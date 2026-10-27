import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide movie title'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Please provide movie description']
    },
    posterUrl: {
      type: String,
      required: [true, 'Please provide poster image URL']
    },
    backdropUrl: {
      type: String,
      default: ''
    },
    trailerUrl: {
      type: String,
      default: ''
    },
    genre: {
      type: [String],
      required: true,
      index: true
    },
    language: {
      type: String,
      required: [true, 'Please provide language'],
      index: true
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Please provide duration in minutes']
    },
    rating: {
      type: Number,
      default: 8.5,
      min: 0,
      max: 10
    },
    releaseDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon', 'ended'],
      default: 'now_showing',
      index: true
    },
    cast: [
      {
        name: String,
        role: String,
        photo: String
      }
    ],
    director: {
      type: String,
      default: ''
    },
    certificate: {
      type: String,
      enum: ['U', 'UA', 'A', 'R', 'PG-13'],
      default: 'UA'
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

movieSchema.index({ title: 'text', description: 'text' });

const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema);
export default Movie;
