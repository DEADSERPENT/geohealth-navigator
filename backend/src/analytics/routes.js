const express = require('express');
const { 
  getRiskHeatmap, 
  runScenarioAnalysis,
  getFacilityStats,
  getIncidentTrends 
} = require('./controller');

const router = express.Router();

router.get('/risk', getRiskHeatmap);
router.post('/scenario', runScenarioAnalysis);
router.get('/stats', getFacilityStats);
router.get('/trends', getIncidentTrends);

module.exports = router;
