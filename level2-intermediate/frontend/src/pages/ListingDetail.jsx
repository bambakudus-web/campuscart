import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, ASSET_BASE } from '../api/client';
import { useAuth } from '../context/AuthContext';

const CONDITION_LABELS = {
  new: 'New',
  like_new: 'Like New',
  used: 'Used',
  fair: 'Fair'
};

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  return imageUrl.startsWith('http') ? imageUrl : `${ASSET_BASE}${imageUrl}`;
}

// Builds a WhatsApp deep link with a pre-filled message. This is the
// interim "contact seller" mechanism for Level 2 — Level 3 replaces this
// with real-time in-app chat via Socket.io.
function buildWhatsAppLink(phone, listingTitle) {
  const digitsOnly = (phone || '').replace(/\D/g, '');
  const international = digitsOnly.startsWith('0') ? `233${digitsOnly.slice(1)}` : digitsOnly;
  const message = encodeURIComponent(`Hi! I saw your "${listingTitle}" listing on CampusCart and I'm interested.`);
  return `https://wa.me/${international}?text=${message}`;
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadListing();
  }, [id]);

  function loadListing() {
    setLoading(true);
    api.getListingById(id)
      .then((res) => setListing(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleDelete() {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    try {
      await api.deleteListing(id);
      navigate('/my-listings');
    } catch (err) {
      alert(`Could not delete: ${err.message}`);
    }
  }

  async function handleMarkSold() {
    try {
      const res = await api.updateListing(id, { status: 'sold' });
      setListing(res.data);
    } catch (err) {
      alert(`Could not update: ${err.message}`);
    }
  }

  async function handleRelist() {
    try {
      const res = await api.updateListing(id, { status: 'available' });
      setListing(res.data);
    } catch (err) {
      alert(`Could not relist: ${err.message}`);
    }
  }

  if (loading) return <p className="loading container">Loading listing...</p>;
  if (error) return <p className="empty-state container">{error}</p>;
  if (!listing) return <p className="empty-state container">Listing not found.</p>;

  const imageSrc = resolveImageUrl(listing.image_url);
  // Ownership check: only show edit/delete/sold controls to the listing's
  // own seller. Everyone else sees the Contact Seller option instead.
  const isOwner = user && listing.seller && user.id === listing.seller.id;

  return (
    <section className="listing-detail container">
      <Link to="/" className="back-link">&larr; Back to listings</Link>

      <div className="detail-grid">
        <div className="detail-image-wrap">
          {imageSrc ? (
            <img src={imageSrc} alt={listing.title} className="detail-image" />
          ) : (
            <div className="listing-image-placeholder detail-placeholder">No photo yet</div>
          )}
        </div>

        <div className="detail-info">
          <span className="tag-category">{listing.category}</span>
          <h2 className="detail-title">{listing.title}</h2>
          <div className="listing-price detail-price">GHS {Number(listing.price).toFixed(2)}</div>

          <p className="detail-description">{listing.description || 'No description provided'}</p>

          <div className="detail-meta-list">
            <div><strong>Condition:</strong> {CONDITION_LABELS[listing.item_condition] || listing.item_condition}</div>
            <div><strong>Status:</strong> <span className={`listing-status ${listing.status}`}>{listing.status}</span></div>
            <div><strong>Seller:</strong> {listing.seller?.name || 'Unknown'}</div>
          </div>

          {isOwner ? (
            <div className="owner-actions">
              <Link to={`/listings/${id}/edit`} className="nav-cta">Edit Listing</Link>
              {listing.status === 'available' ? (
                <button className="link-btn" onClick={handleMarkSold}>Mark as sold</button>
              ) : (
                <button className="link-btn" onClick={handleRelist}>Relist</button>
              )}
              <button className="link-btn danger" onClick={handleDelete}>Delete</button>
            </div>
          ) : (
            <>
              {listing.status === 'available' && listing.seller?.phone && (
                <a
                  href={buildWhatsAppLink(listing.seller.phone, listing.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-seller-btn"
                >
                  💬 Contact Seller on WhatsApp
                </a>
              )}
              {listing.status === 'sold' && (
                <p className="empty-state">This item has already been sold.</p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
