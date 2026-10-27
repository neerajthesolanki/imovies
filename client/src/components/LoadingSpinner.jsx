import React from 'react';

const LoadingSpinner = ({ message = 'Loading cinema experience...' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5">
      <div
        className="spinner-border text-danger mb-3"
        role="status"
        style={{ width: '3rem', height: '3rem', borderWidth: '0.25rem' }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-secondary small fw-medium">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
