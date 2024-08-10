const router = require('express').Router();
let Listing = require('../models/Listing');

// Get all listings
router.route('/').get((req, res) => {
  Listing.find()
    .then(listings => res.json(listings))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Add a new listing
router.route('/add').post((req, res) => {
  const { name, image, description, price, location, category } = req.body;
  const newListing = new Listing({ name, image, description, price, location, category });

  newListing.save()
    .then(() => res.json('Listing added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
