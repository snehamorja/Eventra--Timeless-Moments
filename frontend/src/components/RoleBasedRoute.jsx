import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../services/api';

const RoleBasedRoute = ({ allowedRoles, redirectPath = "/login" }) => {
    const token = localStorage.getItem('access_token');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        api.get('/profile/')
            .then(res => {
                setUser(res.data);
                setLoading(false);
            })
            .catch(() => {
                localStorage.removeItem('access_token');
                setUser(null);
                setLoading(false);
            });
    }, [token]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fff' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #C4A059', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const publicPaths = ['/', '/about', '/gallery', '/events', '/blog', '/catering', '/concerts', '/festivals', '/sports'];
    const isActuallyPublic = allowedRoles.includes('USER') && (publicPaths.includes(window.location.pathname) || window.location.pathname.startsWith('/blog/'));

    if (!token) {
        if (isActuallyPublic) return <Outlet />;
        // Save the current path to redirect back after login
        return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
    }

    const roleStr = (user?.role || '').toUpperCase();
    const isAdmin = roleStr === 'ADMIN' || user?.is_staff || user?.is_superuser;
    const userRole = isAdmin ? 'ADMIN' : 'USER';

    if (!allowedRoles.includes(userRole)) {
        // If an Admin tries to access a restricted User area, let them go to Dashboard
        // If a User tries to access Admin area, take them Home
        if (userRole === 'ADMIN' && window.location.pathname === '/login') {
            return <Navigate to="/admin-dashboard" replace />;
        }
        return <Navigate to={userRole === 'ADMIN' ? '/admin-dashboard' : '/'} replace />;
    }

    return <Outlet />;
};

export default RoleBasedRoute;
