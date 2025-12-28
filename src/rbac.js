function requireRole(allowedRoles) {
  const allow = new Set(allowedRoles);

  return (req, res, next) => {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    if (!allow.has(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

module.exports = { requireRole };
