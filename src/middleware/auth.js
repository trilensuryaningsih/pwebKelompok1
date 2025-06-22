const requireAuth = (req, res, next) => {
    console.log('=== AUTH MIDDLEWARE CHECK ===');
    console.log('Session ID:', req.sessionID);
    console.log('Session exists:', !!req.session);
    console.log('Session user:', req.session?.user);
    console.log('Session destroyed:', req.session?.destroyed);
    
    // Check if user is authenticated
    if (!req.session || !req.session.user || req.session.destroyed) {
        console.log('❌ User not authenticated, redirecting to login');
        
        // Clear any remaining cookies
        res.clearCookie('connect.sid', { path: '/' });
        res.clearCookie('sessionId', { path: '/' });
        res.clearCookie('user_session', { path: '/' });
        
        // Set no-cache headers
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
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
    console.log('✅ User authenticated:', req.session.user.email);
    next();
};

const requireRole = (roles) => {
    return (req, res, next) => {
        console.log('=== ROLE MIDDLEWARE CHECK ===');
        console.log('Session ID:', req.sessionID);
        console.log('Session user:', req.session?.user);
        console.log('Required roles:', roles);
        console.log('Session destroyed:', req.session?.destroyed);
        
        if (!req.session || !req.session.user || req.session.destroyed) {
            console.log('❌ User not authenticated in requireRole, redirecting to login');
            
            // Clear any remaining cookies
            res.clearCookie('connect.sid', { path: '/' });
            res.clearCookie('sessionId', { path: '/' });
            res.clearCookie('user_session', { path: '/' });
            
            return res.redirect('/auth/login');
        }
        
        if (!roles.includes(req.session.user.role)) {
            console.log('❌ User role not authorized:', req.session.user.role);
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
        console.log('✅ User role authorized:', req.session.user.role);
        next();
    };
};

module.exports = {
    requireAuth,
    requireRole
}; 