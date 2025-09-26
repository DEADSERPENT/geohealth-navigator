const pool = require('../database/config');

class AnalyticsModel {
  // Get risk heatmap data
  static async getRiskHeatmap(bbox) {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    
    const result = await pool.query(
      `SELECT grid_id, 
              ST_AsGeoJSON(geom) as geometry,
              population_density,
              risk_score,
              last_calculated
       FROM risk_grids 
       WHERE geom && ST_MakeEnvelope($1, $2, $3, $4, 4326)
       ORDER BY risk_score DESC`,
      [minLon, minLat, maxLon, maxLat]
    );
    
    return result.rows.map(row => ({
      ...row,
      geometry: JSON.parse(row.geometry)
    }));
  }

  // Run scenario analysis
  static async runScenarioAnalysis(newFacilityLocation, serviceRadius = 30000) {
    const { lon, lat } = newFacilityLocation;
  
    // Calculate current coverage
    const currentCoverage = await pool.query(
      `SELECT COUNT(*) as covered_population
       FROM risk_grids 
       WHERE ST_DWithin(geom, ST_Point($1, $2)::geography, $3)`,
      [lon, lat, serviceRadius]
    );
    
    // Get population that would be newly covered
    const newCoverage = await pool.query(
      `SELECT SUM(population_density * ST_Area(geom::geography) / 1000000) as newly_covered_population
       FROM risk_grids 
       WHERE ST_DWithin(geom, ST_Point($1, $2)::geography, $3)
       AND NOT EXISTS (
         SELECT 1 FROM facilities f 
         WHERE ST_DWithin(f.location, risk_grids.geom, $3)
       )`,
      [lon, lat, serviceRadius]
    );
    
    return {
      current_coverage: parseInt(currentCoverage.rows[0].covered_population),
      newly_covered: parseFloat(newCoverage.rows[0].newly_covered_population) || 0,
      impact_score: parseFloat(newCoverage.rows[0].newly_covered_population) || 0
    };
  }

  // Get facility utilization stats
  static async getFacilityStats(timeRange = '7 days') {
    const result = await pool.query(
      `SELECT f.type,
              AVG(
                CASE 
                  WHEN f.capacity_total > 0 
                  THEN rs.available_beds * 100.0 / f.capacity_total 
                  ELSE NULL 
                END
              ) as avg_utilization,
              COUNT(*) as facility_count
       FROM facilities f
       JOIN resource_snapshots rs ON f.id = rs.facility_id
       WHERE rs.snapshot_time > NOW() - INTERVAL '${timeRange}'
       GROUP BY f.type`
    );
    
    return result.rows;
  }

  // Get incident trends
  static async getIncidentTrends(diseaseCode = null, timeRange = '30 days') {
    let query = `
      SELECT DATE_TRUNC('day', reported_at) as date,
             COUNT(*) as incident_count,
             disease_code
      FROM incidents 
      WHERE reported_at > NOW() - INTERVAL '${timeRange}'
    `;
    
    const params = [];
    if (diseaseCode) {
      query += ` AND disease_code = $1`;
      params.push(diseaseCode);
    }
    
    query += ` GROUP BY DATE_TRUNC('day', reported_at), disease_code
               ORDER BY date`;
    
    const result = await pool.query(query, params);
    return result.rows;
  }
}

module.exports = AnalyticsModel;
