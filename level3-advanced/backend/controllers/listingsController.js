const { Listing, User } = require('../models');
const { Op } = require('sequelize');
const { cloudinary } = require('../middleware/upload');

const sellerAttributes = ['id', 'name', 'phone', 'email'];

// Turns the raw multer/Cloudinary file list into an ordered array of
// { url, public_id }, with whichever one the seller picked as the cover
// moved to index 0. Everything downstream (image_url, image_public_id,
// gallery_images) is derived from this order.
function buildGalleryImages(files, coverIndexRaw) {
  if (!files || files.length === 0) return [];

  const images = files.map((f) => ({ url: f.path, public_id: f.filename }));

  let coverIndex = parseInt(coverIndexRaw, 10);
  if (Number.isNaN(coverIndex) || coverIndex < 0 || coverIndex >= images.length) {
    coverIndex = 0;
  }
  if (coverIndex === 0) return images;

  const [cover] = images.splice(coverIndex, 1);
  return [cover, ...images];
}

// Best-effort delete of every photo in a listing's gallery from Cloudinary.
function destroyGalleryImages(galleryImages) {
  (galleryImages || []).forEach((img) => {
    if (img?.public_id) cloudinary.uploader.destroy(img.public_id).catch(() => {});
  });
}

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
    const { title, description, price, category, item_condition, custom_category, cover_index } = req.body;

    if (category === 'other' && !custom_category?.trim()) {
      return res.status(400).json({ success: false, message: 'Please type a category name for "Other"' });
    }

    const files = req.files || [];
    const galleryImages = buildGalleryImages(files, cover_index);

    const listing = await Listing.create({
      title,
      description,
      price,
      category,
      custom_category: category === 'other' ? custom_category.trim() : null,
      item_condition,
      image_url: galleryImages[0]?.url || null,
      image_public_id: galleryImages[0]?.public_id || null,
      gallery_images: galleryImages,
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

    const effectiveCategory = updates.category !== undefined ? updates.category : listing.category;
    if (req.body.custom_category !== undefined || updates.category !== undefined) {
      if (effectiveCategory === 'other') {
        if (!req.body.custom_category?.trim()) {
          return res.status(400).json({ success: false, message: 'Please type a category name for "Other"' });
        }
        updates.custom_category = req.body.custom_category.trim();
      } else {
        updates.custom_category = null;
      }
    }

    // Uploading new photos replaces the whole gallery — there's no partial
    // add/remove of individual existing photos, to keep the upload widget
    // simple on the frontend.
    if (req.files && req.files.length > 0) {
      destroyGalleryImages(listing.gallery_images); // best-effort cleanup of the old set
      if (listing.image_public_id && !(listing.gallery_images || []).some((img) => img.public_id === listing.image_public_id)) {
        cloudinary.uploader.destroy(listing.image_public_id).catch(() => {});
      }
      const galleryImages = buildGalleryImages(req.files, req.body.cover_index);
      updates.gallery_images = galleryImages;
      updates.image_url = galleryImages[0]?.url || null;
      updates.image_public_id = galleryImages[0]?.public_id || null;
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

    destroyGalleryImages(listing.gallery_images);
    // Fallback for listings created before gallery_images existed, where
    // the cover photo isn't duplicated into the gallery array.
    if (listing.image_public_id && !(listing.gallery_images || []).some((img) => img.public_id === listing.image_public_id)) {
      cloudinary.uploader.destroy(listing.image_public_id).catch(() => {});
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
