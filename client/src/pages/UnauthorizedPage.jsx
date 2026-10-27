import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';

const UnauthorizedPage = () => {
  return (
    <div className="container py-5 my-auto text-center">
      <div className="cinema-card p-5 mx-auto" style={{ maxWidth: '520px' }}>
        <div className="d-inline-flex p-3 rounded-circle bg-danger bg-opacity-20 text-danger mb-3">
          <FaShieldAlt size={48} />
        </div>
        <h2 className="text-white fw-bold mb-2">Access Denied (403)</h2>
        <p className="text-secondary small mb-4">
          You do not have the necessary administrator credentials to access this cinema management section.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/" className="btn btn-cinema">
            Return Home
          </Link>
          <Link to="/login" className="btn btn-cinema-outline">
            Sign In with Admin Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
