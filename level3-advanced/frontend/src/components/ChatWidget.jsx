import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, ArrowLeft, Send, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChatWidget } from '../context/ChatWidgetContext';
import { api, ASSET_BASE } from '../api/client';

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  return imageUrl.startsWith('http') ? imageUrl : `${ASSET_BASE}${imageUrl}`;
}

export default function ChatWidget() {
  const { user } = useAuth();
  const {
    isOpen, view, conversations, active, messages, loadingMessages,
    toggleWidget, closeWidget, backToList, openConversationThread, sendMessage
  } = useChatWidget();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // "Compose" mode lets someone start a brand-new conversation from the
  // widget itself, instead of only being able to continue existing threads.
  // Since every CampusCart chat is about a specific item, starting one means
  // picking which listing (and therefore which seller) to message.
  const [composing, setComposing] = useState(false);
  const [composeSearch, setComposeSearch] = useState('');
  const [composeResults, setComposeResults] = useState([]);
  const [composeLoading, setComposeLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!composing) return;
    setComposeLoading(true);
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ status: 'available' });
      if (composeSearch) params.set('search', composeSearch);
      api.getListings(`?${params.toString()}`)
        .then((res) => {
          // Can't message yourself about your own listing
          setComposeResults(res.data.filter((l) => l.seller?.id !== user.id));
        })
        .catch(() => setComposeResults([]))
        .finally(() => setComposeLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [composing, composeSearch, user?.id]);

  // The widget only makes sense for logged-in users — guests have nowhere to chat from
  if (!user) return null;

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  }

  function startComposing() {
    setComposeSearch('');
    setComposeResults([]);
    setComposing(true);
  }

  function pickListingToMessage(listing) {
    setComposing(false);
    openConversationThread({
      listingId: listing.id,
      buyerId: user.id,
      otherParticipant: listing.seller,
      listingTitle: listing.title
    });
  }

  const showingCompose = view === 'list' && composing;

  return (
    <>
      <button className="chat-fab" onClick={toggleWidget} aria-label={isOpen ? 'Close messages' : 'Open messages'}>
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {isOpen && (
        <div className="chat-widget-panel">
          {view === 'list' && !showingCompose && (
            <>
              <div className="chat-widget-header">
                <strong>Messages</strong>
                <div className="chat-widget-header-actions">
                  <button className="drawer-close" onClick={startComposing} aria-label="New message" title="New message">
                    <Plus size={20} />
                  </button>
                  <button className="drawer-close" onClick={closeWidget} aria-label="Close">
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="chat-widget-body">
                {conversations.length === 0 ? (
                  <div className="widget-empty">
                    <p>No conversations yet.</p>
                    <button className="widget-start-btn" onClick={startComposing}>
                      <Plus size={16} /> Start a new message
                    </button>
                  </div>
                ) : (
                  <div className="widget-conversation-list">
                    {conversations.map((conv) => {
                      const imageSrc = resolveImageUrl(conv.listing.image_url);
                      return (
                        <button
                          key={`${conv.listingId}-${conv.buyerId}`}
                          className="widget-conversation-item"
                          onClick={() => openConversationThread({
                            listingId: conv.listingId,
                            buyerId: conv.buyerId,
                            otherParticipant: conv.otherParticipant,
                            listingTitle: conv.listing.title
                          })}
                        >
                          <div className="conversation-thumb">
                            {imageSrc ? (
                              <img src={imageSrc} alt="" />
                            ) : (
                              <div className="listing-image-placeholder">No photo</div>
                            )}
                          </div>
                          <div className="conversation-info">
                            <strong>{conv.otherParticipant?.name || 'Unknown user'}</strong>
                            <div className="conversation-listing-title">{conv.listing.title}</div>
                            <div className="conversation-preview">
                              {conv.lastMessage ? conv.lastMessage.body : 'No messages yet'}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {showingCompose && (
            <>
              <div className="chat-widget-header">
                <button className="drawer-close" onClick={() => setComposing(false)} aria-label="Back">
                  <ArrowLeft size={20} />
                </button>
                <strong>New Message</strong>
                <button className="drawer-close" onClick={closeWidget} aria-label="Close">
                  <X size={20} />
                </button>
              </div>
              <div className="chat-widget-body">
                <input
                  type="text"
                  className="widget-search-input"
                  placeholder="Search listings to message a seller..."
                  value={composeSearch}
                  onChange={(e) => setComposeSearch(e.target.value)}
                  autoFocus
                />

                {composeLoading ? (
                  <p className="loading widget-empty">Searching...</p>
                ) : composeResults.length === 0 ? (
                  <p className="empty-state widget-empty">No listings found.</p>
                ) : (
                  <div className="widget-conversation-list">
                    {composeResults.map((listing) => {
                      const imageSrc = resolveImageUrl(listing.image_url);
                      return (
                        <button
                          key={listing.id}
                          className="widget-conversation-item"
                          onClick={() => pickListingToMessage(listing)}
                        >
                          <div className="conversation-thumb">
                            {imageSrc ? (
                              <img src={imageSrc} alt="" />
                            ) : (
                              <div className="listing-image-placeholder">No photo</div>
                            )}
                          </div>
                          <div className="conversation-info">
                            <strong>{listing.seller?.name || 'Unknown seller'}</strong>
                            <div className="conversation-listing-title">{listing.title}</div>
                            <div className="conversation-preview">GHS {Number(listing.price).toFixed(2)}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {view === 'chat' && (
            <>
              <div className="chat-widget-header">
                <button className="drawer-close" onClick={backToList} aria-label="Back to messages">
                  <ArrowLeft size={20} />
                </button>
                <div className="chat-widget-title">
                  <strong>{active?.otherParticipant?.name || 'Chat'}</strong>
                  <span className="chat-subtitle">{active?.listingTitle}</span>
                </div>
                <button className="drawer-close" onClick={closeWidget} aria-label="Close">
                  <X size={20} />
                </button>
              </div>

              <div className="chat-widget-body chat-widget-messages">
                {loadingMessages ? (
                  <p className="loading">Loading...</p>
                ) : messages.length === 0 ? (
                  <p className="empty-state widget-empty">No messages yet. Say hello!</p>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender?.id === user.id || msg.sender_id === user.id;
                    return (
                      <div key={msg.id} className={`chat-bubble-row ${isMine ? 'mine' : ''}`}>
                        <div className={`chat-bubble ${isMine ? 'chat-bubble-mine' : ''}`}>{msg.body}</div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-row" onSubmit={handleSend}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  autoFocus
                />
                <button type="submit" disabled={!input.trim()}>
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
