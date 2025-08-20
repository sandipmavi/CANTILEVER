const jwt = require('jsonwebtoken');
const User = require('../models/User');

// In-memory storage for WebContainer environment
const users = new Map();
const tasks = new Map();
let userIdCounter = 1;
let taskIdCounter = 1;

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // In WebContainer, we'll use in-memory storage
    const user = users.get(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

module.exports = { auth, users, tasks, userIdCounter, taskIdCounter };