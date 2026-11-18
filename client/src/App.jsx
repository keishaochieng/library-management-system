import { Link, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import BookDetail from './pages/BookDetail.jsx';

export default function App() {
  return (
    <>
      <header className="site-header">
        <Link to="/" className="logo">
          Library Catalog
        </Link>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="*" element={<p className="state">Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
