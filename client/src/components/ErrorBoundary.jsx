import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5 my-5 text-center">
          <div className="cinema-card p-5 mx-auto" style={{ maxWidth: '600px' }}>
            <h2 className="text-danger mb-3">Something went wrong</h2>
            <p className="text-secondary mb-4">
              An unexpected display issue occurred in the cinema view. Our projectionists have been notified!
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button
                className="btn btn-cinema-outline"
                onClick={() => this.setState({ hasError: false })}
              >
                Try Again
              </button>
              <Link to="/" className="btn btn-cinema">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
