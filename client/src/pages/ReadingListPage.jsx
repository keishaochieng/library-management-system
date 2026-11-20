import { Link } from 'react-router-dom';
import { useReadingList } from '../context/ReadingListContext.jsx';

export default function ReadingListPage() {
  const { readingList, removeBook, clearList } = useReadingList();

  return (
    <section>
      <h1>My reading list</h1>

      {readingList.length === 0 ? (
        <p className="state">
          Your list is empty. <Link to="/">Browse books</Link> and add some.
        </p>
      ) : (
        <>
          <ul className="list">
            {readingList.map((book) => (
              <li key={book.id} className="list-item">
                <Link to={`/books/${book.id}`}>
                  <strong>{book.title}</strong> by {book.author}
                </Link>
                <button
                  type="button"
                  className="btn small"
                  onClick={() => removeBook(book.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="btn secondary" onClick={clearList}>
            Clear list
          </button>
        </>
      )}
    </section>
  );
}
