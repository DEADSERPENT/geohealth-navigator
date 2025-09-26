require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Import routes
const authRoutes = require('./auth/routes');
const facilityRoutes = require('./facilities/routes');
const analyticsRoutes = require('./analytics/routes');
const routingRoutes = require('./routing/routes');

// Import SocketHandler
const SocketHandler = require('./realtime/socketHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize SocketHandler for real-time events
const socketHandler = new SocketHandler(io);

// Middleware
app.use(cors());
app.use(express.json());

// Auth Middleware (example)
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  const AuthModel = require('./auth/model');
  try {
    const user = await AuthModel.verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/facilities', authMiddleware, facilityRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/routing', authMiddleware, routingRoutes);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Geofence subscription
  socket.on('subscribe-geofence', (bbox) => {
    socket.join(`geofence-${socket.id}`);
    console.log(`User ${socket.id} subscribed to geofence`);
  });

  // Facility subscription
  socket.on('subscribe-facility', (facilityId) => {
    socket.join(`facility-${facilityId}`);
    console.log(`User ${socket.id} subscribed to facility ${facilityId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Example: emit simulated resource updates (replace with DB-driven updates)
setInterval(async () => {
  const pool = require('./database/config');
  const result = await pool.query(
    `SELECT id, available_beds FROM facilities ORDER BY RANDOM() LIMIT 1`
  );
  if (result.rows.length > 0) {
    const facility = result.rows[0];
    socketHandler.emitResourceUpdate(facility.id, {
      available_beds: facility.available_beds,
      timestamp: new Date()
    });
  }
}, 5000);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
