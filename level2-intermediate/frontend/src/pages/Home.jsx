import { useState, useEffect } from 'react';
import { api } from '../api/client';
import ListingCard from '../components/ListingCard';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadListings(category);
  }, [category]);

  async function loadListings(cat) {
    setLoading(true);
    setError('');
    try {
      const query = cat ? `?category=${cat}` : '';
      const res = await api.getListings(query);
      setListings(res.data);
    } catch (err) {
      setError(`Could not load listings. Is the API running? (${err.message})`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="browse-listings container">
      <div className="browse-header">
        <h2>Browse Listings</h2>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="books">Books</option>
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="clothing">Clothing</option>
          <option value="other">Other</option>
        </select>
      </div>

      {loading && <p className="loading">Loading listings...</p>}
      {error && <p className="empty-state">{error}</p>}
      {!loading && !error && listings.length === 0 && (
        <p className="empty-state">No listings yet. Be the first to post one!</p>
      )}

      <div className="listings-grid">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
