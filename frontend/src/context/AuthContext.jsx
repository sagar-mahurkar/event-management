import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user on refresh
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);   // ← FULL USER OBJECT
                setToken(storedToken);
            } catch (err) {
                console.error("Failed to parse stored user:", err);
            }
        }
        setLoading(false);
    }, []);

    // Login saves full user data
    const login = (token, fullUser) => {
        localStorage.setItem("user", JSON.stringify(fullUser)); // ← SAVE FULL USER
        localStorage.setItem("token", token);
        setUser(fullUser);
        setToken(token);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
