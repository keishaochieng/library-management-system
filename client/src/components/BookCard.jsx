import { Link } from 'react-router-dom';

export default function BookCard({ book }) {
  const available = book.copiesAvailable > 0;

  return (
    <Link to={`/books/${book.id}`} className="card">
      <h3>{book.title}</h3>
      <p className="author">{book.author}</p>
      {book.genre && <span className="tag">{book.genre.name}</span>}
      <p className={available ? 'avail yes' : 'avail no'}>
        {available ? `${book.copiesAvailable} available` : 'Checked out'}
      </p>
    </Link>
  );
}
