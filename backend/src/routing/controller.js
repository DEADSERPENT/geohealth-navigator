// src/routing/controller.js
const pool = require('../database/config'); // corrected path to your DB config

exports.estimateRoute = async (req, res) => {
  const { origin, destination_id } = req.body;

  if (!origin || !destination_id) {
    return res.status(400).json({ error: 'origin and destination_id are required' });
  }

  try {
    // 1. Get the destination facility from DB
    const facilityResult = await pool.query(
      'SELECT id, name, ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude FROM facilities WHERE id = $1',
      [destination_id]
    );

    if (facilityResult.rows.length === 0) {
      return res.status(404).json({ error: 'Destination facility not found' });
    }

    const destination = facilityResult.rows[0];

    // 2. Calculate a dummy distance/time for now
    const distanceKm = Math.sqrt(
      Math.pow(origin.lat - destination.latitude, 2) +
      Math.pow(origin.lon - destination.longitude, 2)
    ) * 111; // rough km conversion
    const estimatedTimeMin = (distanceKm / 40) * 60; // assume avg speed 40 km/h

    // 3. Return response
    res.json({
      origin,
      destination: {
        id: destination.id,
        name: destination.name,
        lat: destination.latitude,
        lon: destination.longitude,
      },
      estimate: {
        distance_km: distanceKm.toFixed(2),
        time_min: estimatedTimeMin.toFixed(1),
      }
    });

  } catch (err) {
    console.error('Error estimating route:', err);
    res.status(500).json({ error: 'Server error while estimating route' });
  }
};
