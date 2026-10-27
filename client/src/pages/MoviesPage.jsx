import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || 'All');
  const [language, setLanguage] = useState(searchParams.get('language') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'rating_desc');
  const [currentPage, setCurrentPage] = useState(1);

  const genresList = ['All', 'Action', 'Adventure', 'Drama', 'Sci-Fi', 'Biography', 'History', 'Crime', 'Comedy', 'Animation'];
  const languagesList = ['All', 'English', 'Hindi'];
  const statusList = [
    { label: 'All Releases', value: 'All' },
    { label: 'Now Showing', value: 'now_showing' },
    { label: 'Coming Soon', value: 'coming_soon' }
  ];

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        ...(search && { search }),
        ...(genre !== 'All' && { genre }),
        ...(language !== 'All' && { language }),
        ...(status !== 'All' && { status }),
        ...(sort && { sort })
      };

      const res = await api.get('/movies', { params });
      setMovies(res.data?.data || []);
      setMeta(res.data?.meta || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      console.error('Failed to fetch movies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [genre, language, status, sort, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMovies();
  };

  const clearAllFilters = () => {
    setSearch('');
    setGenre('All');
    setLanguage('All');
    setStatus('All');
    setSort('rating_desc');
    setCurrentPage(1);
  };

  return (
    <div className="container py-4 pb-5">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-white fw-bold display-6 mb-1">Explore Movies</h1>
        <p className="text-secondary small">Filter currently screening movies and upcoming releases</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="cinema-card p-3 p-md-4 mb-4">
        <form onSubmit={handleSearchSubmit}>
          <div className="row g-3 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-md-4 position-relative">
              <input
                type="text"
                className="form-control cinema-input ps-5"
                placeholder="Search movies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FaSearch
                className="position-absolute text-muted"
                style={{ top: '50%', left: '1.25rem', transform: 'translateY(-50%)' }}
              />
            </div>

            {/* Genre Select */}
            <div className="col-6 col-md-2">
              <select
                className="form-select cinema-input"
                value={genre}
                onChange={(e) => { setGenre(e.target.value); setCurrentPage(1); }}
              >
                {genresList.map(g => (
                  <option key={g} value={g}>{g === 'All' ? 'All Genres' : g}</option>
                ))}
              </select>
            </div>

            {/* Language Select */}
            <div className="col-6 col-md-2">
              <select
                className="form-select cinema-input"
                value={language}
                onChange={(e) => { setLanguage(e.target.value); setCurrentPage(1); }}
              >
                {languagesList.map(l => (
                  <option key={l} value={l}>{l === 'All' ? 'All Languages' : l}</option>
                ))}
              </select>
            </div>

            {/* Status Select */}
            <div className="col-6 col-md-2">
              <select
                className="form-select cinema-input"
                value={status}
                onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
              >
                {statusList.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="col-6 col-md-2">
              <select
                className="form-select cinema-input"
                value={sort}
                onChange={(e) => { setSort(e.target.value); setCurrentPage(1); }}
              >
                <option value="rating_desc">Highest Rated</option>
                <option value="rating_asc">Lowest Rated</option>
                <option value="title_asc">Title (A - Z)</option>
                <option value="title_desc">Title (Z - A)</option>
              </select>
            </div>
          </div>
        </form>

        {/* Active filter pills */}
        {(genre !== 'All' || language !== 'All' || status !== 'All' || search) && (
          <div className="d-flex align-items-center gap-2 mt-3 pt-3 border-top" style={{ borderColor: 'var(--border-color)' }}>
            <span className="text-secondary small fw-semibold">Active Filters:</span>
            {search && <span className="badge bg-secondary">Search: "{search}"</span>}
            {genre !== 'All' && <span className="badge bg-danger">{genre}</span>}
            {language !== 'All' && <span className="badge bg-info text-dark">{language}</span>}
            {status !== 'All' && <span className="badge bg-warning text-dark">{status}</span>}
            <button
              className="btn btn-link text-danger p-0 ms-auto small text-decoration-none d-flex align-items-center gap-1"
              onClick={clearAllFilters}
            >
              <FaTimes size={12} /> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Movies Grid */}
      {loading ? (
        <LoadingSpinner message="Searching screening schedules..." />
      ) : movies.length === 0 ? (
        <div className="cinema-card p-5 text-center my-4">
          <FaFilter size={36} className="text-danger mb-3" />
          <h4 className="text-white">No Movies Match Your Filter Criteria</h4>
          <p className="text-secondary small mb-3">Try adjusting your filters or search terms.</p>
          <button className="btn btn-cinema btn-sm" onClick={clearAllFilters}>
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="row g-3 g-md-4">
            {movies.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>

          {/* Pagination */}
          {meta.pages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-5">
              <button
                className="btn btn-cinema-outline btn-sm px-3"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              {Array.from({ length: meta.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`btn btn-sm ${
                    currentPage === page ? 'btn-cinema' : 'btn-cinema-outline'
                  } px-3`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="btn btn-cinema-outline btn-sm px-3"
                disabled={currentPage === meta.pages}
                onClick={() => setCurrentPage(p => Math.min(meta.pages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MoviesPage;
