import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const ChatWidgetContext = createContext(null);

export function ChatWidgetProvider({ children }) {
  const { user } = useAuth();
  const socket = useSocket();

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'chat'
  const [conversations, setConversations] = useState([]);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const [active, setActive] = useState(null); // { listingId, buyerId, otherParticipant, listingTitle }
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  function loadConversations() {
    api.getConversations()
      .then((res) => setConversations(res.data))
      .catch(() => {})
      .finally(() => setConversationsLoaded(true));
  }

  function toggleWidget() {
    setIsOpen((open) => {
      const next = !open;
      if (next && !conversationsLoaded) loadConversations();
      return next;
    });
  }

  function closeWidget() {
    setIsOpen(false);
  }

  function backToList() {
    setView('list');
    setActive(null);
    loadConversations(); // refresh previews in case anything changed
  }

  // Opens the widget directly into a specific conversation thread — used
  // both by clicking a conversation in the list and by "Chat with Seller"
  // on a listing page, so starting a new chat never requires a full page
  // navigation.
  async function openConversationThread({ listingId, buyerId, otherParticipant, listingTitle }) {
    const numericListingId = Number(listingId);
    const numericBuyerId = Number(buyerId);

    setActive({ listingId: numericListingId, buyerId: numericBuyerId, otherParticipant, listingTitle });
    setView('chat');
    setIsOpen(true);
    setLoadingMessages(true);

    try {
      const res = await api.getConversationHistory(listingId, buyerId);
      setMessages(res.data.messages);

      // Fill in participant/title info if the caller didn't already have it
      if (!otherParticipant) {
        const isBuyer = user.id === numericBuyerId;
        setActive((prev) => ({
          ...prev,
          otherParticipant: isBuyer ? res.data.listing.seller : res.data.buyer,
          listingTitle: res.data.listing.title
        }));
      }
    } catch (err) {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }

  // Join the active thread's socket room and listen for live messages
  useEffect(() => {
    if (!socket || !active) return;

    socket.emit('join_conversation', { listingId: active.listingId, buyerId: active.buyerId });

    function handleNewMessage(message) {
      const sameThread = message.listing_id === active.listingId && message.buyer_id === active.buyerId;
      if (sameThread) {
        setMessages((prev) => [...prev, message]);
      }
      // Keep the list view's preview text current even while a different
      // conversation happens to be open
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.listingId === message.listing_id && c.buyerId === message.buyer_id);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], lastMessage: { body: message.body, createdAt: message.createdAt } };
        return updated;
      });
    }

    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, [socket, active]);

  function sendMessage(body) {
    if (!socket || !active || !body.trim()) return;
    socket.emit('send_message', { listingId: active.listingId, buyerId: active.buyerId, body: body.trim() }, (res) => {
      if (!res?.success) alert(res?.message || 'Could not send message');
    });
  }

  const value = {
    isOpen,
    view,
    conversations,
    active,
    messages,
    loadingMessages,
    toggleWidget,
    closeWidget,
    backToList,
    openConversationThread,
    sendMessage
  };

  return <ChatWidgetContext.Provider value={value}>{children}</ChatWidgetContext.Provider>;
}

export function useChatWidget() {
  return useContext(ChatWidgetContext);
}
