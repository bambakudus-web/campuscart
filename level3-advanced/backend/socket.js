const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { Message, User } = require('./models');
const { authorizeConversation } = require('./controllers/messagesController');

function conversationRoom(listingId, buyerId) {
  return `listing:${listingId}:buyer:${buyerId}`;
}

function initSocket(httpServer, corsOrigin) {
  const io = new Server(httpServer, {
    cors: { origin: corsOrigin, credentials: true }
  });

  // Authenticate the socket connection using the same JWT the REST API uses,
  // sent via the client's `auth: { token }` option on connect.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, email, role }
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: user ${socket.user.id}`);

    // Client asks to join a specific conversation thread before sending
    // or receiving messages for it.
    socket.on('join_conversation', async ({ listingId, buyerId }, callback) => {
      try {
        const listing = await authorizeConversation(listingId, buyerId, socket.user.id);
        if (!listing) {
          return callback?.({ success: false, message: 'Not authorized for this conversation' });
        }
        socket.join(conversationRoom(listingId, buyerId));
        callback?.({ success: true });
      } catch (err) {
        callback?.({ success: false, message: 'Server error joining conversation' });
      }
    });

    // Client sends a new chat message. We verify authorization again here
    // (never trust the client just because it joined a room earlier), save
    // it to the database, then broadcast it to everyone in that room.
    socket.on('send_message', async ({ listingId, buyerId, body }, callback) => {
      try {
        if (!body || !body.trim()) {
          return callback?.({ success: false, message: 'Message cannot be empty' });
        }

        const listing = await authorizeConversation(listingId, buyerId, socket.user.id);
        if (!listing) {
          return callback?.({ success: false, message: 'Not authorized for this conversation' });
        }

        const message = await Message.create({
          listing_id: listingId,
          buyer_id: buyerId,
          sender_id: socket.user.id,
          body: body.trim()
        });

        const sender = await User.findByPk(socket.user.id, { attributes: ['id', 'name', 'phone'] });
        const payload = {
          id: message.id,
          body: message.body,
          createdAt: message.createdAt,
          listing_id: Number(listingId),
          buyer_id: Number(buyerId),
          sender
        };

        io.to(conversationRoom(listingId, buyerId)).emit('new_message', payload);
        callback?.({ success: true });
      } catch (err) {
        console.error('❌ send_message error:', err.message);
        callback?.({ success: false, message: 'Could not send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: user ${socket.user.id}`);
    });
  });

  return io;
}

module.exports = initSocket;
