const CONDITION_LABELS = {
  new: 'New',
  like_new: 'Like New',
  used: 'Used',
  fair: 'Fair'
};

export default function ListingCard({ listing, showActions = false, onDelete, onMarkSold }) {
  const sellerName = listing.seller?.name || 'Unknown seller';

  return (
    <div className="listing-card">
      <span className="tag-category">{listing.category}</span>
      <h3 className="listing-title">{listing.title}</h3>
      <p className="listing-desc">{listing.description || 'No description provided'}</p>
      <div className="listing-price">GHS {Number(listing.price).toFixed(2)}</div>

      <div className="listing-meta">
        <span>{sellerName} &middot; {CONDITION_LABELS[listing.item_condition] || listing.item_condition}</span>
        <span className={`listing-status ${listing.status}`}>{listing.status}</span>
      </div>

      {showActions && (
        <div className="listing-actions">
          {listing.status === 'available' && (
            <button className="link-btn" onClick={() => onMarkSold(listing.id)}>Mark as sold</button>
          )}
          <button className="link-btn danger" onClick={() => onDelete(listing.id)}>Delete</button>
        </div>
      )}
    </div>
  );
}
