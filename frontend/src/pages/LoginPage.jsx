import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);  // <-- Using global login()

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alertMsg, setAlertMsg] = useState('');
    const [alertType, setAlertType] = useState(''); // success | danger

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}auth/login`,
                { email, password }
            );

            const { token, user } = res.data;

            // Use AuthContext login()
            login(token, user.role);

            // Redirect based on role
            if (user.role === "admin") navigate("/admin/dashboard");
            else if (user.role === "organizer") navigate("/organizer/dashboard");
            else navigate("/attendee/dashboard");

        } catch (error) {
            setAlertType("danger");
            setAlertMsg(error.response?.data?.message || "Invalid login details");
        }
    };

    return (
        <div className="container d-flex justify-content-center mt-5">
            <div className="p-5 shadow rounded-3 bg-white" style={{ width: '500px' }}>
                <h1 className="text-center mb-4">Login</h1>

                {/* Bootstrap Alert */}
                {alertMsg && (
                    <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
                        {alertMsg}
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="alert"
                        ></button>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="mb-3">
                        <label htmlFor="loginEmail" className="form-label">Email address</label>
                        <input
                            type="email"
                            className="form-control"
                            id="loginEmail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <div className="form-text">
                            We'll never share your email with anyone else.
                        </div>
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                        <label htmlFor="loginPassword" className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="loginPassword"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Forgot Password */}
                    <div className="mb-4 text-end">
                        <Link to="/forgot-password" className="text-decoration-none">
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Login Button */}
                    <button type="submit" className="btn btn-primary w-100 mb-3">
                        Login
                    </button>
                </form>

                {/* Register link */}
                <div className="text-center">
                    <span>Don't have an account? </span>
                    <Link to="/register" className="text-decoration-none">
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
