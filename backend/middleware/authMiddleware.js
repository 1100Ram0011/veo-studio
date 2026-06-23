const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please login.' });
  }

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_in_prod');
    
    const user = await User.findOne({ id: decoded.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please login again.' });
    }

    // Check plan expiry for ProMonthly (time-limited subscription)
    if (user.planExpiry && new Date() > new Date(user.planExpiry)) {
      // ProMonthly has expired — downgrade back to Free
      user.plan = 'Free';
      user.isUnlimited = false;
      user.planExpiry = null;
      // Note: credits are NOT reset — Pack credits (if any) remain
      await user.save();
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please login again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
};

const requireCredits = (cost = 1) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: 'Not authenticated.' });

      if (user.isUnlimited) {
        return next();
      }

      if (user.credits < cost) {
        return res.status(403).json({ error: 'Insufficient credits. Please upgrade your plan.' });
      }

      // Deduct credits beforehand to prevent race conditions
      user.credits -= cost;
      await user.save();
      
      next();
    } catch (err) {
      return res.status(500).json({ error: 'Failed to process credits.' });
    }
  };
};

module.exports = { authMiddleware, requireCredits };
