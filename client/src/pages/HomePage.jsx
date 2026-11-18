import { useEffect, useState } from 'react';
import BookGrid from '../components/BookGrid.jsx';
import SearchBar from '../components/SearchBar.jsx';

const API_URL = import.meta.env.VITE_API_URL;

export default function HomePage() {
  // Shared filter state lives here and is passed down to the children
  const [search, setSearch] = useState('');
  const [genreId, setGenreId] = useState('');
  const [sort, setSort] = useState(''); // stretch: '', 'title' or 'author'
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/genres`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setGenres)
      .catch(() => setGenres([]));
  }, []);

  return (
    <section>
      <h1>Browse books</h1>

      <div className="controls">
        <SearchBar onSearch={setSearch} />

        <select
          aria-label="Filter by genre"
          value={genreId}
          onChange={(e) => setGenreId(e.target.value)}
        >
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort books"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Sort: default</option>
          <option value="title">Sort: title</option>
          <option value="author">Sort: author</option>
        </select>
      </div>

      <BookGrid genreId={genreId} search={search} sort={sort} />
    </section>
  );
}
