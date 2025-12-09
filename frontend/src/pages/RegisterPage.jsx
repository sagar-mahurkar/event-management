import { useState } from 'react';
import axios from "axios";

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('');
    const [alertMsg, setAlertMsg] = useState('');
    const [alertType, setAlertType] = useState(''); // 'success' or 'danger'

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        if (!role) {
            alert("Select a role!");
            return;
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}auth/register`, {
                name, 
                email,
                password,
                role,
            });

            setAlertType('success');
            setAlertMsg("Registration successful!");

            // alert("Registration successful!");
            console.log(response.data);

            // 🔥 RESET FORM FIELDS
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setRole('');
        } catch (error) {
            console.error("Registration error:", error);
            alert(error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="container d-flex justify-content-center mt-5">
            <div className="p-5 shadow rounded-3 bg-white" style={{ width: '500px' }}>
                {/* 🔥 Bootstrap Alert */}
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
                        <label htmlFor="nameInput" className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="nameInput"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                        <label htmlFor="emailInput" className="form-label">Email address</label>
                        <input
                            type="email"
                            className="form-control"
                            id="emailInput"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                        <label htmlFor="passwordInput" className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="passwordInput"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-4">
                        <label htmlFor="confirmPasswordInput" className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="confirmPasswordInput"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {/* Role selection */}
                    <div className="form-check pb-2">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="role"
                            id="attendeeRadio"
                            value="attendee"
                            checked={role === "attendee"}
                            onChange={(e) => setRole(e.target.value)}
                        />
                        <label className="form-check-label" htmlFor="attendeeRadio">
                            Attendee
                        </label>
                    </div>

                    <div className="form-check pb-4">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="role"
                            id="organizerRadio"
                            value="organizer"
                            checked={role === "organizer"}
                            onChange={(e) => setRole(e.target.value)}
                        />
                        <label className="form-check-label" htmlFor="organizerRadio">
                            Organizer
                        </label>
                    </div>

                    {/* Submit */}
                    <button type="submit" className="btn btn-primary w-100">
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
