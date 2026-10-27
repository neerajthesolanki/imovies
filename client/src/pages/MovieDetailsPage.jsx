import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaStar, FaClock, FaCalendarAlt, FaPlay, FaMapMarkerAlt, FaTicketAlt } from 'react-icons/fa';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  });

  // Generate 4 consecutive dates for the date picker
  const dateOptions = Array.from({ length: 4 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return {
      dateString: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      formatted: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    };
  });

  useEffect(() => {
    const loadMovieDetailsAndShows = async () => {
      setLoading(true);
      try {
        const [movieRes, showsRes] = await Promise.all([
          api.get(`/movies/${id}`),
          api.get('/shows', { params: { movieId: id, date: selectedDate } })
        ]);
        setMovie(movieRes.data?.data || null);
        setShows(showsRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load movie details or shows:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMovieDetailsAndShows();
  }, [id, selectedDate]);

  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  // Group shows by theatre
  const theatreMap = {};
  shows.forEach(show => {
    const theatreId = show.theatre?._id || show.theatre;
    const theatreName = show.theatre?.name || 'Cinema Multiplex';
    const theatreAddress = show.theatre?.address || '';
    const theatreCity = show.theatre?.city || '';

    if (!theatreMap[theatreId]) {
      theatreMap[theatreId] = {
        name: theatreName,
        address: theatreAddress,
        city: theatreCity,
        shows: []
      };
    }
    theatreMap[theatreId].shows.push(show);
  });

  if (loading) {
    return <LoadingSpinner message="Loading movie details and cinema showtimes..." />;
  }

  if (!movie) {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-white">Movie not found</h3>
        <Link to="/movies" className="btn btn-cinema mt-3">Browse Movies</Link>
      </div>
    );
  }

  return (
    <div className="movie-details-page pb-5">
      {/* Backdrop Header */}
      <div
        className="position-relative py-5"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(8, 12, 20, 0.75), rgba(8, 12, 20, 0.98)), url(${movie.backdropUrl || movie.posterUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '400px'
        }}
      >
        <div className="container">
          <div className="row g-4 align-items-center">
            {/* Poster */}
            <div className="col-12 col-md-4 col-lg-3 text-center text-md-start">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="img-fluid rounded-4 shadow-2xl border border-secondary"
                style={{ maxHeight: '380px', objectFit: 'cover' }}
              />
            </div>

            {/* Info */}
            <div className="col-12 col-md-8 col-lg-9">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge bg-danger px-3 py-1 fw-bold">{movie.certificate || 'UA'}</span>
                <span className="badge bg-dark border border-secondary text-warning d-flex align-items-center gap-1">
                  <FaStar size={11} /> {movie.rating ? movie.rating.toFixed(1) : '8.5'} / 10
                </span>
                <span className="badge bg-dark border border-secondary text-light">
                  {movie.language}
                </span>
                <span className="text-secondary small d-flex align-items-center gap-1 ms-2">
                  <FaClock size={12} /> {formatDuration(movie.duration || 120)}
                </span>
              </div>

              <h1 className="display-5 fw-extrabold text-white mb-2">{movie.title}</h1>

              <div className="d-flex flex-wrap gap-2 mb-3">
                {movie.genre?.map((g, i) => (
                  <span key={i} className="badge bg-secondary bg-opacity-25 text-light px-3 py-1 rounded-pill">
                    {g}
                  </span>
                ))}
              </div>

              <p className="text-light text-opacity-80 fs-6 mb-4" style={{ maxWidth: '750px' }}>
                {movie.description}
              </p>

              {/* Cast & Crew */}
              {movie.cast && movie.cast.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-secondary small fw-bold text-uppercase mb-2">Starring Cast</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {movie.cast.map((actor, i) => (
                      <span key={i} className="badge bg-dark border border-secondary text-light py-2 px-3">
                        <strong className="text-white">{actor.name}</strong> as {actor.role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {movie.trailerUrl && (
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-cinema-outline d-inline-flex align-items-center gap-2"
                >
                  <FaPlay size={13} /> Watch Official Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes & Booking Section */}
      <div className="container mt-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h3 className="text-white fw-bold mb-0">Select Date & Showtimes</h3>
        </div>

        {/* Date Tabs */}
        <div className="d-flex gap-2 mb-4 overflow-x-auto pb-2">
          {dateOptions.map((opt) => (
            <button
              key={opt.dateString}
              type="button"
              className={`btn ${
                selectedDate === opt.dateString ? 'btn-cinema' : 'btn-cinema-outline'
              } text-center px-4 py-2`}
              style={{ minWidth: '110px' }}
              onClick={() => setSelectedDate(opt.dateString)}
            >
              <div className="small fw-bold">{opt.dayName}</div>
              <div className="fs-6 fw-extrabold">{opt.formatted}</div>
            </button>
          ))}
        </div>

        {/* Theatres & Shows List */}
        {Object.keys(theatreMap).length === 0 ? (
          <div className="cinema-card p-5 text-center my-4">
            <FaCalendarAlt size={36} className="text-secondary mb-3" />
            <h5 className="text-white">No Showtimes Available For This Date</h5>
            <p className="text-secondary small">Try choosing another day or check back shortly.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {Object.entries(theatreMap).map(([tId, theatreData]) => (
              <div key={tId} className="cinema-card p-4">
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3 pb-3 border-bottom border-secondary border-opacity-25">
                  <div>
                    <h5 className="text-white fw-bold mb-1">{theatreData.name}</h5>
                    <div className="text-secondary small d-flex align-items-center gap-2">
                      <FaMapMarkerAlt className="text-danger" /> {theatreData.address}
                    </div>
                  </div>
                  <span className="badge bg-dark border border-secondary text-secondary">
                    M-Ticket Available • Food & Beverage
                  </span>
                </div>

                {/* Showtime Pills */}
                <div className="d-flex flex-wrap gap-3">
                  {theatreData.shows.map((show) => (
                    <button
                      key={show._id}
                      type="button"
                      className="btn btn-cinema-outline d-flex flex-column align-items-center px-3 py-2"
                      onClick={() => navigate(`/seat-selection/${show._id}`)}
                    >
                      <span className="fw-bold text-white fs-6">{show.startTime}</span>
                      <span className="text-secondary" style={{ fontSize: '0.68rem' }}>
                        {show.screen?.name || 'Screen 1'} • {show.format || '2D'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailsPage;
