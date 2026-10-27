import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaSearch, FaPlay, FaTicketAlt, FaShieldAlt, FaStar, FaMapMarkerAlt } from 'react-icons/fa';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [moviesRes, theatresRes] = await Promise.all([
          api.get('/movies'),
          api.get('/theatres')
        ]);
        setMovies(moviesRes.data?.data || []);
        setTheatres(theatresRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const featuredMovie = movies.find(m => m.featured) || movies[0] || {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
    rating: 8.7,
    duration: 166,
    certificate: 'UA',
    _id: '65e000000000000000000012'
  };

  const genres = ['All', 'Action', 'Sci-Fi', 'Drama', 'Adventure', 'History'];
  const filteredNowShowing = movies.filter(m => {
    const matchesStatus = m.status === 'now_showing';
    const matchesGenre = selectedGenre === 'All' || (m.genre && m.genre.includes(selectedGenre));
    return matchesStatus && matchesGenre;
  });

  const comingSoonMovies = movies.filter(m => m.status === 'coming_soon');

  if (loading) {
    return <LoadingSpinner message="Curating premiere movies for you..." />;
  }

  return (
    <div className="homepage-wrapper pb-5">
      {/* Hero Section */}
      <div className="container pt-4 mb-5">
        <div
          className="hero-backdrop shadow-2xl"
          style={{ backgroundImage: `url(${featuredMovie.backdropUrl || featuredMovie.posterUrl})` }}
        >
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge bg-danger px-3 py-1 text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>
                Featured Premiere
              </span>
              <span className="badge bg-dark border border-secondary text-warning d-flex align-items-center gap-1">
                <FaStar size={11} /> {featuredMovie.rating ? featuredMovie.rating.toFixed(1) : '8.8'} IMDb
              </span>
              <span className="badge bg-dark border border-secondary text-light">
                {featuredMovie.certificate || 'UA'}
              </span>
            </div>

            <h1 className="display-4 fw-extrabold text-white mb-3 text-shadow">
              {featuredMovie.title}
            </h1>

            <p className="text-light text-opacity-80 fs-6 mb-4 line-clamp-3" style={{ maxWidth: '520px' }}>
              {featuredMovie.description}
            </p>

            <div className="d-flex flex-wrap gap-3">
              <Link
                to={`/movies/${featuredMovie._id}`}
                className="btn btn-cinema btn-lg px-4"
              >
                <FaTicketAlt /> Book Tickets Now
              </Link>
              {featuredMovie.trailerUrl && (
                <a
                  href={featuredMovie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-cinema-outline btn-lg px-4"
                >
                  <FaPlay size={14} /> Watch Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Cinema Search Bar */}
      <div className="container mb-5">
        <div className="cinema-card p-3 p-md-4 shadow">
          <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
            <div className="col-12 col-md-9 position-relative">
              <input
                type="text"
                className="form-control cinema-input ps-5 py-3 w-100"
                placeholder="Search movies by title, genre, language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch
                className="position-absolute text-muted"
                style={{ top: '50%', left: '1.25rem', transform: 'translateY(-50%)' }}
              />
            </div>
            <div className="col-12 col-md-3">
              <button type="submit" className="btn btn-cinema w-100 py-3">
                Search Movies
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Now Showing Section */}
      <div className="container mb-5">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <h2 className="text-white fw-bold mb-1">Now Showing in Theatres</h2>
            <p className="text-secondary small mb-0">Select your favorite movie and reserve seats in real time</p>
          </div>

          {/* Genre Filters */}
          <div className="d-flex flex-wrap gap-2">
            {genres.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGenre(g)}
                className={`btn btn-sm ${
                  selectedGenre === g ? 'btn-danger' : 'btn-outline-secondary text-light'
                } rounded-pill px-3 py-1`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {filteredNowShowing.length === 0 ? (
          <div className="cinema-card p-5 text-center my-4">
            <h5 className="text-white">No movies found in this genre</h5>
            <p className="text-secondary small">Try selecting "All" or browse our full collection.</p>
            <button className="btn btn-cinema-outline btn-sm" onClick={() => setSelectedGenre('All')}>
              Show All Movies
            </button>
          </div>
        ) : (
          <div className="row g-3 g-md-4">
            {filteredNowShowing.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </div>

      {/* Coming Soon Section */}
      {comingSoonMovies.length > 0 && (
        <div className="container mb-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h3 className="text-white fw-bold mb-1">Coming Soon</h3>
              <p className="text-secondary small mb-0">Upcoming blockbuster releases you cannot miss</p>
            </div>
            <Link to="/movies?status=coming_soon" className="text-danger text-decoration-none small fw-semibold">
              View All Upcoming →
            </Link>
          </div>

          <div className="row g-3 g-md-4">
            {comingSoonMovies.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </div>
      )}

      {/* Popular Theatres Section */}
      <div className="container mb-4">
        <h3 className="text-white fw-bold mb-3">Popular Theatres</h3>
        <div className="row g-3">
          {theatres.map(theatre => (
            <div key={theatre._id} className="col-12 col-md-4">
              <div className="cinema-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center gap-2 text-danger mb-2 small fw-semibold">
                    <FaMapMarkerAlt /> {theatre.city}
                  </div>
                  <h5 className="text-white fw-bold mb-2">{theatre.name}</h5>
                  <p className="text-secondary small mb-3">{theatre.address}</p>
                </div>
                <div className="d-flex flex-wrap gap-1">
                  {theatre.facilities?.slice(0, 3).map((f, i) => (
                    <span key={i} className="badge bg-dark border border-secondary text-secondary" style={{ fontSize: '0.68rem' }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
