import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    fetch(`${API_URL}/books/${id}`, { signal: controller.signal })
      .then((res) => {
        if (res.status === 404) throw new Error('Book not found.');
        if (!res.ok) throw new Error('Could not load this book.');
        return res.json();
      })
      .then((data) => {
        setBook(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Could not load this book.');
        setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  return (
    <section>
      <Link to="/" className="back">
        &larr; Back to catalog
      </Link>

      {loading && <p className="state">Loading...</p>}
      {error && <p className="state error">{error}</p>}

      {book && (
        <article className="detail">
          <h1>{book.title}</h1>
          <p className="author">by {book.author}</p>
          <dl>
            <dt>Genre</dt>
            <dd>{book.genre ? book.genre.name : 'Unknown'}</dd>
            <dt>ISBN</dt>
            <dd>{book.isbn}</dd>
            {book.publishedYear && (
              <>
                <dt>Published</dt>
                <dd>{book.publishedYear}</dd>
              </>
            )}
            <dt>Copies</dt>
            <dd>
              {book.copiesAvailable} available of {book.totalCopies}
            </dd>
          </dl>
        </article>
      )}
    </section>
  );
}
