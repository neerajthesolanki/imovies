import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Movie from '../src/models/Movie.js';
import Theatre from '../src/models/Theatre.js';
import Screen from '../src/models/Screen.js';
import Show from '../src/models/Show.js';
import { dbState } from '../src/config/db.js';
import { memoryStore } from '../src/services/memoryStore.js';

dotenv.config();

const sampleMovies = [
  {
    _id: '65e000000000000000000011',
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project.',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    genre: ['Biography', 'Drama', 'History'],
    language: 'English',
    duration: 180,
    rating: 8.9,
    releaseDate: new Date('2023-07-21'),
    status: 'now_showing',
    director: 'Christopher Nolan',
    certificate: 'UA',
    featured: true,
    cast: [
      { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer' },
      { name: 'Emily Blunt', role: 'Katherine Oppenheimer' },
      { name: 'Matt Damon', role: 'Leslie Groves' },
      { name: 'Robert Downey Jr.', role: 'Lewis Strauss' }
    ]
  },
  {
    _id: '65e000000000000000000012',
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    language: 'English',
    duration: 166,
    rating: 8.7,
    releaseDate: new Date('2024-03-01'),
    status: 'now_showing',
    director: 'Denis Villeneuve',
    certificate: 'UA',
    featured: true,
    cast: [
      { name: 'Timothée Chalamet', role: 'Paul Atreides' },
      { name: 'Zendaya', role: 'Chani' },
      { name: 'Rebecca Ferguson', role: 'Lady Jessica' },
      { name: 'Javier Bardem', role: 'Stilgar' }
    ]
  },
  {
    _id: '65e000000000000000000013',
    title: 'Interstellar',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft along with a team of researchers.',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    genre: ['Adventure', 'Drama', 'Sci-Fi'],
    language: 'English',
    duration: 169,
    rating: 8.7,
    releaseDate: new Date('2014-11-07'),
    status: 'now_showing',
    director: 'Christopher Nolan',
    certificate: 'UA',
    featured: true,
    cast: [
      { name: 'Matthew McConaughey', role: 'Cooper' },
      { name: 'Anne Hathaway', role: 'Brand' },
      { name: 'Jessica Chastain', role: 'Murph' }
    ]
  },
  {
    _id: '65e000000000000000000014',
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    genre: ['Action', 'Crime', 'Drama'],
    language: 'English',
    duration: 152,
    rating: 9.0,
    releaseDate: new Date('2008-07-18'),
    status: 'now_showing',
    director: 'Christopher Nolan',
    certificate: 'UA',
    featured: true,
    cast: [
      { name: 'Christian Bale', role: 'Bruce Wayne / Batman' },
      { name: 'Heath Ledger', role: 'Joker' },
      { name: 'Aaron Eckhart', role: 'Harvey Dent' }
    ]
  },
  {
    _id: '65e000000000000000000015',
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    posterUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    language: 'English',
    duration: 148,
    rating: 8.8,
    releaseDate: new Date('2010-07-16'),
    status: 'now_showing',
    director: 'Christopher Nolan',
    certificate: 'UA',
    featured: false,
    cast: [
      { name: 'Leonardo DiCaprio', role: 'Cobb' },
      { name: 'Joseph Gordon-Levitt', role: 'Arthur' },
      { name: 'Elliot Page', role: 'Ariadne' }
    ]
  },
  {
    _id: '65e000000000000000000016',
    title: 'Spider-Man: Across the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    genre: ['Animation', 'Action', 'Adventure'],
    language: 'English',
    duration: 140,
    rating: 8.7,
    releaseDate: new Date('2023-06-02'),
    status: 'now_showing',
    director: 'Joaquim Dos Santos',
    certificate: 'U',
    featured: false,
    cast: [
      { name: 'Shameik Moore', role: 'Miles Morales' },
      { name: 'Hailee Steinfeld', role: 'Gwen Stacy' },
      { name: 'Oscar Isaac', role: 'Miguel O\'Hara' }
    ]
  },
  {
    _id: '65e000000000000000000017',
    title: 'Avatar: The Way of Water',
    description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
    genre: ['Action', 'Adventure', 'Fantasy'],
    language: 'English',
    duration: 192,
    rating: 7.6,
    releaseDate: new Date('2022-12-16'),
    status: 'now_showing',
    director: 'James Cameron',
    certificate: 'UA',
    featured: false,
    cast: [
      { name: 'Sam Worthington', role: 'Jake Sully' },
      { name: 'Zoe Saldana', role: 'Neytiri' },
      { name: 'Sigourney Weaver', role: 'Kiri' }
    ]
  },
  {
    _id: '65e000000000000000000018',
    title: 'Gladiator II',
    description: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome.',
    posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
    genre: ['Action', 'Adventure', 'Drama'],
    language: 'English',
    duration: 148,
    rating: 8.2,
    releaseDate: new Date('2024-11-15'),
    status: 'coming_soon',
    director: 'Ridley Scott',
    certificate: 'A',
    featured: false,
    cast: [
      { name: 'Paul Mescal', role: 'Lucius' },
      { name: 'Pedro Pascal', role: 'Marcus Acacius' },
      { name: 'Denzel Washington', role: 'Macrinus' }
    ]
  },
  {
    _id: '65e000000000000000000019',
    title: 'Deadpool & Wolverine',
    description: 'Wolverine is recovering from his injuries when he crosses paths with the loudmouth Deadpool. They team up to defeat a common enemy.',
    posterUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
    genre: ['Action', 'Comedy', 'Sci-Fi'],
    language: 'English',
    duration: 128,
    rating: 8.0,
    releaseDate: new Date('2024-07-26'),
    status: 'now_showing',
    director: 'Shawn Levy',
    certificate: 'A',
    featured: false,
    cast: [
      { name: 'Ryan Reynolds', role: 'Wade Wilson / Deadpool' },
      { name: 'Hugh Jackman', role: 'Logan / Wolverine' },
      { name: 'Emma Corrin', role: 'Cassandra Nova' }
    ]
  },
  {
    _id: '65e000000000000000000020',
    title: 'Kalki 2898 AD',
    description: 'A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to the earth to protect the world from evil forces.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=kQDd1AhGIHk',
    genre: ['Action', 'Drama', 'Sci-Fi'],
    language: 'Hindi',
    duration: 181,
    rating: 7.8,
    releaseDate: new Date('2024-06-27'),
    status: 'now_showing',
    director: 'Nag Ashwin',
    certificate: 'UA',
    featured: false,
    cast: [
      { name: 'Prabhas', role: 'Bhairava' },
      { name: 'Amitabh Bachchan', role: 'Ashwatthama' },
      { name: 'Deepika Padukone', role: 'SUM-80' }
    ]
  }
];

const sampleTheatres = [
  {
    _id: '65e000000000000000000031',
    name: 'PVR ICON: Infiniti Mall, Versova',
    city: 'Mumbai',
    address: 'Infiniti Mall, Link Rd, Andheri West, Mumbai, Maharashtra 400053',
    postalCode: '400053',
    facilities: ['Dolby Atmos', '4K Laser Projection', 'Recliner Lounges', 'Valet Parking', 'Gourmet Food Court'],
    phone: '+91 22 6694 4444',
    isActive: true
  },
  {
    _id: '65e000000000000000000032',
    name: 'INOX Megaplex: Inorbit Mall, Malad',
    city: 'Mumbai',
    address: 'Inorbit Mall, New Link Rd, Malad West, Mumbai, Maharashtra 400064',
    postalCode: '400064',
    facilities: ['IMAX with Laser', 'MX4D Theatres', 'Kiddles Screen', 'Food Court'],
    phone: '+91 22 2878 5555',
    isActive: true
  },
  {
    _id: '65e000000000000000000033',
    name: 'Cinépolis VIP: Forum Shantiniketan',
    city: 'Bengaluru',
    address: 'Whitefield Main Rd, Thigalarapalya, Krishnarajapura, Bengaluru, Karnataka 560067',
    postalCode: '560067',
    facilities: ['VIP Recliners', 'Dolby 7.1 Sound', 'Live Kitchen Menu', 'Bar Lounge'],
    phone: '+91 80 4680 7777',
    isActive: true
  }
];

const generateSeatingLayout = () => {
  const rows = [
    { row: 'A', category: 'VIP', priceMult: 1.5, seatsCount: 10 },
    { row: 'B', category: 'VIP', priceMult: 1.5, seatsCount: 10 },
    { row: 'C', category: 'Premium', priceMult: 1.25, seatsCount: 12 },
    { row: 'D', category: 'Premium', priceMult: 1.25, seatsCount: 12 },
    { row: 'E', category: 'Executive', priceMult: 1.1, seatsCount: 12 },
    { row: 'F', category: 'Executive', priceMult: 1.1, seatsCount: 12 },
    { row: 'G', category: 'Regular', priceMult: 1.0, seatsCount: 14 },
    { row: 'H', category: 'Regular', priceMult: 1.0, seatsCount: 14 }
  ];

  return rows.map(r => ({
    row: r.row,
    category: r.category,
    basePriceMultiplier: r.priceMult,
    seats: Array.from({ length: r.seatsCount }, (_, i) => ({
      number: i + 1,
      seatId: `${r.row}${i + 1}`,
      isActive: true
    }))
  }));
};

const sampleScreens = [
  {
    _id: '65e000000000000000000041',
    theatre: '65e000000000000000000031',
    screenNumber: 1,
    name: 'Audi 1 - Dolby Atmos Luxe',
    screenType: 'Dolby Cinema',
    soundSystem: 'Dolby Atmos 128 channels',
    totalCapacity: 96,
    seatingLayout: generateSeatingLayout()
  },
  {
    _id: '65e000000000000000000042',
    theatre: '65e000000000000000000032',
    screenNumber: 1,
    name: 'Audi 1 - IMAX with Laser',
    screenType: 'IMAX 3D',
    soundSystem: 'IMAX 12-channel surround',
    totalCapacity: 96,
    seatingLayout: generateSeatingLayout()
  },
  {
    _id: '65e000000000000000000043',
    theatre: '65e000000000000000000033',
    screenNumber: 1,
    name: 'Audi 1 - VIP Club Lounge',
    screenType: 'Standard 2D',
    soundSystem: 'Dolby Digital 7.1',
    totalCapacity: 96,
    seatingLayout: generateSeatingLayout()
  }
];

const generateSampleShows = () => {
  const shows = [];
  const times = ['10:15 AM', '01:45 PM', '05:30 PM', '09:00 PM'];
  const today = new Date();

  // Create shows for today, tomorrow, and day after tomorrow
  for (let dayOffset = 0; dayOffset < 4; dayOffset++) {
    const showDate = new Date(today);
    showDate.setDate(today.getDate() + dayOffset);
    showDate.setHours(0, 0, 0, 0);

    sampleMovies.slice(0, 4).forEach((movie, mIdx) => {
      sampleTheatres.forEach((theatre, tIdx) => {
        const timeSlot = times[(mIdx + tIdx + dayOffset) % times.length];
        const screen = sampleScreens[tIdx % sampleScreens.length];

        shows.push({
          _id: `65e00000000000000000${String(100 + shows.length).padStart(4, '0')}`,
          movie: movie._id,
          theatre: theatre._id,
          screen: screen._id,
          showDate,
          startTime: timeSlot,
          format: '2D',
          language: movie.language,
          pricing: {
            vip: 450,
            premium: 350,
            executive: 260,
            regular: 180
          },
          bookedSeats: dayOffset === 0 ? ['C4', 'C5', 'E7', 'E8'] : [],
          status: 'open'
        });
      });
    });
  }
  return shows;
};

export const seedInitialData = async () => {
  await memoryStore.initDefaults();

  // Always populate memoryStore
  memoryStore.movies = [...sampleMovies];
  memoryStore.theatres = [...sampleTheatres];
  memoryStore.screens = [...sampleScreens];
  memoryStore.shows = generateSampleShows();

  // If MongoDB is connected, also sync to database
  if (dbState.isConnected) {
    try {
      console.log('[Seed] Syncing seed data to MongoDB Atlas / Local MongoDB...');

      // Upsert Admin
      const adminExists = await User.findOne({ email: 'admin@imovies.com' });
      if (!adminExists) {
        await User.create({
          name: process.env.ADMIN_NAME || 'IMovies Administrator',
          email: process.env.ADMIN_EMAIL || 'admin@imovies.com',
          password: process.env.ADMIN_PASSWORD || 'Admin@123456',
          role: 'admin',
          phone: '+91 9876543210'
        });
        console.log('[Seed] Admin account created: admin@imovies.com');
      }

      // Upsert Demo User
      const userExists = await User.findOne({ email: 'user@imovies.com' });
      if (!userExists) {
        await User.create({
          name: 'Demo Moviegoer',
          email: 'user@imovies.com',
          password: 'User@123456',
          role: 'user',
          phone: '+91 9876500000'
        });
        console.log('[Seed] Demo user account created: user@imovies.com');
      }

      // Sync Movies if count is low
      const movieCount = await Movie.countDocuments();
      if (movieCount < 5) {
        await Movie.deleteMany({});
        await Movie.insertMany(sampleMovies);
        console.log(`[Seed] Inserted ${sampleMovies.length} movies.`);
      }

      // Sync Theatres if count is low
      const theatreCount = await Theatre.countDocuments();
      if (theatreCount < 3) {
        await Theatre.deleteMany({});
        await Theatre.insertMany(sampleTheatres);
        console.log(`[Seed] Inserted ${sampleTheatres.length} theatres.`);
      }

      // Sync Screens
      const screenCount = await Screen.countDocuments();
      if (screenCount < 3) {
        await Screen.deleteMany({});
        await Screen.insertMany(sampleScreens);
        console.log(`[Seed] Inserted ${sampleScreens.length} screens.`);
      }

      // Sync Shows
      const showCount = await Show.countDocuments();
      if (showCount < 5) {
        await Show.deleteMany({});
        await Show.insertMany(memoryStore.shows);
        console.log(`[Seed] Inserted ${memoryStore.shows.length} shows.`);
      }

      console.log('[Seed] Database initialization complete.');
    } catch (err) {
      console.warn('[Seed Warning] MongoDB sync encountered an error:', err.message);
    }
  } else {
    console.log(`[Seed] In-memory store ready with ${memoryStore.movies.length} movies, ${memoryStore.theatres.length} theatres, and ${memoryStore.shows.length} shows.`);
  }
};

// Allow standalone execution: node scripts/seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  import('../src/config/db.js').then(async ({ connectDB }) => {
    await connectDB();
    await seedInitialData();
    console.log('Seed execution completed.');
    process.exit(0);
  });
}
