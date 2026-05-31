import { Navigate } from 'react-router-dom';

export function AuthRoute({ session, redirectTo = '/', children }) {
    if (session?.token) {
        return <Navigate to={redirectTo} replace />;
    }

    return children;
}
