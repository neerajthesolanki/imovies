import React from 'react';
import { Link } from 'react-router-dom';
import { FaFilm } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <div className="container py-5 my-auto text-center">
      <div className="cinema-card p-5 mx-auto" style={{ maxWidth: '520px' }}>
        <div className="d-inline-flex p-3 rounded-circle bg-secondary bg-opacity-20 text-danger mb-3">
          <FaFilm size={48} />
        </div>
        <h1 className="text-white display-4 fw-extrabold mb-1">404</h1>
        <h4 className="text-white fw-bold mb-2">Screening Reel Not Found</h4>
        <p className="text-secondary small mb-4">
          The cinema page you are looking for has either been moved, cancelled, or does not exist.
        </p>
        <Link to="/" className="btn btn-cinema px-4">
          Back to Box Office Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
