import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth.service';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    AuthService.login(email, password).then(
      () => {
        // Navigate based on role or to a generic dashboard
        // const user = AuthService.getCurrentUser();
        // if (user.role === 'ngo_admin') navigate('/ngo-dashboard');
        // else if (user.role === 'funder') navigate('/funder-dashboard');
        // else navigate('/provider-dashboard');
        navigate('/dashboard'); // Simple redirect for now
        // window.location.reload(); // Optional: Reload to update nav/state
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
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
          />
        </div>
        <div>
          <button type="submit" disabled={loading}>
            {loading && <span>Logging In...</span>}
            {!loading && <span>Login</span>}
          </button>
        </div>
        {message && <div>{message}</div>}
      </form>
    </div>
  );
};

export default Login;
