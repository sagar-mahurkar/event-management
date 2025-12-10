import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Load user on refresh
    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);   // ← FULL USER OBJECT
            } catch (err) {
                console.error("Failed to parse stored user:", err);
            }
        }
    }, []);

    // Login saves full user data
    const login = (token, fullUser) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(fullUser)); // ← SAVE FULL USER
        setUser(fullUser);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
