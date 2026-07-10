const express = require('express');
const router = express.Router();
const {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing
} = require('../controllers/listingsController');

router.get('/', getAllListings);
router.get('/:id', getListingById);
router.post('/', createListing);
router.put('/:id', updateListing);
router.delete('/:id', deleteListing);

module.exports = router;
