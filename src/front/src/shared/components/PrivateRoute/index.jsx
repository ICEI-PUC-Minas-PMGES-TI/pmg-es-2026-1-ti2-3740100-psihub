import { Navigate, useLocation } from 'react-router-dom';

function normalizeRouteRole(role = '') {
    return String(role || '').toLowerCase();
}

export function PrivateRoute({ session, allowedRoles, children }) {
    const location = useLocation();

    if (!session?.token) {
        return <Navigate to="/auth/login" replace state={{ from: location }} />;
    }

    const role = normalizeRouteRole(session.tipo);
    const allowed = allowedRoles.map(normalizeRouteRole);

    if (!allowed.includes(role)) {
        return <Navigate to="/forbidden" replace />;
    }

    return children;
}
