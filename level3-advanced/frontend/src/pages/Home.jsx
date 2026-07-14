import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../api/client';
import ListingCard from '../components/ListingCard';
import HeroCarousel from '../components/HeroCarousel';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [listings, setListings] = useState([]);
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Debounce the search box so we're not firing a request on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      loadListings(category, searchInput);

      // Keep the URL in sync so filters are shareable/bookmarkable
      const params = {};
      if (category) params.category = category;
      if (searchInput) params.search = searchInput;
      setSearchParams(params, { replace: true });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, searchInput]);

  async function loadListings(cat, search) {
    setLoading(true);
    setError('');
    try {
      // Public browse only shows items still available to buy — sold items
      // are hidden here but remain visible to the seller in "My Listings".
      const params = new URLSearchParams({ status: 'available' });
      if (cat) params.set('category', cat);
      if (search) params.set('search', search);
      const res = await api.getListings(`?${params.toString()}`);
      setListings(res.data);
    } catch (err) {
      setError(`Could not load listings. Is the API running? (${err.message})`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <HeroCarousel />

      <section className="browse-listings container">
        <div className="browse-header">
          <h2>Browse Listings</h2>

          <div className="browse-controls">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search for an item..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="books">Books</option>
              <option value="electronics">Electronics</option>
              <option value="furniture">Furniture</option>
              <option value="clothing">Clothing</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {loading && <p className="loading">Loading listings...</p>}
        {error && <p className="empty-state">{error}</p>}
        {!loading && !error && listings.length === 0 && (
          <p className="empty-state">
            {searchInput ? `No listings match "${searchInput}".` : 'No listings yet. Be the first to post one!'}
          </p>
        )}

        <div className="listings-grid">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </>
  );
}
