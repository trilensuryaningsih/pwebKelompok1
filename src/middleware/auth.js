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
    next();
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.redirect('/auth/login');
        }
        
        if (!roles.includes(req.session.user.role)) {
            // If it's an API request, return JSON response
            if (req.xhr || req.headers.accept && req.headers.accept.indexOf('json') > -1) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
            // If it's a page request, redirect based on user role
            if (req.session.user.role === 'admin') {
                return res.redirect('/admin');
            } else if (req.session.user.role === 'user') {
                return res.redirect('/user/home');
            } else {
                return res.redirect('/auth/login');
            }
        }
        next();
    };
};

module.exports = {
    requireAuth,
    requireRole
}; 