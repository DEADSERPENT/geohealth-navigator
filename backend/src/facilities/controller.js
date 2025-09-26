const pool = require('../database/config');

// Get nearby facilities
const getNearbyFacilities = async (req, res) => {
  try {
    const { lat, lon, radius_m = 5000, type } = req.query;
    
    let query = `
      SELECT id, name, type, address, 
             ST_AsGeoJSON(location) as location,
             ST_Distance(location, ST_Point($1, $2)::geography) as distance_m,
             available_beds
      FROM facilities 
      WHERE ST_DWithin(location, ST_Point($1, $2)::geography, $3)
    `;
    
    const params = [lon, lat, radius_m];
    
    if (type) {
      query += ` AND type = $4`;
      params.push(type);
    }
    
    query += ` ORDER BY ST_Distance(location, ST_Point($1, $2)::geography)`;
    
    const result = await pool.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching nearby facilities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get facility by ID
const getFacilityById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT *, ST_AsGeoJSON(location) as location FROM facilities WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching facility:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create/update resource snapshot
const updateResourceSnapshot = async (req, res) => {
  try {
    const { id } = req.params;
    const { available_beds, available_icu, oxygen_liters, reporter_id, source } = req.body;
    
    // First, update facility
    await pool.query(
      `UPDATE facilities 
       SET available_beds = $1, last_updated_at = NOW() 
       WHERE id = $2`,
      [available_beds, id]
    );
    
    // Then create snapshot
    const snapshotResult = await pool.query(
      `INSERT INTO resource_snapshots 
       (facility_id, available_beds, available_icu, oxygen_liters, reporter_id, source)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, available_beds, available_icu, oxygen_liters, reporter_id, source]
    );
    
    res.json(snapshotResult.rows[0]);
  } catch (error) {
    console.error('Error updating resource snapshot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getNearbyFacilities,
  getFacilityById,
  updateResourceSnapshot
};
