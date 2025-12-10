import { useState } from 'react';
import axios from "axios";

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('');
    const [alertMsg, setAlertMsg] = useState('');
    const [alertType, setAlertType] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setAlertType("danger");
            setAlertMsg("Passwords do not match!");
            return;
        }

        if (!role) {
            setAlertType("danger");
            setAlertMsg("Please select a role!");
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}auth/register`,
                { name, email, password, role }
            );

            console.log(response.data);

            setAlertType("success");
            setAlertMsg("Registration successful!");

            // Reset fields after success
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setRole('');

        } catch (error) {
            console.error("Registration error:", error);
            setAlertType("danger");
            setAlertMsg(error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="container d-flex justify-content-center mt-5">
            <div className="p-5 shadow rounded-3 bg-white" style={{ width: '500px' }}>

                {/* Bootstrap Alert */}
                {alertMsg && (
                    <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
                        {alertMsg}
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="alert"
                            aria-label="Close"
                            onClick={() => setAlertMsg('')}
                        ></button>
                    </div>
                )}

                <h1 className="text-center mb-4">Register</h1>

                <form onSubmit={handleSubmit}>

                    {/* Name */}
                    <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                        <label className="form-label">Email address</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-4">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Role selection */}
                    <div className="form-check pb-2">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="role"
                            value="attendee"
                            checked={role === "attendee"}
                            onChange={(e) => setRole(e.target.value)}
                        />
                        <label className="form-check-label">Attendee</label>
                    </div>

                    <div className="form-check pb-4">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="role"
                            value="organizer"
                            checked={role === "organizer"}
                            onChange={(e) => setRole(e.target.value)}
                        />
                        <label className="form-check-label">Organizer</label>
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                        Register
                    </button>
                </form>

            </div>
        </div>
    );
};

export default RegisterPage;
