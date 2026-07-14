const { Listing, User } = require('../models');
const { Op } = require('sequelize');
const { cloudinary } = require('../middleware/upload');

const sellerAttributes = ['id', 'name', 'phone', 'email'];

// GET /api/listings — public, supports ?category=, ?status=, and ?search= filters
exports.getAllListings = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;
    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      // Case-insensitive partial match on title or description
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const listings = await Listing.findAll({
      where,
      include: [{ model: User, as: 'seller', attributes: sellerAttributes }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, count: listings.length, data: listings });
  } catch (err) {
    next(err);
  }
};

// GET /api/listings/:id — public
exports.getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id, {
      include: [{ model: User, as: 'seller', attributes: sellerAttributes }]
    });
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    res.status(200).json({ success: true, data: listing });
  } catch (err) {
    next(err);
  }
};

// POST /api/listings — protected: the seller_id is taken from the logged-in user,
// never trusted from the request body, so no one can post as someone else.
exports.createListing = async (req, res, next) => {
  try {
    const { title, description, price, category, item_condition } = req.body;
    const image_url = req.file ? req.file.path : null; // Cloudinary's secure URL
    const image_public_id = req.file ? req.file.filename : null; // Cloudinary's public_id

    const listing = await Listing.create({
      title,
      description,
      price,
      category,
      item_condition,
      image_url,
      image_public_id,
      seller_id: req.user.id
    });

    const withSeller = await Listing.findByPk(listing.id, {
      include: [{ model: User, as: 'seller', attributes: sellerAttributes }]
    });

    res.status(201).json({ success: true, data: withSeller });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ success: false, errors: err.errors.map((e) => e.message) });
    }
    next(err);
  }
};

// PUT /api/listings/:id — protected: only the listing's owner (or an admin) can edit it
exports.updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const isOwner = listing.seller_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You can only edit your own listings' });
    }

    const allowedFields = ['title', 'description', 'price', 'category', 'item_condition', 'status'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (req.file) {
      // Remove the old image from Cloudinary so replaced photos don't pile up
      if (listing.image_public_id) {
        cloudinary.uploader.destroy(listing.image_public_id).catch(() => {}); // best-effort
      }
      updates.image_url = req.file.path;
      updates.image_public_id = req.file.filename;
    }

    await listing.update(updates);

    const withSeller = await Listing.findByPk(listing.id, {
      include: [{ model: User, as: 'seller', attributes: sellerAttributes }]
    });

    res.status(200).json({ success: true, data: withSeller });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ success: false, errors: err.errors.map((e) => e.message) });
    }
    next(err);
  }
};

// DELETE /api/listings/:id — protected: only the owner (or admin) can delete it
exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const isOwner = listing.seller_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You can only delete your own listings' });
    }

    await listing.destroy();

    if (listing.image_public_id) {
      cloudinary.uploader.destroy(listing.image_public_id).catch(() => {}); // best-effort cleanup
    }

    res.status(200).json({ success: true, message: 'Listing deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /api/listings/mine — protected: the logged-in user's own listings
exports.getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.findAll({
      where: { seller_id: req.user.id },
      include: [{ model: User, as: 'seller', attributes: sellerAttributes }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, count: listings.length, data: listings });
  } catch (err) {
    next(err);
  }
};
