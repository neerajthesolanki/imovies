import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaClock, FaTicketAlt } from 'react-icons/fa';

const MovieCard = ({ movie }) => {
  const fallbackPoster = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';

  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="col-6 col-md-4 col-lg-3 mb-4">
      <div className="cinema-card h-100 d-flex flex-column">
        {/* Poster Container */}
        <div className="position-relative overflow-hidden" style={{ paddingTop: '145%' }}>
          <img
            src={movie.posterUrl || fallbackPoster}
            alt={movie.title}
            onError={(e) => { e.target.src = fallbackPoster; }}
            className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover transition-transform"
            style={{ transition: 'transform 0.4s ease' }}
          />

          {/* Rating Badge */}
          <div
            className="position-absolute top-2 start-2 d-flex align-items-center gap-1 px-2 py-1 rounded-2 shadow"
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#fbbf24',
              top: '10px',
              left: '10px'
            }}
          >
            <FaStar size={11} />
            <span>{movie.rating ? movie.rating.toFixed(1) : '8.5'}</span>
          </div>

          {/* Certificate Badge */}
          <div
            className="position-absolute px-2 py-0 rounded"
            style={{
              background: 'rgba(229, 9, 20, 0.9)',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 700,
              top: '10px',
              right: '10px'
            }}
          >
            {movie.certificate || 'UA'}
          </div>
        </div>

        {/* Content */}
        <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
          <div>
            <h6 className="text-white fw-bold mb-1 text-truncate" title={movie.title}>
              {movie.title}
            </h6>
            <div className="d-flex align-items-center gap-2 text-secondary mb-2" style={{ fontSize: '0.75rem' }}>
              <span>{movie.language}</span>
              <span>•</span>
              <span className="d-flex align-items-center gap-1">
                <FaClock size={10} /> {formatDuration(movie.duration || 120)}
              </span>
            </div>

            {/* Genres */}
            <div className="d-flex flex-wrap gap-1 mb-3">
              {movie.genre && movie.genre.slice(0, 2).map((g, i) => (
                <span
                  key={i}
                  className="badge rounded-pill"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#cbd5e1',
                    fontSize: '0.65rem',
                    fontWeight: 500
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Action */}
          <Link
            to={`/movies/${movie._id}`}
            className="btn btn-cinema btn-sm w-100 py-2 d-flex align-items-center justify-content-center gap-2"
          >
            <FaTicketAlt size={12} />
            <span>Book Tickets</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
