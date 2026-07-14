const { Message, Listing, User } = require('../models');
const { Op } = require('sequelize');

const participantAttributes = ['id', 'name', 'phone'];

// Verifies the requesting user is allowed to see this conversation: they
// must be either the buyer or the listing's seller. Returns the listing
// (with seller info) if authorized, or null if not found/not permitted.
async function authorizeConversation(listingId, buyerId, requestingUserId) {
  const listing = await Listing.findByPk(listingId, {
    include: [{ model: User, as: 'seller', attributes: participantAttributes }]
  });
  if (!listing) return null;

  const isBuyer = requestingUserId === Number(buyerId);
  const isSeller = requestingUserId === listing.seller_id;
  if (!isBuyer && !isSeller) return null;

  return listing;
}

// GET /api/messages/conversations — every conversation thread the logged-in
// user is part of, either as a buyer or as the seller being messaged.
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Threads where the user is the buyer
    const asBuyer = await Message.findAll({
      where: { buyer_id: userId },
      attributes: ['listing_id', 'buyer_id'],
      group: ['listing_id', 'buyer_id']
    });

    // Threads on the user's own listings (they're the seller being messaged)
    const ownListingIds = (await Listing.findAll({ where: { seller_id: userId }, attributes: ['id'] }))
      .map((l) => l.id);

    const asSeller = ownListingIds.length
      ? await Message.findAll({
          where: { listing_id: { [Op.in]: ownListingIds } },
          attributes: ['listing_id', 'buyer_id'],
          group: ['listing_id', 'buyer_id']
        })
      : [];

    // Merge and de-duplicate (listing_id, buyer_id) pairs from both sides
    const pairMap = new Map();
    [...asBuyer, ...asSeller].forEach((m) => {
      pairMap.set(`${m.listing_id}:${m.buyer_id}`, { listingId: m.listing_id, buyerId: m.buyer_id });
    });

    const conversations = [];
    for (const { listingId, buyerId } of pairMap.values()) {
      const listing = await Listing.findByPk(listingId, {
        include: [{ model: User, as: 'seller', attributes: participantAttributes }]
      });
      if (!listing) continue;

      const buyer = await User.findByPk(buyerId, { attributes: participantAttributes });
      const lastMessage = await Message.findOne({
        where: { listing_id: listingId, buyer_id: buyerId },
        order: [['createdAt', 'DESC']]
      });

      const otherParticipant = userId === listing.seller_id ? buyer : listing.seller;

      conversations.push({
        listingId,
        buyerId,
        listing: { id: listing.id, title: listing.title, image_url: listing.image_url },
        otherParticipant,
        lastMessage: lastMessage ? { body: lastMessage.body, createdAt: lastMessage.createdAt } : null
      });
    }

    // Most recently active conversations first
    conversations.sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt) : 0;
      const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt) : 0;
      return bTime - aTime;
    });

    res.status(200).json({ success: true, data: conversations });
  } catch (err) {
    next(err);
  }
};

// GET /api/messages/:listingId/:buyerId — full message history for one thread
exports.getConversationHistory = async (req, res, next) => {
  try {
    const { listingId, buyerId } = req.params;
    const listing = await authorizeConversation(listingId, buyerId, req.user.id);

    if (!listing) {
      return res.status(403).json({ success: false, message: 'You do not have access to this conversation' });
    }

    const messages = await Message.findAll({
      where: { listing_id: listingId, buyer_id: buyerId },
      include: [{ model: User, as: 'sender', attributes: participantAttributes }],
      order: [['createdAt', 'ASC']]
    });

    const buyer = await User.findByPk(buyerId, { attributes: participantAttributes });

    res.status(200).json({
      success: true,
      data: {
        listing: { id: listing.id, title: listing.title, seller: listing.seller },
        buyer,
        messages
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports.authorizeConversation = authorizeConversation;
