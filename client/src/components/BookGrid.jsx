import { useEffect, useState } from 'react';
import BookCard from './BookCard.jsx';

const API_URL = import.meta.env.VITE_API_URL;

// Stretch: skeleton cards instead of a plain "Loading..." message
function SkeletonGrid() {
  return (
    <div className="grid" aria-busy="true" aria-label="Loading books">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card skeleton">
          <div className="sk-line wide" />
          <div className="sk-line" />
          <div className="sk-line short" />
        </div>
      ))}
    </div>
  );
}

export default function BookGrid({ genreId, search, sort }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (genreId) params.set('genreId', genreId);
    if (search) params.set('search', search);
    params.set('limit', '100');

    setLoading(true);
    setError('');

    fetch(`${API_URL}/books?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        return res.json();
      })
      .then((json) => {
        // The API returns { data: [...], meta: {...} }
        setBooks(Array.isArray(json) ? json : json.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // a newer request replaced this one
        setError('Could not load books. Is the server running?');
        setLoading(false);
      });

    return () => controller.abort();
  }, [genreId, search]);

  if (loading) return <SkeletonGrid />;
  if (error) return <p className="state error">{error}</p>;
  if (books.length === 0) {
    return <p className="state">No books match your search.</p>;
  }

  // Stretch: sort control (client-side)
  const shown = sort
    ? [...books].sort((a, b) => a[sort].localeCompare(b[sort]))
    : books;

  return (
    <div className="grid">
      {shown.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
