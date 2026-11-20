import { Route, Routes } from 'react-router-dom';
import { ReadingListProvider } from './context/ReadingListContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import BookDetail from './pages/BookDetail.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ReadingListPage from './pages/ReadingListPage.jsx';
import SpaceBookingPage from './pages/SpaceBookingPage.jsx';

export default function App() {
  return (
    <ReadingListProvider>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reading-list" element={<ReadingListPage />} />
          <Route
            path="/book-space"
            element={
              <ProtectedRoute>
                <SpaceBookingPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<p className="state">Page not found.</p>} />
        </Routes>
      </main>
    </ReadingListProvider>
  );
}
