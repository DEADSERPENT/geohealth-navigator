const pool = require('../database/config');

class AdminModel {
  static async getAuditLogs(filters = {}) {
    const { user_id, action, resource_type, start_date, end_date, limit = 100 } = filters;
    
    let query = `
      SELECT al.*, u.name as user_name, u.email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (user_id) {
      query += ` AND al.user_id = $${paramIndex++}`;
      params.push(user_id);
    }
    
    if (action) {
      query += ` AND al.action = $${paramIndex++}`;
      params.push(action);
    }
    
    if (resource_type) {
      query += ` AND al.resource_type = $${paramIndex++}`;
      params.push(resource_type);
    }
    
    if (start_date) {
      query += ` AND al.timestamp >= $${paramIndex++}`;
      params.push(start_date);
    }
    
    if (end_date) {
      query += ` AND al.timestamp <= $${paramIndex++}`;
      params.push(end_date);
    }
    
    query += ` ORDER BY al.timestamp DESC LIMIT $${paramIndex++}`;
    params.push(limit);
    
    const result = await pool.query(query, params);
    return result.rows;
  }
  
  static async getSystemStats() {
    const stats = {};
    
    // Total facilities
    const facilities = await pool.query('SELECT COUNT(*) as count FROM facilities');
    stats.total_facilities = parseInt(facilities.rows[0].count);
    
    // Total users
    const users = await pool.query('SELECT COUNT(*) as count FROM users');
    stats.total_users = parseInt(users.rows[0].count);
    
    // Recent incidents
    const incidents = await pool.query(
      "SELECT COUNT(*) as count FROM incidents WHERE reported_at > NOW() - INTERVAL '7 days'"
    );
    stats.recent_incidents = parseInt(incidents.rows[0].count);
    
    // Active facilities (updated in last 24h)
    const active = await pool.query(
      "SELECT COUNT(*) as count FROM facilities WHERE last_updated_at > NOW() - INTERVAL '24 hours'"
    );
    stats.active_facilities = parseInt(active.rows[0].count);
    
    return stats;
  }
  
  static async logAuditAction(userId, action, resourceType, resourceId, details, ipAddress) {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, action, resourceType, resourceId, details, ipAddress]
    );
  }
}

module.exports = AdminModel;
