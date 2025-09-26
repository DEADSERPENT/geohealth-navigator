const AuthModel = require('./model');

// Register
const register = async (req, res) => {
  try {
    const userData = req.body;
    if (!userData.email || !userData.password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await AuthModel.register(userData);
    res.status(201).json({ user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await AuthModel.login(email, password);
    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
};

// Verify token
const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = await AuthModel.verifyToken(token);
    res.json({ user: decoded });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { register, login, verifyToken };
