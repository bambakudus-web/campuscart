const express = require('express');
const router = express.Router();
const {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings
} = require('../controllers/listingsController');
const { requireAuth } = require('../middleware/auth');

// Public routes — anyone can browse
router.get('/', getAllListings);

// Protected — must come before /:id so "mine" isn't treated as an ID
router.get('/mine', requireAuth, getMyListings);

router.get('/:id', getListingById);

// Protected routes — must be logged in
router.post('/', requireAuth, createListing);
router.put('/:id', requireAuth, updateListing);
router.delete('/:id', requireAuth, deleteListing);

module.exports = router;
