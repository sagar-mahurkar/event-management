import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowed }) => {
    const { user } = useContext(AuthContext);

    // Not logged in
    if (!user) return <Navigate to="/login" />;

    // Check if user's role matches allowed role(s)
    const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
