import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useReadingList } from '../context/ReadingListContext.jsx';

export default function Navbar() {
  const { count } = useReadingList();
  const navigate = useNavigate();
  useLocation(); // re-renders the navbar after login/logout (the page changes)

  const loggedIn = Boolean(localStorage.getItem('token'));

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <header className="site-header">
      <nav className="nav">
        <Link to="/" className="logo">
          Library Catalog
        </Link>

        <div className="nav-links">
          <Link to="/">Books</Link>
          <Link to="/reading-list">Reading list ({count})</Link>
          <Link to="/book-space">Book a space</Link>
          {loggedIn ? (
            <button type="button" className="link-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
