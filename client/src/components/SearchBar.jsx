import { useEffect, useState } from 'react';

export default function SearchBar({ onSearch, delay = 400 }) {
  const [value, setValue] = useState('');

  // Debounce: wait until the user stops typing before calling onSearch.
  // The cleanup cancels the previous timer on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value.trim());
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, onSearch]);

  return (
    <input
      type="search"
      className="search"
      placeholder="Search by title or author..."
      aria-label="Search books"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
