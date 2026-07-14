import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ChatWidgetProvider } from './context/ChatWidgetContext';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ListingDetail from './pages/ListingDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import PostListing from './pages/PostListing';
import EditListing from './pages/EditListing';
import MyListings from './pages/MyListings';
import Account from './pages/Account';
import Messages from './pages/Messages';
import Chat from './pages/Chat';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ChatWidgetProvider>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/listings/:id" element={<ListingDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/post"
                element={
                  <ProtectedRoute>
                    <PostListing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/listings/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditListing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-listings"
                element={
                  <ProtectedRoute>
                    <MyListings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                }
              />
              {/* Direct deep-links, kept for shareable URLs — the floating
                  widget is now the primary way most people will reach chat */}
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:listingId/:buyerId"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <footer className="site-footer">
            <p>CampusCart &middot; Built by Harruna Abdul Kudus &middot; Codveda Full-Stack Internship, Level 3</p>
          </footer>
          <ChatWidget />
        </ChatWidgetProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
