import { Link } from 'react-router-dom';
import { ASSET_BASE } from '../api/client';

const CONDITION_LABELS = {
  new: 'New',
  like_new: 'Like New',
  used: 'Used',
  fair: 'Fair'
};

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  // Seed data uses full external URLs; uploaded images are relative paths
  // like "/uploads/xyz.jpg" that need the API's base URL prepended.
  return imageUrl.startsWith('http') ? imageUrl : `${ASSET_BASE}${imageUrl}`;
}

export default function ListingCard({ listing, showActions = false, onDelete, onMarkSold, onRelist, sellerLabel }) {
  const sellerName = sellerLabel || listing.seller?.name || 'Unknown seller';
  const imageSrc = resolveImageUrl(listing.image_url);
  const categoryLabel = listing.category === 'other' && listing.custom_category
    ? listing.custom_category
    : listing.category;

  return (
    <div className="listing-card">
      <Link to={`/listings/${listing.id}`} className="listing-card-link">
        <div className="listing-image-wrap">
          {imageSrc ? (
            <img src={imageSrc} alt={listing.title} className="listing-image" />
          ) : (
            <div className="listing-image-placeholder">No photo yet</div>
          )}
        </div>

        <span className="tag-category">{categoryLabel}</span>
        <h3 className="listing-title">{listing.title}</h3>
        <p className="listing-desc">{listing.description || 'No description provided'}</p>
        <div className="listing-price">GHS {Number(listing.price).toFixed(2)}</div>

        <div className="listing-meta">
          <span>{sellerName} &middot; {CONDITION_LABELS[listing.item_condition] || listing.item_condition}</span>
          <span className={`listing-status ${listing.status}`}>{listing.status}</span>
        </div>
      </Link>

      {showActions && (
        <div className="listing-actions">
          {listing.status === 'available' && (
            <button className="link-btn" onClick={() => onMarkSold(listing.id)}>Mark as sold</button>
          )}
          {listing.status === 'sold' && (
            <button className="link-btn" onClick={() => onRelist(listing.id)}>Relist</button>
          )}
          <button className="link-btn danger" onClick={() => onDelete(listing.id)}>Delete</button>
        </div>
      )}
    </div>
  );
}
