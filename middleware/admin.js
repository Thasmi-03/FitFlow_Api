/**
 * Middleware to check if user has admin role
 * Must be used after authenticate middleware
 */
export const requireAdmin = (req, res, next) => {
  // Check if user is authenticated (should be set by authenticate middleware)
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Check if user has admin role
  if (req.user.role !== "admin") {
    return res.status(403).json({ 
      error: "Access denied. Admin permission required." 
    });
  }

  next();
};

/**
 * Middleware to check if user has styler role
 * Must be used after authenticate middleware
 */
export const requireStyler = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.role !== "styler") {
    return res.status(403).json({ 
      error: "Access denied. Styler permission required." 
    });
  }

  next();
};

/**
 * Middleware to check if user has partner role
 * Must be used after authenticate middleware
 */
export const requirePartner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.role !== "partner") {
    return res.status(403).json({ 
      error: "Access denied. Partner permission required." 
    });
  }

  next();
};

/**
 * Middleware to check if user has any of the specified roles
 * Must be used after authenticate middleware
 * @param {string[]} allowedRoles - Array of allowed roles
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${allowedRoles.join(" or ")}` 
      });
    }

    next();
  };
};

