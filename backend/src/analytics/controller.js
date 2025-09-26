const AnalyticsModel = require('./model');

const getRiskHeatmap = async (req, res) => {
  try {
    const { bbox } = req.query; // "minLon,minLat,maxLon,maxLat"
    if (!bbox) {
      return res.status(400).json({ error: 'bbox parameter required' });
    }
    
    const bboxArray = bbox.split(',').map(Number);
    const heatmap = await AnalyticsModel.getRiskHeatmap(bboxArray);
    
    res.json({
      type: 'FeatureCollection',
      features: heatmap.map(item => ({
        type: 'Feature',
        geometry: item.geometry,
        properties: {
          grid_id: item.grid_id,
          population_density: item.population_density,
          risk_score: item.risk_score,
          last_calculated: item.last_calculated
        }
      }))
    });
  } catch (error) {
    console.error('Risk heatmap error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const runScenarioAnalysis = async (req, res) => {
  try {
    const { location, service_radius = 30000 } = req.body;
    
    if (!location || !location.lon || !location.lat) {
      return res.status(400).json({ error: 'Valid location required' });
    }
    
    const analysis = await AnalyticsModel.runScenarioAnalysis(
      location, 
      service_radius
    );
    
    res.json(analysis);
  } catch (error) {
    console.error('Scenario analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getFacilityStats = async (req, res) => {
  try {
    const { time_range } = req.query;
    const stats = await AnalyticsModel.getFacilityStats(time_range);
    res.json(stats);
  } catch (error) {
    console.error('Facility stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getIncidentTrends = async (req, res) => {
  try {
    const { disease_code, time_range } = req.query;
    const trends = await AnalyticsModel.getIncidentTrends(disease_code, time_range);
    res.json(trends);
  } catch (error) {
    console.error('Incident trends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getRiskHeatmap,
  runScenarioAnalysis,
  getFacilityStats,
  getIncidentTrends
};
