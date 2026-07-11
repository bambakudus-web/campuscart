import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import ListingCard from '../components/ListingCard';

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMine();
  }, []);

  async function loadMine() {
    setLoading(true);
    try {
      const res = await api.getMyListings();
      setListings(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this listing?')) return;
    try {
      await api.deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert(`Could not delete: ${err.message}`);
    }
  }

  async function handleMarkSold(id) {
    try {
      const res = await api.updateListing(id, { status: 'sold' });
      setListings((prev) => prev.map((l) => (l.id === id ? res.data : l)));
    } catch (err) {
      alert(`Could not update: ${err.message}`);
    }
  }

  return (
    <section className="browse-listings container">
      <div className="browse-header">
        <h2>My Listings</h2>
        <Link to="/post" className="nav-cta">+ New Listing</Link>
      </div>

      {loading && <p className="loading">Loading your listings...</p>}
      {error && <p className="empty-state">{error}</p>}
      {!loading && !error && listings.length === 0 && (
        <p className="empty-state">You haven't posted anything yet.</p>
      )}

      <div className="listings-grid">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            showActions
            onDelete={handleDelete}
            onMarkSold={handleMarkSold}
          />
        ))}
      </div>
    </section>
  );
}
