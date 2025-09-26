const pool = require('../database/config');


class SocketHandler {
  constructor(io) {
    this.io = io;
    this.setupSocketEvents();
  }

  setupSocketEvents() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Subscribe to geofence updates
      socket.on('subscribe-geofence', async (data) => {
        const { bbox } = data; // [minLon, minLat, maxLon, maxLat]
        socket.join(`geofence-${socket.id}`);
        
        // Send initial facilities in geofence
        try {
          const facilities = await this.getFacilitiesInBbox(bbox);
          socket.emit('geofence-update', { type: 'initial', facilities });
        } catch (error) {
          console.error('Error fetching initial facilities:', error);
        }
      });

      // Subscribe to facility updates
      socket.on('subscribe-facility', (facilityId) => {
        socket.join(`facility-${facilityId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }

  // Emit resource update to relevant rooms
  async emitResourceUpdate(facilityId, updateData) {
    // Get facility location for geofence routing
    const result = await pool.query(
      'SELECT ST_X(location) as lon, ST_Y(location) as lat FROM facilities WHERE id = $1',
      [facilityId]
    );
    
    if (result.rows.length > 0) {
      const { lon, lat } = result.rows[0];
      
      // Emit to specific facility room
      this.io.to(`facility-${facilityId}`).emit('resource-update', {
        facility_id: facilityId,
        ...updateData
      });
      
      // Emit to nearby geofences (simplified - in real app, check which geofences overlap)
      this.io.emit('geofence-update', {
        type: 'update',
        facility: { id: facilityId, lon, lat, ...updateData }
      });
    }
  }

  // Emit incident report
  emitIncident(incidentData) {
    this.io.emit('new-incident', incidentData);
  }

  // Get facilities within bounding box
  async getFacilitiesInBbox(bbox) {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    
    const result = await pool.query(
      `SELECT id, name, type, 
              ST_X(location) as lon, ST_Y(location) as lat,
              available_beds, last_updated_at
       FROM facilities 
       WHERE location && ST_MakeEnvelope($1, $2, $3, $4, 4326)`,
      [minLon, minLat, maxLon, maxLat]
    );
    
    return result.rows;
  }
}

module.exports = SocketHandler;
