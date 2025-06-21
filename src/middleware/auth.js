const requireAuth = (req, res, next) => {
    // Check if user is authenticated
    if (!req.session || !req.session.user) {
        // If it's an API request, return JSON response
        if (req.xhr || req.headers.accept && req.headers.accept.indexOf('json') > -1) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        // If it's a page request, redirect to login
        return res.redirect('/auth/login');
    }

    // Refresh session on each request to extend its lifetime
    if (req.session.user && req.session.user.loginTime) {
        req.session.user.loginTime = new Date();
        req.session.touch(); // Extends the session
    }

    next();
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.redirect('/auth/login');
        }
        
        if (!roles.includes(req.session.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Refresh session on each request to extend its lifetime
        if (req.session.user && req.session.user.loginTime) {
            req.session.user.loginTime = new Date();
            req.session.touch(); // Extends the session
        }

        next();
    };
};

// Middleware to refresh session periodically
const refreshSession = (req, res, next) => {
    if (req.session && req.session.user) {
        // Update session timestamp every 5 minutes
        const now = Date.now();
        const lastUpdate = req.session.lastUpdate || 0;
        const fiveMinutes = 5 * 60 * 1000;

        if (now - lastUpdate > fiveMinutes) {
            req.session.lastUpdate = now;
            req.session.touch();
        }
    }
    next();
};

module.exports = {
    requireAuth,
    requireRole,
    refreshSession
}; 