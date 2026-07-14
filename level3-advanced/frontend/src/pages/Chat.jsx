import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Chat() {
  const { listingId, buyerId } = useParams();
  const { user } = useAuth();
  const socket = useSocket();

  const [listing, setListing] = useState(null);
  const [otherParticipant, setOtherParticipant] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);

  const messagesEndRef = useRef(null);

  // Load message history over REST first
  useEffect(() => {
    setLoading(true);
    api.getConversationHistory(listingId, buyerId)
      .then((res) => {
        setListing(res.data.listing);
        setMessages(res.data.messages);
        const isBuyer = user.id === Number(buyerId);
        setOtherParticipant(isBuyer ? res.data.listing.seller : res.data.buyer);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [listingId, buyerId, user.id]);

  // Join the Socket.io room for this conversation, and listen for new messages
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_conversation', { listingId, buyerId }, (res) => {
      if (res?.success) setJoined(true);
    });

    function handleNewMessage(message) {
      const sameThread = message.listing_id === Number(listingId) && message.buyer_id === Number(buyerId);
      if (sameThread) {
        setMessages((prev) => [...prev, message]);
      }
    }

    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, [socket, listingId, buyerId]);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    socket.emit('send_message', { listingId, buyerId, body: input.trim() }, (res) => {
      if (!res?.success) {
        alert(res?.message || 'Could not send message');
      }
    });
    setInput('');
  }

  if (loading) return <p className="loading container">Loading conversation...</p>;
  if (error) return <p className="empty-state container">{error}</p>;

  return (
    <section className="chat-page container">
      <Link to="/messages" className="back-link">&larr; Back to messages</Link>

      <div className="chat-panel">
        <div className="chat-header">
          <div>
            <strong>{otherParticipant?.name || 'Unknown user'}</strong>
            <span className="chat-subtitle">about "{listing?.title}"</span>
          </div>
          {!joined && <span className="chat-status">Connecting...</span>}
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
            <p className="empty-state">No messages yet. Say hello!</p>
          )}
          {messages.map((msg) => {
            const isMine = msg.sender?.id === user.id || msg.sender_id === user.id;
            return (
              <div key={msg.id} className={`chat-bubble-row ${isMine ? 'mine' : ''}`}>
                <div className={`chat-bubble ${isMine ? 'chat-bubble-mine' : ''}`}>
                  {msg.body}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-row" onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={!socket}
          />
          <button type="submit" disabled={!socket || !input.trim()}>Send</button>
        </form>
      </div>
    </section>
  );
}
