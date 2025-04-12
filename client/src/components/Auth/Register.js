import React, { useState } from 'react';
import AuthService from '../../services/auth.service';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ngo_admin'); // Default role
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    AuthService.register(email, password, role).then(
      (response) => {
        setMessage(response.data.message);
        setLoading(false);
        // Optionally redirect to login page or show success message
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        setMessage(resMessage);
        setLoading(false);
      }
    );
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6" // Add basic validation
          />
        </div>
         <div>
          <label htmlFor="role">Register As:</label>
          <select name="role" value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="ngo_admin">NGO</option>
              <option value="funder">Funder</option>
              <option value="service_provider">Service Provider</option>
          </select>
        </div>
        <div>
          <button type="submit" disabled={loading}>
            {loading && <span>Signing Up...</span>}
            {!loading && <span>Sign Up</span>}
          </button>
        </div>
        {message && <div>{message}</div>}
      </form>
    </div>
  );
};

export default Register;
