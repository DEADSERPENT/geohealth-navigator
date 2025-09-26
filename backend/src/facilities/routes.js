const express = require('express');
const { 
  getNearbyFacilities, 
  getFacilityById, 
  updateResourceSnapshot 
} = require('./controller');

const router = express.Router();

router.get('/nearby', getNearbyFacilities);
router.get('/:id', getFacilityById);
router.post('/:id/snapshot', updateResourceSnapshot);

module.exports = router;
