import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, ASSET_BASE } from '../api/client';

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  return imageUrl.startsWith('http') ? imageUrl : `${ASSET_BASE}${imageUrl}`;
}

function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getConversations()
      .then((res) => setConversations(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="messages-page container">
      <h2>Messages</h2>

      {loading && <p className="loading">Loading conversations...</p>}
      {error && <p className="empty-state">{error}</p>}
      {!loading && !error && conversations.length === 0 && (
        <p className="empty-state">No conversations yet. Message a seller from a listing to get started.</p>
      )}

      <div className="conversation-list">
        {conversations.map((conv) => {
          const imageSrc = resolveImageUrl(conv.listing.image_url);
          return (
            <Link
              key={`${conv.listingId}-${conv.buyerId}`}
              to={`/chat/${conv.listingId}/${conv.buyerId}`}
              className="conversation-item"
            >
              <div className="conversation-thumb">
                {imageSrc ? (
                  <img src={imageSrc} alt={conv.listing.title} />
                ) : (
                  <div className="listing-image-placeholder">No photo</div>
                )}
              </div>
              <div className="conversation-info">
                <div className="conversation-top-row">
                  <strong>{conv.otherParticipant?.name || 'Unknown user'}</strong>
                  <span className="conversation-time">{formatTime(conv.lastMessage?.createdAt)}</span>
                </div>
                <div className="conversation-listing-title">{conv.listing.title}</div>
                <div className="conversation-preview">
                  {conv.lastMessage ? conv.lastMessage.body : 'No messages yet'}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
